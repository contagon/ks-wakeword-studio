CREATE TABLE IF NOT EXISTS migration_source_claims (
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    source_path TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    record_id TEXT NOT NULL,
    PRIMARY KEY(word_id, source_path, content_hash)
);
CREATE TABLE IF NOT EXISTS legacy_model_validations (
    version_id TEXT PRIMARY KEY REFERENCES model_versions(id),
    validated_at TEXT NOT NULL
);
