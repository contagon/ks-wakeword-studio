CREATE TABLE audio_records (
    id TEXT PRIMARY KEY NOT NULL,
    original_hash TEXT NOT NULL,
    normalized_hash TEXT NOT NULL,
    family_id TEXT NOT NULL,
    parent_id TEXT REFERENCES audio_records(id),
    start_s REAL,
    end_s REAL,
    created_at TEXT NOT NULL
);
CREATE INDEX audio_original_hash ON audio_records(original_hash);
CREATE INDEX audio_normalized_hash ON audio_records(normalized_hash);
CREATE TABLE audio_families (
    content_hash TEXT PRIMARY KEY NOT NULL,
    family_id TEXT NOT NULL
);
CREATE TRIGGER immutable_audio BEFORE UPDATE ON audio_records
BEGIN SELECT RAISE(ABORT, 'Audio provenance is immutable'); END;
CREATE TRIGGER immutable_audio_family BEFORE UPDATE ON audio_families
BEGIN SELECT RAISE(ABORT, 'Audio family is immutable'); END;

CREATE TABLE recordings (
    id TEXT PRIMARY KEY NOT NULL,
    device_id TEXT NOT NULL,
    clip_id TEXT NOT NULL,
    timestamp TEXT,
    phrase TEXT NOT NULL,
    engine TEXT NOT NULL,
    near_miss INTEGER NOT NULL CHECK (near_miss IN (0,1)),
    scores TEXT NOT NULL,
    metadata TEXT NOT NULL,
    audio_id TEXT NOT NULL REFERENCES audio_records(id),
    word_id TEXT REFERENCES wakewords(id),
    quarantined INTEGER NOT NULL DEFAULT 0 CHECK (quarantined IN (0,1)),
    created_at TEXT NOT NULL,
    UNIQUE(device_id, clip_id)
);
CREATE TRIGGER immutable_recording_source
BEFORE UPDATE OF id, device_id, clip_id, timestamp, phrase, engine, near_miss, scores, metadata, audio_id, created_at ON recordings
BEGIN SELECT RAISE(ABORT, 'Source identity is immutable'); END;
CREATE TABLE recording_conflicts (
    recording_id TEXT NOT NULL REFERENCES recordings(id),
    original_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY(recording_id, original_hash)
);
CREATE TABLE samples (
    id TEXT PRIMARY KEY NOT NULL,
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    recording_id TEXT UNIQUE REFERENCES recordings(id),
    audio_id TEXT NOT NULL REFERENCES audio_records(id),
    label TEXT NOT NULL CHECK (label IN ('pending','positive','negative','discarded')),
    revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
    source TEXT NOT NULL CHECK (source IN ('diagnostic','import')),
    deleted INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0,1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE INDEX samples_word_label ON samples(word_id, deleted, label);
CREATE TRIGGER immutable_sample_owner BEFORE UPDATE OF id, word_id, recording_id, source ON samples
BEGIN SELECT RAISE(ABORT, 'Sample ownership is immutable'); END;
CREATE TABLE sample_history (
    id INTEGER PRIMARY KEY,
    sample_id TEXT NOT NULL REFERENCES samples(id),
    revision INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('label','trim')),
    old_label TEXT NOT NULL,
    old_audio_id TEXT NOT NULL REFERENCES audio_records(id),
    new_label TEXT NOT NULL,
    new_audio_id TEXT NOT NULL REFERENCES audio_records(id),
    undone INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    UNIQUE(sample_id, revision)
);
