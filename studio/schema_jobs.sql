CREATE TABLE studio_jobs (
    id TEXT PRIMARY KEY NOT NULL,
    kind TEXT NOT NULL,
    word_id TEXT REFERENCES wakewords(id),
    resource TEXT NOT NULL CHECK(resource IN ('gpu','collection','download')),
    payload TEXT NOT NULL,
    dedupe_key TEXT UNIQUE,
    schedule_scope TEXT,
    status TEXT NOT NULL CHECK(status IN ('queued','running','cancelling','complete','failed','cancelled','interrupted')),
    created_at TEXT NOT NULL,
    started_at TEXT,
    finished_at TEXT,
    result TEXT NOT NULL DEFAULT '{}',
    child TEXT,
    log TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX studio_resource_owner ON studio_jobs(resource)
    WHERE status IN ('running','cancelling');
CREATE UNIQUE INDEX studio_pending_schedule ON studio_jobs(schedule_scope)
    WHERE status = 'queued' AND schedule_scope IS NOT NULL;
CREATE TABLE studio_schedules (
    scope TEXT PRIMARY KEY NOT NULL,
    cron TEXT NOT NULL,
    timezone TEXT NOT NULL,
    enabled INTEGER NOT NULL,
    next_run_at TEXT NOT NULL
);
CREATE TABLE studio_schedule_occurrences (
    scope TEXT NOT NULL REFERENCES studio_schedules(scope),
    scheduled_at TEXT NOT NULL,
    job_id TEXT NOT NULL REFERENCES studio_jobs(id),
    PRIMARY KEY(scope, scheduled_at)
);
