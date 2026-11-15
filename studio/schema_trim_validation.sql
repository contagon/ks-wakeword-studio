CREATE TABLE audio_trim_validation (
    audio_id TEXT PRIMARY KEY REFERENCES audio_records(id) ON DELETE CASCADE,
    policy INTEGER NOT NULL
);
