CREATE TABLE devices (
    id TEXT PRIMARY KEY NOT NULL,
    url TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('leader', 'standalone', 'follower')),
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    leader_id TEXT REFERENCES devices(id),
    credential_ref TEXT,
    profile_id TEXT,
    model_eligible INTEGER NOT NULL DEFAULT 0 CHECK (model_eligible IN (0, 1))
);
CREATE UNIQUE INDEX one_studio_leader ON devices(role) WHERE role = 'leader';
CREATE TRIGGER sticky_follower_role BEFORE UPDATE OF role ON devices
WHEN OLD.role = 'follower' AND NEW.role != 'follower'
BEGIN
    SELECT RAISE(ABORT, 'Follower role cannot be promoted automatically');
END;
