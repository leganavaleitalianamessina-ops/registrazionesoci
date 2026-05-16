-- Migration v5: Aggiungi data di nascita e tabella destinatari report

ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;

CREATE TABLE IF NOT EXISTS report_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE report_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full can manage recipients" ON report_recipients
    FOR ALL USING (get_admin_role() = 'admin_full');

CREATE POLICY "Admins can view recipients" ON report_recipients
    FOR SELECT USING (get_admin_role() IN ('admin_full', 'admin_monitor'));
