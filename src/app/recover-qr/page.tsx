'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import SaveQRCard from '@/components/SaveQRCard';

export default function RecoverQRPage() {
  const formLoadedAt = useRef(Date.now());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrFirstName, setQrFirstName] = useState('');
  const [qrLastName, setQrLastName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQrToken(null);

    // Honeypot check
    if (website) {
      setError('Richiesta non valida.');
      setLoading(false);
      return;
    }
    // Time-to-submit check
    const elapsed = Date.now() - formLoadedAt.current;
    if (elapsed < 3000) {
      setError('Troppo rapido. Ricarica la pagina e riprova.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, first_name, last_name, qr_tokens!inner(token)')
        .eq('phone', phone)
        .eq('qr_tokens.is_active', true)
        .maybeSingle();

      if (fetchError || !data) {
        throw new Error("Nessun QR code attivo trovato per questo numero di telefono.");
      }

      const tokens = (data as any).qr_tokens;
      const token = Array.isArray(tokens) ? tokens[0]?.token : tokens?.token;
      if (!token) throw new Error("Nessun QR code attivo trovato.");

      setQrToken(token);
      setQrFirstName(data.first_name);
      setQrLastName(data.last_name);
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
          <SaveQRCard fileName={`LNI_Messina_QR_${qrToken}`}>
            <div style={{ textAlign: 'center', padding: '25px' }}>
              <img src="/logo.png" alt="LNI Messina" style={{ height: '60px', width: 'auto', marginBottom: '15px' }} />
              <p style={{ fontSize: '18px', color: '#003366', fontWeight: 'bold', margin: '0 0 20px' }}>
                Lega Navale Italiana — Sezione di Messina
              </p>
              <h3 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>
                {qrFirstName} {qrLastName}
              </h3>
              <QRCodeDisplay token={qrToken} size={260} />
              <p style={{ fontSize: '18px', color: '#666', marginTop: '20px', lineHeight: '1.5' }}>
                Il tuo codice personale:<br />
                <strong style={{ fontSize: '28px', color: '#003366', letterSpacing: '3px' }}>{qrToken}</strong>
              </p>
            </div>
          </SaveQRCard>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
            <button onClick={() => window.open(`/validate/${qrToken}`, '_blank')} className="button-legacy" style={{ padding: '20px 30px', fontSize: '24px' }}>
              Visualizza QR Code
            </button>
            <button onClick={() => window.location.href = '/'} className="button-legacy" style={{ backgroundColor: '#6c757d', padding: '20px 30px', fontSize: '24px' }}>
              Torna alla Home
            </button>
          </div>
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
      
      <p>Inserisci il numero di telefono usato durante la registrazione per visualizzare il tuo QR Code.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
        </div>
        <label className="label-legacy">Numero di Telefono</label>
        <input
          required
          type="tel"
          pattern="[0-9]{9,15}"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-legacy"
          placeholder="Es. 3201234567"
        />

        {error && <div style={{ color: 'red', fontSize: '22px', marginTop: '20px', textAlign: 'center' }}>❌ {error}</div>}
        
        <button type="submit" disabled={loading} className="button-legacy">
          {loading ? 'Ricerca in corso...' : 'Mostra QR Code'}
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
