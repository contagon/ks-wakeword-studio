CREATE TABLE source_mappings (
    device_id TEXT NOT NULL REFERENCES devices(id),
    engine TEXT NOT NULL,
    source_phrase TEXT NOT NULL,
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    PRIMARY KEY (device_id, engine, source_phrase)
);
CREATE TABLE collection_runs (
    id TEXT PRIMARY KEY,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL
);
CREATE TABLE collection_devices (
    run_id TEXT NOT NULL REFERENCES collection_runs(id),
    device_id TEXT NOT NULL REFERENCES devices(id),
    status TEXT NOT NULL,
    result TEXT NOT NULL,
    PRIMARY KEY (run_id, device_id)
);
CREATE TABLE collection_attempts (
    device_id TEXT NOT NULL REFERENCES devices(id),
    clip_id TEXT NOT NULL,
    run_id TEXT NOT NULL REFERENCES collection_runs(id),
    state TEXT NOT NULL,
    attempts INTEGER NOT NULL CHECK(attempts BETWEEN 0 AND 16),
    next_retry_at TEXT,
    error_code TEXT,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (device_id, clip_id)
);
