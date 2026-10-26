"""Workspace-scoped, canonical-deduplicated direct-provider cloning sources."""
import json
import math
import os
import re
from itertools import zip_longest

from studio.models import Conflict, GenerationSource, Page, ValidationError, check_page
from studio.storage import open_directory, read_regular
from studio.workspaces import require_word

DIRECT_PROVIDERS = frozenset(('omnivoice', 'qwen3', 'piper'))


def direct_providers(recipe):
    providers = recipe.get('engines')
    if providers is None:
        providers = ['piper'] if recipe.get('tts_mode') == 'piper' else []
    return providers if providers and all(p in DIRECT_PROVIDERS for p in providers) else []


def eligible(row, phrase, language):
    if row is None or row['status'] != 'complete' or row['committed_at'] is None or row['phrase'] != phrase:
        return False
    recipe = json.loads(row['recipe'])
    return recipe['language'] == language and bool(direct_providers(recipe))


def validate_source_ids(ids):
    if (not isinstance(ids, list) or not 1 <= len(ids) <= 100
            or any(not isinstance(i, str) or not re.fullmatch('[0-9a-f]{32}', i) for i in ids)
            or len(set(ids)) != len(ids)):
        raise ValidationError('Select 1–100 distinct completed source datasets')


def reference_pool(service, db, word_id, phrase, recipe, required):
    validate_source_ids(recipe.moss_source_batch_ids)
    cursors = []
    for identity in recipe.moss_source_batch_ids:
        row = db.execute('SELECT b.*,j.status FROM generation_batches b JOIN studio_jobs j ON j.id=b.id '
                         'WHERE b.id=? AND b.word_id=?', (identity, word_id)).fetchone()
        if not eligible(row, phrase, recipe.language):
            raise ValidationError('MOSS sources must be completed direct-provider datasets for this workspace, phrase and language')
        cursors.append(db.execute('SELECT a.* FROM generation_batch_audio b JOIN audio_records a ON a.id=b.audio_id '
                                  'WHERE b.batch_id=? ORDER BY b.position', (identity,)))
    pool, hashes = [], set()
    limit = max(required, math.ceil(required * 1.25))
    for rows in zip_longest(*cursors):
        for row in rows:
            if row is not None and row['normalized_hash'] not in hashes:
                pool.append(dict(row))
                hashes.add(row['normalized_hash'])
                if len(pool) >= limit:
                    break
        if len(pool) >= limit:
            break
    if len(pool) < required:
        raise ValidationError(f'MOSS needs {required} distinct reference clips; select more sources or reduce MOSS samples')
    return pool


def list_sources(service, word_id, language, offset=0, limit=50):
    check_page(offset, limit, 'Invalid source query')
    with service.store.transaction() as db:
        word = require_word(db, word_id)
        language = language if language is not None else word['language']
        if language not in service.languages():
            raise ValidationError('Invalid source query')
        rows = db.execute('SELECT b.*,j.status,j.created_at, '
                          '(SELECT count(*) FROM generation_batch_audio a WHERE a.batch_id=b.id) AS sample_count '
                          'FROM generation_batches b JOIN studio_jobs j ON j.id=b.id WHERE b.word_id=? '
                          'ORDER BY b.rowid DESC', (word_id,)).fetchall()
        sources = [GenerationSource(r['id'], r['phrase'], language, direct_providers(json.loads(r['recipe'])),
                                    r['sample_count'], r['created_at'])
                   for r in rows if eligible(r, word['phrase'], language) and r['sample_count'] > 0]
        return Page(sources[offset:offset + limit], len(sources), offset, limit)


def materialize_references(service, job, recipe, phrase, required, *, cancelled=lambda: False):
    with service.store.transaction() as db:
        pool = reference_pool(service, db, job.word_id, phrase, recipe, required)
    root = service.store.scoped_directory('jobs', job.id) / 'generation' / 'references'
    manifest = root / 'references.jsonl'
    entries = []
    with open_directory(root) as directory:
        for index, row in enumerate(pool):
            if index % 100 == 0 and cancelled():
                raise Conflict('Generation cancelled')
            name = f'{index:08d}.wav'
            data = service.blobs.read(row['normalized_hash'])
            fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=directory)
            with os.fdopen(fd, 'wb') as output:
                output.write(data)
            entries.append({'audio_id': row['id'], 'path': str(root / name),
                            'normalized_hash': row['normalized_hash'], 'family_id': row['family_id']})
        fd = os.open('references.jsonl', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                     0o600, dir_fd=directory)
        with os.fdopen(fd, 'w') as output:
            for entry in entries:
                output.write(json.dumps(entry) + '\n')
    return manifest, pool


def output_parents(output, approved, count):
    try:
        with open_directory(output) as directory:
            limit = min(64 * 1024 * 1024, count * 512 + 65536)
            encoded = read_regular(directory, '.generation_manifest.json', limit, 'Unsafe MOSS output manifest')
            if len(encoded) > limit:
                raise ValidationError('MOSS output manifest too large')
            manifest = json.loads(encoded)
            names = {name for name in os.listdir(directory) if name.lower().endswith('.wav')}
        mapping = manifest.get('source_audio_ids') if isinstance(manifest, dict) else None
        expected = {f'{index}.wav' for index in range(count)}
        by_id = {row['id']: row for row in approved}
        if (not isinstance(mapping, dict) or set(mapping) != expected or names != expected
                or any(not isinstance(identity, str) or identity not in by_id for identity in mapping.values())):
            raise ValidationError('Invalid MOSS output source mapping')
        return [by_id[mapping[name]] for name in sorted(expected)]
    except (OSError, ValueError, UnicodeError, RecursionError) as error:
        raise ValidationError('Invalid MOSS output provenance') from error
