ALTER TABLE studio_jobs ADD COLUMN run_number INTEGER;
UPDATE studio_jobs SET run_number=(
    SELECT count(*) FROM studio_jobs earlier
    WHERE earlier.kind='train' AND earlier.word_id=studio_jobs.word_id AND earlier.rowid<=studio_jobs.rowid
) WHERE kind='train';
CREATE UNIQUE INDEX studio_jobs_run_number ON studio_jobs(word_id, run_number) WHERE run_number IS NOT NULL;
