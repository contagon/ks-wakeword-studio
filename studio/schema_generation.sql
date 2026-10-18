CREATE TABLE generation_recipes (
    word_id TEXT PRIMARY KEY REFERENCES wakewords(id),
    recipe TEXT NOT NULL
);
CREATE TABLE generation_batches (
    id TEXT PRIMARY KEY REFERENCES studio_jobs(id),
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    phrase TEXT NOT NULL,
    recipe TEXT NOT NULL,
    committed_at TEXT
);
CREATE TRIGGER immutable_batch_snapshot
BEFORE UPDATE OF id, word_id, phrase, recipe ON generation_batches
BEGIN SELECT RAISE(ABORT, 'Batch snapshot is immutable'); END;
CREATE TABLE generation_batch_audio (
    batch_id TEXT NOT NULL REFERENCES generation_batches(id),
    position INTEGER NOT NULL,
    audio_id TEXT NOT NULL REFERENCES audio_records(id),
    PRIMARY KEY(batch_id, position)
);
CREATE TRIGGER immutable_batch_audio BEFORE UPDATE ON generation_batch_audio
BEGIN SELECT RAISE(ABORT, 'Batch audio is immutable'); END;
CREATE TABLE generation_selection (
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    batch_id TEXT NOT NULL REFERENCES generation_batches(id),
    PRIMARY KEY(word_id, batch_id)
);
