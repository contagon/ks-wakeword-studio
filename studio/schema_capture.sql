CREATE TABLE sample_capture_metadata (
    sample_id TEXT PRIMARY KEY NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
    trim_method TEXT NOT NULL CHECK (trim_method IN ('silero','manual','none')),
    start_s REAL NOT NULL CHECK (start_s >= 0),
    end_s REAL NOT NULL CHECK (end_s > start_s),
    duration_s REAL NOT NULL CHECK (duration_s > 0 AND duration_s <= 600 AND end_s <= duration_s)
);
CREATE TRIGGER immutable_sample_capture BEFORE UPDATE ON sample_capture_metadata
BEGIN SELECT RAISE(ABORT, 'Capture provenance is immutable'); END;
