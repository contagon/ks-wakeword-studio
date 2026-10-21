CREATE TABLE studio_dataset_preferences (
    word_id TEXT NOT NULL REFERENCES wakewords(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK(kind IN ('negative', 'augmentation')),
    dataset_ids TEXT NOT NULL,
    PRIMARY KEY(word_id, kind)
);
INSERT INTO studio_dataset_preferences (word_id, kind, dataset_ids)
SELECT word_id, 'negative', json_group_array(dataset_id)
FROM studio_dataset_selections GROUP BY word_id;
