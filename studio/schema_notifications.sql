CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY CHECK(id=1),
    apprise_url TEXT NOT NULL DEFAULT '',
    download INTEGER NOT NULL DEFAULT 0 CHECK(download IN (0,1))
);
INSERT OR IGNORE INTO notification_settings(id) VALUES (1);
CREATE TABLE IF NOT EXISTS workspace_notifications (
    word_id TEXT PRIMARY KEY REFERENCES wakewords(id) ON DELETE CASCADE,
    scrape INTEGER NOT NULL DEFAULT 0 CHECK(scrape IN (0,1)),
    classify INTEGER NOT NULL DEFAULT 0 CHECK(classify IN (0,1)),
    train INTEGER NOT NULL DEFAULT 0 CHECK(train IN (0,1)),
    deploy INTEGER NOT NULL DEFAULT 0 CHECK(deploy IN (0,1))
);
CREATE TABLE IF NOT EXISTS notification_outbox (
    event_key TEXT PRIMARY KEY,
    word_id TEXT REFERENCES wakewords(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    failed INTEGER NOT NULL CHECK(failed IN (0,1)),
    state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sent','failed','discarded')),
    attempts INTEGER NOT NULL DEFAULT 0,
    next_retry TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS notification_outbox_due ON notification_outbox(state,next_retry);
