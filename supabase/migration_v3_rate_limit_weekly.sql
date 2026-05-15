-- MIGRATION V3: Rate Limiting, Weekly Dashboard, Monthly Report
--
-- Come eseguire:
--   1. Apri la Dashboard Supabase (https://supabase.com/dashboard/project/rutkjmqfdsgtqdztyzyq)
--   2. Vai su SQL Editor
--   3. Incolla e esegui questo script

-- 1. LOGIN ATTEMPTS (rate limiting)
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    login_type TEXT NOT NULL,           -- 'operator', 'admin'
    success BOOLEAN NOT NULL DEFAULT false,
    blocked BOOLEAN NOT NULL DEFAULT false,  -- true if rejected by rate limit
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert login_attempts" ON login_attempts;
CREATE POLICY "Anyone can insert login_attempts" ON login_attempts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read login_attempts" ON login_attempts;
CREATE POLICY "Anyone can read login_attempts" ON login_attempts
    FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_cleanup ON login_attempts(attempted_at);

-- 2. APP SETTINGS (weekly report toggle, etc.)
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full can manage app_settings" ON app_settings;
CREATE POLICY "Admin full can manage app_settings" ON app_settings
    FOR ALL USING (get_admin_role() = 'admin_full');

DROP POLICY IF EXISTS "Admins can read app_settings" ON app_settings;
CREATE POLICY "Admins can read app_settings" ON app_settings
    FOR SELECT USING (get_admin_role() IN ('checkin_operator', 'admin_monitor', 'admin_full'));

INSERT INTO app_settings (key, value) VALUES ('weekly_report_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value) VALUES ('weekly_report_recipients', '["leganavaleitalianamessina@gmail.com"]')
ON CONFLICT (key) DO NOTHING;

-- 3. VIEW: checkin del mese corrente
CREATE OR REPLACE VIEW current_month_checkins AS
SELECT cl.*, u.first_name, u.last_name, u.email, u.user_type
FROM checkin_logs cl
LEFT JOIN users u ON u.id = cl.user_id
WHERE cl.created_at >= date_trunc('month', NOW())
  AND cl.created_at < date_trunc('month', NOW()) + INTERVAL '1 month';

-- 4. VIEW: login attempts del mese corrente
CREATE OR REPLACE VIEW current_month_login_attempts AS
SELECT * FROM login_attempts
WHERE attempted_at >= date_trunc('month', NOW())
  AND attempted_at < date_trunc('month', NOW()) + INTERVAL '1 month';

-- 5. VIEW: statistiche settimanali per dashboard
CREATE OR REPLACE VIEW weekly_stats AS
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM users WHERE user_type = 'active_member') AS active_members,
    (SELECT COUNT(*) FROM users WHERE user_type = 'pre_member') AS pre_members,
    (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_week,
    (SELECT COUNT(*) FROM qr_tokens WHERE is_active = true) AS active_qr,
    (SELECT COUNT(*) FROM qr_tokens WHERE created_at >= NOW() - INTERVAL '7 days') AS new_qr_week,
    (SELECT COUNT(*) FROM checkin_logs WHERE created_at >= NOW() - INTERVAL '7 days') AS checkins_week,
    (SELECT COUNT(*) FROM checkin_logs WHERE created_at >= date_trunc('month', NOW())) AS checkins_month;

COMMENT ON TABLE login_attempts IS 'Tentativi di login per rate limiting anti-brute-force';
COMMENT ON TABLE app_settings IS 'Impostazioni configurabili da pannello admin';
