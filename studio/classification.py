"""Revision-checked classification, serialized with all other GPU jobs."""
from dataclasses import asdict
import hashlib
import json
import sys

from studio import REPO
from studio.models import Conflict, NotFound, ValidationError, iso_now
from studio.speech import classify_transcript


class ClassificationService:
    def __init__(self, store, jobs, samples, automation):
        self.store, self.jobs, self.samples, self.automation = store, jobs, samples, automation

    def handle(self, job, context):
        context.log('Checking classification policy and pending recordings')
        status = self.automation.get(job.word_id)
        policy = status.settings.classification
        if not policy.enabled or self.automation.scheduled_disabled(job):
            return {'skipped': True, 'reason': 'disabled'}
        with self.store.transaction() as db:
            word = db.execute('SELECT * FROM wakewords WHERE id=?', (job.word_id,)).fetchone()
            fingerprint = hashlib.sha256(json.dumps([word['phrase'], word['language'], asdict(policy)], sort_keys=True).encode()).hexdigest()
        counts = {'reviewed': 0, 'negative': 0, 'positive': 0, 'pending': 0, 'conflicts': 0}
        root = self.store.scoped_directory('jobs', job.id)
        batch = 0
        while not context.cancelled():
            with self.store.transaction() as db:
                candidates = db.execute("SELECT s.id,s.revision,s.audio_id,a.normalized_hash,r.near_miss,r.metadata FROM samples s "
                    "JOIN recordings r ON r.id=s.recording_id JOIN audio_records a ON a.id=s.audio_id "
                    "WHERE s.word_id=? AND s.label='pending' AND s.deleted=0 AND r.quarantined=0 "
                    "AND s.source='diagnostic' AND NOT EXISTS (SELECT 1 FROM automation_reviews v "
                    "WHERE v.sample_id=s.id AND v.audio_id=s.audio_id AND v.fingerprint=?) LIMIT 50", (job.word_id, fingerprint)).fetchall()
            if not candidates:
                break
            context.log(f'Classifying batch {batch + 1}: {len(candidates)} recordings')
            eligible = [r for r in candidates if not json.loads(r['metadata']).get('blocked_by_vad')]
            manifest = {'engine': policy.engine, 'phrase': word['phrase'], 'language': word['language'],
                        'cache_dir': str(self.store.data_dir / 'auto_train_models'),
                        'samples': [{'id': r['id'], 'path': str(self.samples.blobs.root / r['normalized_hash'])} for r in eligible]}
            input_path, output_path = root / f'classify-{batch}.json', root / f'result-{batch}.json'
            with input_path.open('x') as file:
                json.dump(manifest, file)
            results = []
            if eligible:
                context.run([sys.executable, str(REPO / 'cli/studio_classify.py'),
                             f'--input-manifest={input_path}', f'--output-json={output_path}'], cwd=str(root))
                if output_path.is_symlink() or output_path.stat().st_size > 2 * 1024 * 1024:
                    raise ValidationError('Invalid speech results')
                results = json.loads(output_path.read_text())
                output_path.unlink()
                if not isinstance(results, list) or len(results) != len(eligible):
                    raise ValidationError('Incomplete speech results')
            by_id = {}
            for result in results:
                if (not isinstance(result, dict) or result.get('engine') != policy.engine
                        or not isinstance(result.get('id'), str) or result['id'] in by_id
                        or any(not isinstance(result.get(k, ''), str) or len(result.get(k, '')) > 16000
                               for k in ('transcript', 'guided_transcript', 'model'))):
                    raise ValidationError('Invalid speech result')
                by_id[result['id']] = result
            if set(by_id) != {r['id'] for r in eligible}:
                raise ValidationError('Invalid speech identities')
            for snapshot in candidates:
                if context.cancelled() or not self.automation.get(job.word_id).settings.classification.enabled:
                    return counts
                result = by_id.get(snapshot['id'], {})
                outcome = classify_transcript(result.get('transcript', ''), word['phrase'],
                    near_miss=bool(snapshot['near_miss']), promote=policy.promote_close_misses,
                    auto_negatives=policy.auto_negatives, guided=result.get('guided_transcript', ''))
                with self.store.transaction() as db:
                    try:
                        current = self.samples._get(db, snapshot['id'], job.word_id)
                        self.samples._revision(current, snapshot['revision'])
                        self.samples._editable(db, current)
                        if current['label'] != 'pending':
                            raise Conflict('Already reviewed')
                        if outcome != 'pending':
                            self.samples._change(db, current, outcome, current['audio_id'], 'label')
                    except (Conflict, NotFound):
                        counts['conflicts'] += 1
                    else:
                        counts['reviewed'] += 1
                        counts[outcome] += 1
                    db.execute('INSERT OR IGNORE INTO automation_reviews VALUES (?,?,?,?,?,?,?)',
                        (snapshot['id'], snapshot['audio_id'], fingerprint, outcome, policy.engine,
                         result.get('model', '')[:200], iso_now(self.samples.clock)))
            batch += 1
            context.log(f'Classification progress: {counts["reviewed"]} reviewed, {counts["conflicts"]} conflicts')
        return counts
