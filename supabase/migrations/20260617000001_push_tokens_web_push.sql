-- Add Web Push subscription fields to push_tokens
-- p256dh and auth are required for encrypted payload delivery
ALTER TABLE push_tokens
  ADD COLUMN IF NOT EXISTS p256dh TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS auth   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Change unique constraint from (user_id, token) to (user_id, platform)
-- so each user has one active web push subscription per platform
ALTER TABLE push_tokens DROP CONSTRAINT IF EXISTS push_tokens_user_id_token_key;
ALTER TABLE push_tokens ADD CONSTRAINT push_tokens_user_platform UNIQUE (user_id, platform);
