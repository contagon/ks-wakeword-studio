ALTER TABLE devices ADD COLUMN url_override TEXT;
ALTER TABLE devices ADD COLUMN removed INTEGER NOT NULL DEFAULT 0 CHECK (removed IN (0, 1));
DROP INDEX one_studio_leader;
CREATE UNIQUE INDEX one_studio_leader ON devices(role) WHERE role = 'leader' AND removed = 0;
