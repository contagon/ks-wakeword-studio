CREATE TABLE training_settings (
    word_id TEXT PRIMARY KEY REFERENCES wakewords(id),
    config TEXT NOT NULL
);
CREATE TABLE training_seed (id INTEGER PRIMARY KEY CHECK(id=1), seed INTEGER NOT NULL);
INSERT INTO training_seed VALUES (1,10);
CREATE TABLE training_family_splits (
    family_id TEXT PRIMARY KEY,
    split TEXT NOT NULL CHECK(split IN ('training','validation','testing'))
);
CREATE TRIGGER immutable_training_split BEFORE UPDATE ON training_family_splits
BEGIN SELECT RAISE(ABORT, 'Evaluation assignment is immutable'); END;
CREATE TABLE training_runs (
    id TEXT PRIMARY KEY,
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    manifest TEXT NOT NULL
);
CREATE TRIGGER immutable_training_run BEFORE UPDATE ON training_runs
BEGIN SELECT RAISE(ABORT, 'Run manifest is immutable'); END;
CREATE TABLE model_versions (
    id TEXT PRIMARY KEY,
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    run_id TEXT UNIQUE NOT NULL REFERENCES training_runs(id),
    version TEXT NOT NULL
);
CREATE TRIGGER immutable_model_version BEFORE UPDATE ON model_versions
BEGIN SELECT RAISE(ABORT, 'Model archive is immutable'); END;
