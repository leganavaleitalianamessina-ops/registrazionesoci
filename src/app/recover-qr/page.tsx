'use client';

import React, { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function RecoverQRPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Verifica se l'utente esiste e recupera il token attivo
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

      // 2. Chiamata all'API di invio email
      const response = await fetch('/api/send-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          token: token,
        }),
      });

      if (!response.ok) throw new Error("Errore nell'invio dell'email.");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Errore durante la ricerca.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container-legacy">
        <div className="header-logo-legacy">
          <Image src="/logo.png" alt="Logo" width={80} height={80} />
          <h2>Recupero Inviato</h2>
        </div>
        <p style={{ fontSize: '24px', textAlign: 'center', marginTop: '40px' }}>
          Se l'indirizzo <strong>{email}</strong> è registrato, riceverai a breve un'email con il tuo QRCode.
        </p>
        <button onClick={() => window.location.href = '/'} className="button-legacy" style={{ marginTop: '60px' }}>
          Torna alla Home
        </button>
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
