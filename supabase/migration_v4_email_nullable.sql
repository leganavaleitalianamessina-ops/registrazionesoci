-- MIGRATION V4: Email resa opzionale, ricerca QR per telefono
--
-- Come eseguire:
--   1. Apri la Dashboard Supabase (https://supabase.com/dashboard/project/rutkjmqfdsgtqdztyzyq)
--   2. Vai su SQL Editor
--   3. Incolla e esegui questo script

-- 1. Email nullable (non più obbligatoria in registrazione pubblica)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- 2. Indice su telefono per recupero QR
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
