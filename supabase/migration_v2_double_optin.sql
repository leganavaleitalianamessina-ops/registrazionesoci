-- MIGRATION V2: Double Opt-In and GDPR Consent Logging
--
-- Come eseguire:
--   1. Apri la Dashboard Supabase (https://supabase.com/dashboard/project/rutkjmqfdsgtqdztyzyq)
--   2. Vai su SQL Editor
--   3. Incolla e esegui questo script
--
-- Cosa aggiunge:
--   - Colonne email_verified, confirmation_token, email_verified_at su users
--   - Tabella consent_logs per audit trail GDPR
--   - RLS policies per consent_logs
--   - Indici

-- 1. Add email verification columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- 2. Create consent_logs table
CREATE TABLE IF NOT EXISTS consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,         -- 'gdpr', 'marketing'
    granted BOOLEAN NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    privacy_version TEXT DEFAULT 'v1_2024',
    privacy_url TEXT NOT NULL DEFAULT 'https://www.leganavale.it/mod/aalborg_theme/pages/generic.php?filename=0746730001778785218_InformativaTrattamentoDatiPersonaliRegistrazioneTelematica-Maggio.pdf',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on consent_logs
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for consent_logs
DROP POLICY IF EXISTS "Anyone can insert consent" ON consent_logs;
CREATE POLICY "Anyone can insert consent" ON consent_logs
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full can read consent" ON consent_logs;
CREATE POLICY "Admin full can read consent" ON consent_logs
    FOR SELECT USING (get_admin_role() = 'admin_full');

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_users_confirmation_token ON users(confirmation_token);

-- 6. Fix RLS for qr_tokens: allow anon to activate confirmation tokens
-- (The /api/confirm-email route now uses INSERT for new active tokens as primary fix,
--  this UPDATE policy is additional safety for future use)
DROP POLICY IF EXISTS "Anyone can activate confirmation token" ON qr_tokens;
CREATE POLICY "Anyone can activate confirmation token" ON qr_tokens
    FOR UPDATE USING (is_active = false) WITH CHECK (is_active = true);

-- 7. Comments
COMMENT ON TABLE consent_logs IS 'GDPR consent logging: stores timestamp, IP, and privacy version for each consent';
