CREATE TABLE workspace_automation (
    word_id TEXT PRIMARY KEY REFERENCES wakewords(id) ON DELETE CASCADE,
    settings TEXT NOT NULL,
    archive_cursor INTEGER NOT NULL DEFAULT 0,
    deployment_cursor INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE automation_events (
    event_key TEXT PRIMARY KEY,
    word_id TEXT NOT NULL REFERENCES wakewords(id) ON DELETE CASCADE,
    job_id TEXT REFERENCES studio_jobs(id) ON DELETE CASCADE
);
CREATE TABLE automation_reviews (
    sample_id TEXT NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
    audio_id TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    outcome TEXT NOT NULL,
    engine TEXT NOT NULL,
    model TEXT NOT NULL,
    reviewed_at TEXT NOT NULL,
    PRIMARY KEY(sample_id, audio_id, fingerprint)
);
UPDATE studio_schedules SET enabled=0 WHERE scope='scrape';
UPDATE studio_jobs SET status='cancelled' WHERE schedule_scope='scrape' AND status='queued';
UPDATE deployment_events SET consumed=1;
