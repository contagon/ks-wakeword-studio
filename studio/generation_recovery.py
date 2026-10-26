"""Local-admin recovery snapshots; never rewrite a failed generation job."""
import hashlib
import json
import os
import re
from dataclasses import asdict
from pathlib import Path
from uuid import uuid4

from studio.models import Conflict, GenerationRecipe, ValidationError
from studio.storage import canonical_wav, ensure_directory, open_directory, read_regular
from studio.workspaces import require_word


MAX_AUDIO_BYTES = 64 * 1024 * 1024
CONFIG_FIELDS = ('language', 'english_accent', 'tts_mode', 'samples', 'engines')


def recovery_config(phrase, recipe):
    return {'phrase': phrase, **{key: recipe[key] for key in CONFIG_FIELDS}}


def verified_audio(directory, row):
    if not isinstance(row, dict) or not isinstance(row.get('name'), str) or not re.fullmatch(r'[0-9]+\.wav', row['name']):
        raise ValidationError('Invalid recovery audio name')
    data = read_regular(directory, row['name'], MAX_AUDIO_BYTES, 'Unsafe recovery audio')
    if len(data) > MAX_AUDIO_BYTES:
        raise ValidationError('Recovery audio too large')
    digest = hashlib.sha256(canonical_wav(data)).hexdigest()
    if hashlib.sha256(data).hexdigest() != row.get('sha256') or digest != row.get('canonical_sha256'):
        raise ValidationError('Recovery audio integrity check failed')
    return data, digest


def _source(service, db, word_id, source_job_id):
    if not isinstance(source_job_id, str) or not re.fullmatch('[0-9a-f]{32}', source_job_id):
        raise ValidationError('Invalid recovery source')
    word = require_word(db, word_id)
    row = db.execute('SELECT b.*,j.status,j.kind FROM generation_batches b JOIN studio_jobs j ON j.id=b.id '
                     'WHERE b.id=? AND b.word_id=?', (source_job_id, word_id)).fetchone()
    if (row is None or row['kind'] != 'generation' or row['status'] != 'failed'
            or row['committed_at'] is not None or row['phrase'] != word['phrase']):
        raise Conflict('Recovery requires a failed, unpublished batch in this workspace')
    recipe = GenerationRecipe(**json.loads(row['recipe']))
    service._validate(recipe)
    if recipe.engines != ['omnivoice']:
        raise ValidationError('Recovery currently supports OmniVoice-only batches')
    return word, recipe, recovery_config(row['phrase'], asdict(recipe))


def load_snapshot(manifest, expected_config):
    """Verify copied bytes and canonical uniqueness before any generator cleanup."""
    manifest = Path(manifest)
    with open_directory(manifest.parent) as directory:
        metadata = json.loads(read_regular(directory, manifest.name, 32 * 1024 * 1024, 'Unsafe recovery manifest'))
    if (not isinstance(metadata, dict) or metadata.get('version') != 1 or metadata.get('config') != expected_config
            or not isinstance(metadata.get('source_job_id'), str)
            or not re.fullmatch('[0-9a-f]{32}', metadata['source_job_id'])
            or type(metadata.get('next_attempt')) is not int or metadata['next_attempt'] < 0
            or not isinstance(metadata.get('files'), list)
            or not 0 < len(metadata['files']) <= expected_config['samples']):
        raise ValidationError('Recovery snapshot configuration mismatch')
    paths, names, hashes = [], set(), set()
    with open_directory(manifest.parent / 'final') as directory:
        for row in metadata['files']:
            _, digest = verified_audio(directory, row)
            name = row['name']
            if name in names or digest in hashes:
                raise ValidationError('Recovery audio integrity or uniqueness check failed')
            paths.append(manifest.parent / 'final' / name)
            names.add(name)
            hashes.add(digest)
    return metadata, paths


def enqueue_recovery(service, word_id, source_job_id):
    """Copy evidence first, then atomically admit a new job with its original recipe."""
    with service.store.transaction() as db:
        _, recipe, config = _source(service, db, word_id, source_job_id)
    source = service.store.root / 'jobs' / source_job_id / 'generation/.wake_word_samples.build'
    if not (source / 'final').is_dir():
        raise ValidationError('No retained generation audio')
    snapshot_id = uuid4().hex
    snapshot = service.store.root / 'recovery' / snapshot_id
    ensure_directory(snapshot.parent)
    snapshot.mkdir(mode=0o700)  # Unique directory, never merge with an existing snapshot.
    (snapshot / 'final').mkdir(mode=0o700)
    rows, canonical_hashes = [], set()
    with open_directory(source / 'final') as directory:
        names = sorted(name for name in os.listdir(directory) if name.lower().endswith('.wav'))
        if not 0 < len(names) <= recipe.samples:
            raise ValidationError('Invalid retained audio count')
        for name in names:
            if not re.fullmatch(r'[0-9]+\.wav', name):
                raise ValidationError('Invalid retained audio name')
            data = read_regular(directory, name, MAX_AUDIO_BYTES, 'Unsafe retained audio')
            if len(data) > MAX_AUDIO_BYTES:
                raise ValidationError('Retained audio too large')
            digest = hashlib.sha256(canonical_wav(data)).hexdigest()
            if digest in canonical_hashes:
                raise ValidationError('Retained corpus contains duplicate audio')
            canonical_hashes.add(digest)
            with (snapshot / 'final' / name).open('xb') as output:
                os.chmod(output.name, 0o600)
                output.write(data)
            rows.append({'name': name, 'sha256': hashlib.sha256(data).hexdigest(), 'canonical_sha256': digest})
    next_attempt = 0
    with open_directory(source) as directory:
        for name in os.listdir(directory):
            if not name.endswith('.direct.jsonl'):
                continue
            raw = read_regular(directory, name, MAX_AUDIO_BYTES, 'Unsafe generation input')
            for line in raw.splitlines():
                if line.strip():
                    match = re.fullmatch(r'omnivoice_.*?([0-9]{7,})', json.loads(line)['id'])
                    if match:
                        next_attempt = max(next_attempt, int(match[1]) + 1)
    metadata = {'version': 1, 'source_job_id': source_job_id, 'word_id': word_id,
                'config': config, 'recipe': asdict(recipe), 'next_attempt': next_attempt, 'files': rows}
    with (snapshot / 'manifest.json').open('x') as output:
        os.chmod(output.name, 0o600)
        json.dump(metadata, output, indent=2)
        output.flush()
        os.fsync(output.fileno())
    load_snapshot(snapshot / 'manifest.json', config)
    # Copying can take time: recheck admission and recipe before a worker can see the new job.
    with service.store.transaction() as db:
        word, current_recipe, current_config = _source(service, db, word_id, source_job_id)
        if current_config != config or current_recipe != recipe:
            raise Conflict('Recovery source changed while copying')
        return service._enqueue_batch(db, word, recipe, provider_dataset=True,
                                      recovery_snapshot=snapshot_id, recovery_source_job_id=source_job_id)
