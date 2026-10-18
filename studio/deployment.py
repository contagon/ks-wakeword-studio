"""Durable desired-version publication, never direct uploads to followers.

Network work is serialized with filesystem flocks (also across runtimes). The
intent gate spans mutation, so a completed rollback cannot be followed by bytes
or a follower refresh from a stale revision. Per-target locks also serialize
different wakewords sharing the kiosk's single staging directory. No SQL write
transaction is held across HTTP or credential lookup.
"""
import fcntl
import io
import json
import os
from contextlib import contextmanager
from dataclasses import asdict
from datetime import timedelta
from pathlib import Path
from tempfile import TemporaryFile
from zipfile import ZipFile, ZIP_DEFLATED

from studio.jobs import aware_utc, utc_now
from studio.legacy_training import checked_file, sha256
from studio.models import (Conflict, CredentialsRequired, IdentityMismatch, ModelVersion,
                           NotFound, Page, Publication, RemoteRejected, RemoteUnavailable,
                           ValidationError)
from studio.storage import open_directory
from studio.workspaces import WorkspaceService


class StagingFailure(Exception):
    """Fixed local codes only; never expose raw remote responses."""


class DeploymentService:
    max_attempts = 6

    def __init__(self, store, devices, training, *, clock=utc_now):
        self.store, self.devices, self.training, self.clock = store, devices, training, clock

    @contextmanager
    def _lock(self, name):
        # Device IDs need not be path-safe; hash the entire opaque lock key.
        import hashlib
        key = hashlib.sha256(name.encode()).hexdigest()
        with open_directory(self.store.root / 'publication-locks') as directory:
            fd = os.open(key, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600, dir_fd=directory)
        try:
            fcntl.flock(fd, fcntl.LOCK_EX)
            yield
        finally:
            os.close(fd)

    def _now(self):
        return aware_utc(self.clock()).isoformat()

    def version(self, version_id, word_id=None):
        with self.store.transaction() as db:
            row = db.execute('SELECT v.version,j.status FROM model_versions v JOIN studio_jobs j ON j.id=v.run_id '
                             'WHERE v.id=?', (version_id,)).fetchone()
        if row is None:
            raise NotFound('Model version not found')
        if row['status'] != 'complete':
            raise Conflict('Model version is not complete')
        version = ModelVersion(**json.loads(row['version']))
        if word_id is not None and version.word_id != word_id:
            raise Conflict('Model version belongs to another workspace')
        return version

    def artifacts(self, version):
        """Validate the entire archive before uploading any byte. Only weights
        and the MWW manifest go over the wire; OWW metadata/bundles are local.
        The companion's distinct `.oww` stem avoids MWW grouping collisions.
        """
        root = self.store.root / 'models' / version.word_id / version.id
        if Path(version.path) != root or root.is_symlink():
            raise ValidationError('Invalid archive path')
        try:
            for name, expected in version.checksums.items():
                if sha256(checked_file(root / name, root)) != expected:
                    raise ValidationError('Archive checksum mismatch')
            slug = version.model_id
            names = [slug + '.json', slug + '.tflite']
            companion = slug + '.oww.onnx'
            if companion in version.checksums:
                names.append(companion)
            if not all(n in version.checksums for n in names):
                raise ValidationError('Missing publication artifact')
            content = {n: checked_file(root / n, root).read_bytes() for n in names}
            # Hash the actual buffers that will be sent (not just earlier reads).
            import hashlib
            if any(hashlib.sha256(b).hexdigest() != version.checksums[n] for n, b in content.items()):
                raise ValidationError('Archive changed during read')
            manifest = json.loads(content[slug + '.json'])
            if (manifest.get('model') != slug + '.tflite' or
                    not (manifest.get('type') == 'micro' or isinstance(manifest.get('micro'), dict))):
                raise ValidationError('Invalid stable manifest')
            if any(not b or len(b) > self.devices.client.max_upload for b in content.values()):
                raise ValidationError('Invalid publication size')
            return content
        except (OSError, ValueError, TypeError, AttributeError):
            raise ValidationError('Invalid model archive') from None

    @staticmethod
    def _expected(content):
        import hashlib
        return {('openwakeword/' if n.endswith('.onnx') else 'microwakeword/') + n:
                hashlib.sha256(b).hexdigest() for n, b in content.items()}

    def archive(self, version_id, word_id):
        """Validated complete archive stream, with bounded memory and cleanup."""
        version = self.version(version_id, word_id)
        self.artifacts(version)
        handle = TemporaryFile(dir=self.store.root)
        try:
            with ZipFile(handle, 'w', compression=ZIP_DEFLATED) as bundle:
                root = Path(version.path)
                for name in version.checksums:
                    bundle.write(checked_file(root / name, root), name)
                bundle.writestr('archive.json', json.dumps(asdict(version), sort_keys=True))
            handle.seek(0)
        except BaseException:
            handle.close()
            raise
        def chunks():
            try:
                while block := handle.read(65536):
                    yield block
            finally:
                handle.close()
        return chunks()

    def _intent(self, db, version):
        row = db.execute('SELECT revision FROM deployment_intents WHERE word_id=?', (version.word_id,)).fetchone()
        revision = row[0] + 1 if row else 1
        db.execute('INSERT INTO deployment_intents VALUES (?,?,?) ON CONFLICT(word_id) DO UPDATE SET '
                   'version_id=excluded.version_id, revision=excluded.revision', (version.word_id, version.id, revision))
        # Atomic intent for *all* registered targets, including indirect and
        # missing-credential targets. No network before this transaction commits.
        db.execute('DELETE FROM publications WHERE word_id=?', (version.word_id,))
        self._enroll(db, version.word_id, version.id, revision)

    def _enroll(self, db, word_id, version_id, revision):
        for row in db.execute('SELECT id FROM devices').fetchall():
            db.execute("INSERT OR IGNORE INTO publications(word_id,device_id,desired_version,revision,state,updated_at) "
                       "VALUES (?,?,?,?,'pending',?)", (word_id, row[0], version_id, revision, self._now()))
        # Terminal observations must not outlive current registry coverage.
        # This is local reconciliation only: never probe/refresh excluded or
        # removed followers just to discover that they are no longer eligible.
        rows = db.execute('SELECT p.*,d.active,d.role,d.model_eligible,b.reason staging_reason FROM publications p '
                          'JOIN devices d ON d.id=p.device_id LEFT JOIN deployment_staging_blocks b ON b.device_id=p.device_id '
                          'WHERE p.word_id=?', (word_id,)).fetchall()
        for row in rows:
            blocked = ('inactive' if not row['active'] else
                       'not_covered' if row['role'] == 'follower' and not row['model_eligible'] else
                       'staging_blocked' if row['role'] != 'follower' and row['staging_reason'] else None)
            if blocked and row['state'] != blocked:
                db.execute("UPDATE publications SET state=?,next_retry=NULL,manifest_state='unverified',"
                           "refresh_state='pending',runtime_state='unverified',error_code=?,updated_at=? "
                           'WHERE word_id=? AND device_id=?',
                           (blocked, row['staging_reason'] if blocked == 'staging_blocked' else blocked,
                            self._now(), word_id, row['device_id']))
                record = dict(db.execute('SELECT * FROM publications WHERE word_id=? AND device_id=?',
                                         (word_id, row['device_id'])).fetchone())
                db.execute('INSERT INTO publication_history(word_id,record) VALUES (?,?)', (word_id, json.dumps(record)))
        # Membership/profile edits can make a previously blocked target eligible
        # without a new trained version. Only explicit registry eligibility
        # changes reopen these states; exhausted remote retries stay bounded.
        db.execute("UPDATE publications SET state='pending',attempts=0,next_retry=NULL WHERE word_id=? AND "
                   "state IN ('not_covered','inactive') AND device_id IN "
                   "(SELECT id FROM devices WHERE active=1 AND (role!='follower' OR model_eligible=1))", (word_id,))

    def _reconcile(self):
        # Successful versions are discovered in archive insertion order, not
        # wall-clock order. Every version gets a durable event; only the newest
        # newly completed version becomes desired. Consumed events never undo a
        # manual rollback. This also recovers the finish->callback crash window.
        with self.store.transaction() as db:
            db.execute("INSERT OR IGNORE INTO deployment_events(version_id) SELECT v.id FROM model_versions v "
                       "JOIN studio_jobs j ON j.id=v.run_id WHERE j.status='complete'")
            rows = db.execute("SELECT v.version FROM deployment_events e JOIN model_versions v ON v.id=e.version_id "
                              "JOIN studio_jobs j ON j.id=v.run_id WHERE e.consumed=0 AND j.status='complete' ORDER BY v.rowid").fetchall()
            for row in rows:
                version = ModelVersion(**json.loads(row[0]))
                self._intent(db, version)
                db.execute('UPDATE deployment_events SET consumed=1 WHERE version_id=?', (version.id,))
            for intent in db.execute('SELECT * FROM deployment_intents').fetchall():
                self._enroll(db, intent['word_id'], intent['version_id'], intent['revision'])

    def reconcile(self):
        """No network: safe on startup, after completion, or on recovery."""
        with self._lock('intent'):
            self._reconcile()

    def publish(self, version_id):
        version = self.version(version_id)
        self.artifacts(version)  # reject tampering before changing desired intent
        with self._lock('intent'):
            self._reconcile()
            with self.store.transaction() as db:
                self._intent(db, version)
            self._run_due(aware_utc(self.clock()), word_id=version.word_id)
            return self.status(version.word_id)

    def rollback(self, word_id, version_id):
        self.version(version_id, word_id)
        return self.publish(version_id)

    def retry_due(self, now):
        now = aware_utc(now)
        with self._lock('intent'):
            self._reconcile()
            return self._run_due(now)

    def status(self, word_id):
        WorkspaceService(self.store).get(word_id)
        with self.store.transaction() as db:
            return [Publication(**dict(row)) for row in db.execute('SELECT * FROM publications WHERE word_id=? ORDER BY device_id', (word_id,))]

    def history(self, word_id, offset=0, limit=50):
        WorkspaceService(self.store).get(word_id)
        self.training._page(offset, limit)
        with self.store.transaction() as db:
            total = db.execute('SELECT count(*) FROM publication_history WHERE word_id=?', (word_id,)).fetchone()[0]
            rows = db.execute('SELECT record FROM publication_history WHERE word_id=? ORDER BY id DESC LIMIT ? OFFSET ?',
                              (word_id, limit, offset)).fetchall()
        return Page([Publication(**json.loads(r[0])) for r in rows], total, offset, limit)

    def _current(self, p):
        with self.store.transaction() as db:
            row = db.execute('SELECT version_id,revision FROM deployment_intents WHERE word_id=?', (p.word_id,)).fetchone()
            return row and tuple(row) == (p.desired_version, p.revision)

    def _save(self, p, **changes):
        data = {**asdict(p), **changes, 'updated_at': self._now()}
        data.pop('cache_effect', None)
        updated = Publication(**data)
        with self.store.transaction() as db:
            fields = [k for k in data if k not in ('word_id', 'device_id', 'revision', 'desired_version')]
            db.execute('UPDATE publications SET ' + ','.join(k + '=?' for k in fields) +
                       ' WHERE word_id=? AND device_id=? AND revision=? AND desired_version=?',
                       (*[data[k] for k in fields], p.word_id, p.device_id, p.revision, p.desired_version))
            db.execute('INSERT INTO publication_history(word_id,record) VALUES (?,?)', (p.word_id, json.dumps(asdict(updated))))
        return updated

    def _device(self, p, *, indirect):
        if not self._current(p):
            raise Conflict('Superseded publication')
        device = self.devices.get(p.device_id)
        if not device.active or (device.role == 'follower') != indirect:
            raise IdentityMismatch('Kiosk publication role changed')
        identity = self.devices.client.identity(device)
        if (identity.follows != indirect or (not indirect and identity.leader != (device.role == 'leader'))):
            raise IdentityMismatch('Kiosk publication role changed')
        return device

    def _staging_rows(self, device_id):
        with self.store.transaction() as db:
            return db.execute('SELECT * FROM deployment_staging WHERE device_id=? ORDER BY word_id', (device_id,)).fetchall()

    def _commit_current(self, p, content, now):
        """Repair *all* owned persistent staging before any target-wide commit.

        Caller holds the intent gate and target lock. Resolve dirty ownership to
        CURRENT intents, not the version/revision that crashed. Validate every
        affected archive before sending anything. Journal the full filename union
        before uploads, and clear only after exact acceptance + all hashes.
        """
        affected = {p.word_id: (p, content)}
        dirty = self._staging_rows(p.device_id)
        for row in dirty:
            if row['word_id'] not in affected:
                with self.store.transaction() as db:
                    publication = db.execute('SELECT * FROM publications WHERE word_id=? AND device_id=?',
                                             (row['word_id'], p.device_id)).fetchone()
                if publication is None:
                    raise StagingFailure('staging_desired_missing')
                current = Publication(**dict(publication))
                if not self._current(current):
                    raise StagingFailure('staging_desired_missing')
                affected[current.word_id] = (current, self.artifacts(self.version(current.desired_version, current.word_id)))
            desired_names = set(affected[row['word_id']][1])
            if not set(json.loads(row['filenames'])) <= desired_names:
                # No discard API exists. Never restore a no-longer-desired OWW
                # companion just to drain staging, or delete a custom model.
                raise StagingFailure('staging_artifact_not_desired')
        with self.store.transaction() as db:
            for current, files in affected.values():
                db.execute('INSERT INTO deployment_staging VALUES (?,?,?,?) ON CONFLICT(device_id,word_id) '
                           'DO UPDATE SET filenames=excluded.filenames,claimed_revision=excluded.claimed_revision',
                           (p.device_id, current.word_id, json.dumps(sorted(files)), current.revision))
        expected, required = {}, set()
        for current, files in affected.values():
            expected.update(self._expected(files))
            required.update(('openwakeword' if n.endswith('.onnx') else 'microwakeword', n.rsplit('.', 1)[0]) for n in files)
            for name, data in files.items():
                device = self._device(current, indirect=False)
                self.devices.client.stage_model(device, name, io.BytesIO(data))
        device = self._device(p, indirect=False)
        result = self.devices.client.commit_models(device)
        accepted = {(x['engine'], x['id']) for x in result.added}
        if accepted - required:
            # Unknown external staging cannot be undone or reconstructed safely.
            # Quarantine this target across words/revisions; never claim success
            # or issue another commit/refresh under an invented cleanup policy.
            with self.store.transaction() as db:
                db.execute('INSERT OR REPLACE INTO deployment_staging_blocks VALUES (?,?)',
                           (p.device_id, 'staging_unowned'))
            raise StagingFailure('staging_unowned')
        if result.rejected or accepted != required or len(result.added) != len(required):
            raise StagingFailure('rejected')
        remote = self.devices.client.model_manifest(device)
        if not all(remote.get(k) == v for k, v in expected.items()):
            raise StagingFailure('hash_mismatch')
        for current, _ in affected.values():
            if current.word_id != p.word_id:
                self._save(current, manifest_state='verified', refresh_state='pending', state='refresh_pending',
                           next_retry=now.isoformat(), error_code=None)
        # Keep the journal through refresh scheduling. A crash before all
        # affected rows are due must replay recovery, not strand another word.
        with self.store.transaction() as db:
            db.execute('DELETE FROM deployment_staging WHERE device_id=?', (p.device_id,))

    def _attempt(self, p, now):
        if p.attempts >= self.max_attempts:
            return self._save(p, state='exhausted', error_code='interrupted_attempt', next_retry=None)
        device = self.devices.get(p.device_id)
        indirect = device.role == 'follower'
        if not device.active:
            return self._save(p, state='inactive', next_retry=None)
        if indirect and not device.model_eligible:
            return self._save(p, state='not_covered', next_retry=None)
        if device.credentials_status != 'ready':
            return self._save(p, state='credentials_required', next_retry=(now + timedelta(minutes=5)).isoformat())
        # A claimed attempt must remain recoverable even if the process dies
        # before it can persist a result/backoff. `pending` is always eligible.
        p = self._save(p, state='pending', attempts=p.attempts + 1, next_retry=None)
        try:
            if not indirect:
                with self.store.transaction() as db:
                    blocked = db.execute('SELECT reason FROM deployment_staging_blocks WHERE device_id=?', (p.device_id,)).fetchone()
                if blocked:
                    raise StagingFailure(blocked[0])
            version = self.version(p.desired_version, p.word_id)
            content = self.artifacts(version)
            expected = self._expected(content)
            device = self._device(p, indirect=indirect)
            remote = self.devices.client.model_manifest(device)
            matches = all(remote.get(k) == v for k, v in expected.items())
            if not matches:
                p = self._save(p, manifest_state='unverified', refresh_state='pending')
            if indirect:
                if not device.leader_id:
                    return self._pending(p, now, 'leader_unverified')
                leader = next((x for x in self.status(p.word_id) if x.device_id == device.leader_id), None)
                if not leader or leader.desired_version != p.desired_version or leader.manifest_state != 'verified':
                    return self._pending(p, now, 'leader_unverified')
                if not matches:
                    return self._pending(p, now, 'sync_pending')
            elif not matches or self._staging_rows(p.device_id):
                self._commit_current(p, content, now)
            # Persist a due refresh, not a terminal publication: a crash between
            # hash observation and refresh acknowledgement must be replayable.
            p = self._save(p, manifest_state='verified', state='refresh_pending', refresh_state='pending',
                           next_retry=now.isoformat())
            # Re-read manifest immediately before refresh; never refresh a lagging
            # follower (or a changed direct file) based on an old observation.
            device = self._device(p, indirect=indirect)
            remote = self.devices.client.model_manifest(device)
            if not all(remote.get(k) == v for k, v in expected.items()):
                return self._pending(p, now, 'sync_pending' if indirect else 'hash_mismatch', manifest_state='unverified')
            self.devices.client.refresh_models(device)
            return self._save(p, state='synced' if indirect else 'published', refresh_state='acknowledged',
                              error_code=None, next_retry=None)
        except StagingFailure as error:
            code = str(error)
            if code in ('rejected', 'hash_mismatch'):
                return self._pending(p, now, code)
            return self._save(p, state='staging_blocked', error_code=code, manifest_state='unverified',
                              refresh_state='pending', next_retry=None)
        except CredentialsRequired:
            return self._pending(p, now, 'credentials_required')
        except IdentityMismatch:
            return self._save(p, state='role_changed', error_code='identity_or_role_changed', next_retry=None)
        except RemoteUnavailable:
            return self._pending(p, now, 'refresh_pending' if p.manifest_state == 'verified' else 'offline')
        except RemoteRejected:
            return self._pending(p, now, 'refresh_pending' if p.manifest_state == 'verified' else 'rejected')
        except (ValidationError, Conflict, NotFound):
            return self._save(p, state='archive_invalid', error_code='archive_not_publishable', next_retry=None)

    def _pending(self, p, now, state, **changes):
        exhausted = p.attempts >= self.max_attempts
        return self._save(p, state='exhausted' if exhausted else state, error_code=state,
                          next_retry=None if exhausted else (now + timedelta(seconds=min(3600, 30 * 2 ** (p.attempts - 1)))).isoformat(),
                          **changes)

    def _run_due(self, now, word_id=None):
        with self.store.transaction() as db:
            rows = db.execute('SELECT p.* FROM publications p JOIN devices d ON d.id=p.device_id' +
                              (' WHERE p.word_id=?' if word_id else '') +
                              " ORDER BY p.word_id, (d.role='follower'), p.device_id", (word_id,) if word_id else ()).fetchall()
        result = []
        for row in rows:
            p = Publication(**dict(row))
            # Terminal success/blocked states are not an unbounded polling loop.
            if p.state != 'pending' and (p.next_retry is None or p.next_retry > now.isoformat()):
                continue
            with self._lock('target:' + p.device_id):
                if self._current(p):
                    result.append(self._attempt(p, now))
        return result
