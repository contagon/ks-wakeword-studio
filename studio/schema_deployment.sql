CREATE TABLE deployment_events (
    version_id TEXT PRIMARY KEY REFERENCES model_versions(id),
    consumed INTEGER NOT NULL DEFAULT 0 CHECK(consumed IN (0,1))
);
CREATE TABLE deployment_intents (
    word_id TEXT PRIMARY KEY REFERENCES wakewords(id),
    version_id TEXT NOT NULL REFERENCES model_versions(id),
    revision INTEGER NOT NULL CHECK(revision > 0)
);
CREATE TABLE publications (
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    device_id TEXT NOT NULL REFERENCES devices(id),
    desired_version TEXT NOT NULL REFERENCES model_versions(id),
    revision INTEGER NOT NULL,
    state TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    next_retry TEXT,
    manifest_state TEXT NOT NULL DEFAULT 'unverified',
    refresh_state TEXT NOT NULL DEFAULT 'pending',
    runtime_state TEXT NOT NULL DEFAULT 'unverified',
    error_code TEXT,
    updated_at TEXT NOT NULL,
    PRIMARY KEY(word_id,device_id)
);
CREATE TABLE publication_history (
    id INTEGER PRIMARY KEY,
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    record TEXT NOT NULL
);
CREATE INDEX publication_history_word ON publication_history(word_id,id);
