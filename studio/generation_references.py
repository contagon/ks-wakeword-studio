"""Workspace-scoped, canonical-deduplicated direct-provider cloning sources."""
import json
import math
import re
from itertools import zip_longest

from studio.models import GenerationSource, Page, ValidationError

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
    if (type(offset) is not int or offset < 0 or type(limit) is not int or not 1 <= limit <= 100
            or language not in service._languages()):
        raise ValidationError('Invalid source query')
    with service.store.transaction() as db:
        word = service._word(db, word_id)
        rows = db.execute('SELECT b.*,j.status,j.created_at, '
                          '(SELECT count(*) FROM generation_batch_audio a WHERE a.batch_id=b.id) AS sample_count '
                          'FROM generation_batches b JOIN studio_jobs j ON j.id=b.id WHERE b.word_id=? '
                          'ORDER BY b.rowid DESC', (word_id,)).fetchall()
        sources = [GenerationSource(r['id'], r['phrase'], language, direct_providers(json.loads(r['recipe'])),
                                    r['sample_count'], r['created_at'])
                   for r in rows if eligible(r, word['phrase'], language) and r['sample_count'] > 0]
        return Page(sources[offset:offset + limit], len(sources), offset, limit)
