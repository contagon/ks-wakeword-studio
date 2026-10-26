-- commitCustomWakeModels consumes the whole persistent target staging folder.
-- A process lock alone is insufficient after a crash; retain every owned name
-- until all affected current desired versions have been committed and verified.
CREATE TABLE deployment_staging (
    device_id TEXT NOT NULL REFERENCES devices(id),
    word_id TEXT NOT NULL REFERENCES wakewords(id),
    filenames TEXT NOT NULL,
    claimed_revision INTEGER NOT NULL,
    PRIMARY KEY(device_id,word_id)
);
CREATE TABLE deployment_staging_blocks (
    device_id TEXT PRIMARY KEY REFERENCES devices(id),
    reason TEXT NOT NULL
);
-- Older v9 attempts did not journal uploads. Conservatively recover all names
-- any retained version could have staged for each enrolled target/word. This
-- intentionally blocks on a formerly staged optional companion with no current
-- desired replacement, rather than committing obsolete bytes or deleting it.
INSERT INTO deployment_staging(device_id,word_id,filenames,claimed_revision)
SELECT p.device_id,p.word_id,json_group_array(DISTINCT artifact.key),0
FROM publications p JOIN model_versions v ON v.word_id=p.word_id,
json_each(json_extract(v.version,'$.checksums')) artifact
WHERE artifact.key IN (json_extract(v.version,'$.model_id')||'.json',
                      json_extract(v.version,'$.model_id')||'.tflite',
                      json_extract(v.version,'$.model_id')||'.oww.onnx')
GROUP BY p.device_id,p.word_id;
