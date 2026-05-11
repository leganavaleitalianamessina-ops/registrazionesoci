-- GDPR CLEANUP LOGIC
-- Automatically delete pre-members after 90 days or based on expiration_date

-- Function to be called by a Supabase Cron Job (pg_cron)
CREATE OR REPLACE FUNCTION delete_expired_pre_members()
RETURNS void AS $$
BEGIN
    -- Delete pre_members where expiration_date has passed
    DELETE FROM users
    WHERE user_type = 'pre_member'
    AND (expiration_date < NOW() OR registration_date < NOW() - INTERVAL '90 days');
    
    -- Cleanup orphaned QR tokens (though cascading delete should handle it)
    DELETE FROM qr_tokens
    WHERE user_id NOT IN (SELECT id FROM users);
END;
$$ LANGUAGE plpgsql;

-- Note: To enable the cron job in Supabase:
-- select cron.schedule('0 0 * * *', 'SELECT delete_expired_pre_members();');
