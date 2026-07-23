-- Run this ONCE in your existing Supabase project's SQL Editor.
-- It migrates the old "seva" (boolean) and "bhagavatam_minutes" (number)
-- columns to the new field design: "service_minutes" (number) and
-- "srimad_bhagavatam" (boolean, SB class attended).
--
-- Existing data is preserved and sensibly converted, not deleted:
--   - old seva = true  -> service_minutes = 15 (a nominal value, edit later if needed)
--   - old seva = false -> service_minutes = 0
--   - old bhagavatam_minutes > 0 -> srimad_bhagavatam = true
--   - old bhagavatam_minutes = 0 -> srimad_bhagavatam = false
--
-- Skip this file entirely if you're setting up a brand new Supabase project —
-- just use schema.sql instead, which already has the new column names.

alter table sadhana_entries rename column seva to service_minutes;
alter table sadhana_entries
  alter column service_minutes type int
  using (case when service_minutes::boolean then 15 else 0 end);
alter table sadhana_entries alter column service_minutes set default 0;

alter table sadhana_entries rename column bhagavatam_minutes to srimad_bhagavatam;
alter table sadhana_entries
  alter column srimad_bhagavatam type boolean
  using (srimad_bhagavatam::int > 0);
alter table sadhana_entries alter column srimad_bhagavatam set default false;

-- Note: existing "score" values for past days were computed under the old
-- scoring rules and won't automatically recalculate. That's expected — past
-- scores stay as a historical record. Only entries saved after this migration
-- (or re-saved via the Log tab) will use the new scoring logic.
