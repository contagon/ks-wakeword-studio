ALTER TABLE sample_history ADD COLUMN actor TEXT NOT NULL DEFAULT 'manual' CHECK (actor IN ('auto','manual'));
-- Automation only labels pending samples; backfill its changes from the review it recorded alongside.
UPDATE sample_history SET actor='auto' WHERE action='label' AND old_label='pending' AND EXISTS (
    SELECT 1 FROM automation_reviews v WHERE v.sample_id=sample_history.sample_id
    AND v.audio_id=sample_history.new_audio_id AND v.outcome=sample_history.new_label);
