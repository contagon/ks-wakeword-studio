CREATE TABLE studio_dataset_installations (
    dataset_id TEXT PRIMARY KEY,
    fingerprint TEXT NOT NULL,
    manifest_json TEXT NOT NULL
);
CREATE TABLE studio_dataset_selections (
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    dataset_id TEXT NOT NULL,
    PRIMARY KEY(word_id, dataset_id)
);
