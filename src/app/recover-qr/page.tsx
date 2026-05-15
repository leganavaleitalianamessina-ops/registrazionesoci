'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import QRCodeDisplay from '@/components/QRCodeDisplay';

export default function RecoverQRPage() {
  const formLoadedAt = useRef(Date.now());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrFirstName, setQrFirstName] = useState('');
  const [qrLastName, setQrLastName] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQrToken(null);
    setEmailSent(false);

    try {
      const { data, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, qr_tokens!inner(token)')
        .eq('email', email)
        .eq('qr_tokens.is_active', true)
        .single();

      if (userError || !data) {
        throw new Error("Indirizzo email non trovato o nessun QR code attivo.");
      }

      const tokens = (data as any).qr_tokens;
      const token = Array.isArray(tokens) ? tokens[0]?.token : tokens?.token;
      if (!token) throw new Error("Nessun codice associato a questa email.");

      // Show QR immediately
      setQrToken(token);
      setQrFirstName(data.first_name);
      setQrLastName(data.last_name);

      // Send email asynchronously (silent fail)
      fetch('/api/send-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          token,
          elapsed: Date.now() - formLoadedAt.current,
          website,
        }),
      }).then(r => { if (r.ok) setEmailSent(true); }).catch(() => {});

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Errore durante la ricerca.');
    } finally {
      setLoading(false);
    }
  };

  if (success && qrToken) {
    return (
      <div className="container-legacy">
        <div className="header-logo-legacy">
          <div style={{ height: '80px', width: 'auto' }}>
            <img src="/logo.png" alt="Logo LNI" style={{ height: '100%', width: 'auto', display: 'block' }} />
          </div>
          <h2>QR Code Recuperato</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>
            {qrFirstName} {qrLastName}
          </h3>
          <div style={{
            padding: '20px', backgroundColor: 'white', borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'inline-block'
          }}>
            <QRCodeDisplay token={qrToken} size={260} />
          </div>
          <p style={{ fontSize: '18px', color: '#666', marginTop: '20px', lineHeight: '1.5' }}>
            Il tuo codice personale:<br />
            <strong style={{ fontSize: '28px', color: '#003366', letterSpacing: '3px' }}>{qrToken}</strong>
          </p>
          <p style={{ fontSize: '18px', color: '#666', marginTop: '20px' }}>
            {emailSent
              ? <>Email inviata a <strong>{email}</strong></>
              : <>La email potrebbe essere in arrivo (controlla anche lo spam)</>}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
            <button onClick={() => window.open(`/validate/${qrToken}`, '_blank')} className="button-legacy" style={{ padding: '20px 30px', fontSize: '24px' }}>
              Visualizza QR Code
            </button>
            <button onClick={() => window.location.href = '/'} className="button-legacy" style={{ backgroundColor: '#6c757d', padding: '20px 30px', fontSize: '24px' }}>
              Torna alla Home
            </button>
          </div>
          {!emailSent && (
            <p style={{ fontSize: '14px', color: '#888', marginTop: '20px' }}>
              Puoi salvare il QR code premendo "Visualizza QR Code" e poi "Salva sul telefono".
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container-legacy">
      <div className="header-logo-legacy">
        <div style={{ height: '80px', width: 'auto' }}>
          <img 
            src="/logo.png" 
            alt="Logo LNI" 
            style={{ height: '100%', width: 'auto', display: 'block' }} 
          />
        </div>
        <h2>Recupero QRCode</h2>
      </div>
      
      <p>Inserisci l'indirizzo email usato durante la registrazione per ricevere nuovamente il tuo codice di accesso.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </div>
        <label className="label-legacy">Indirizzo Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-legacy"
          placeholder="esempio@email.it"
        />

        {error && <div style={{ color: 'red', fontSize: '22px', marginTop: '20px', textAlign: 'center' }}>❌ {error}</div>}
        
        <button type="submit" disabled={loading} className="button-legacy">
          {loading ? 'Ricerca in corso...' : 'Invia QRCode'}
        </button>

        <button type="button" onClick={() => window.location.href = '/'} className="button-legacy" style={{ backgroundColor: '#6c757d', marginTop: '20px' }}>
          Annulla
        </button>
      </form>

      <style jsx>{`
        .container-legacy { width: 100%; min-height: 100vh; padding: 20px; box-sizing: border-box; background: white; font-family: Arial, sans-serif; }
        .header-logo-legacy { display: flex; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        .header-logo-legacy h2 { margin: 0; font-size: 30px; font-weight: bold; color: #007bff; margin-left: 15px; }
        .label-legacy { display: block; margin-top: 30px; margin-bottom: 10px; font-weight: bold; font-size: 24px; }
        .input-legacy { width: 100%; padding: 25px; border: 2px solid #ccc; border-radius: 8px; box-sizing: border-box; font-size: 26px; }
        .button-legacy { background-color: #007bff; color: white; padding: 25px; margin: 40px 0 0 0; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-size: 30px; font-weight: bold; }
        p { font-size: 22px; line-height: 1.4; color: #333; }
      `}</style>
    </div>
  );
}
