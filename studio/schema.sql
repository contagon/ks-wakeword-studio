CREATE TABLE wakewords (
    id TEXT PRIMARY KEY NOT NULL,
    phrase TEXT NOT NULL CHECK (length(trim(phrase)) BETWEEN 1 AND 200),
    language TEXT NOT NULL CHECK (length(trim(language)) BETWEEN 1 AND 35),
    model_id TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TRIGGER immutable_wakeword_identity
BEFORE UPDATE OF id, model_id ON wakewords
WHEN NEW.id != OLD.id OR NEW.model_id != OLD.model_id
BEGIN
    SELECT RAISE(ABORT, 'Wakeword identity is immutable');
END;
