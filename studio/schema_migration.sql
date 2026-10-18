CREATE TABLE IF NOT EXISTS migration_imports (
    fingerprint TEXT NOT NULL,
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    imported_at TEXT NOT NULL,
    report TEXT NOT NULL,
    PRIMARY KEY(fingerprint, word_id)
);
CREATE TABLE IF NOT EXISTS migration_sample_provenance (
    sample_id TEXT PRIMARY KEY REFERENCES samples(id),
    source TEXT NOT NULL CHECK(source='legacy'),
    legacy_path TEXT NOT NULL,
    fingerprint TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS migration_model_provenance (
    version_id TEXT PRIMARY KEY REFERENCES model_versions(id),
    legacy_path TEXT NOT NULL,
    fingerprint TEXT NOT NULL
);
