'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gdprConsent: false,
    marketingConsent: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            user_type: 'pre_member',
            status: 'active',
            gdpr_consent: formData.gdprConsent,
            marketing_consent: formData.marketingConsent,
            expiration_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { error: tokenError } = await supabase
        .from('qr_tokens')
        .insert([{ user_id: userData.id, token: token, is_active: true }]);

      if (tokenError) throw tokenError;

      setGeneratedToken(token);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Errore di comunicazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container-legacy">
        <div className="header-logo-legacy">
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
          <h2>Registrazione Completata!</h2>
        </div>
        <p>Ecco il tuo QRCode ufficiale. Mostralo al check-in.</p>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
          {generatedToken && <QRCodeDisplay token={generatedToken} />}
        </div>
        <button onClick={() => window.print()} className="button-legacy">Salva QRCode</button>
        <button onClick={() => window.location.href = '/'} className="button-legacy" style={{ backgroundColor: '#666' }}>Torna alla Home</button>
      </div>
    );
  }

  return (
    <div className="container-legacy">
      <div className="header-logo-legacy">
        <Image src="/logo.png" alt="Logo LNI Messina" width={80} height={80} />
        <h2>Richiesta di Pre-Iscrizione</h2>
      </div>
      <p>Compila il modulo per avviare la tua pre-iscrizione non vincolante alla LNI Messina.</p>

      <form onSubmit={handleSubmit}>
        <label className="label-legacy">Nome *</label>
        <input
          required
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="input-legacy"
        />

        <label className="label-legacy">Cognome *</label>
        <input
          required
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="input-legacy"
        />

        <label className="label-legacy">Email *</label>
        <input
          required
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input-legacy"
        />

        <label className="label-legacy">Telefono *</label>
        <input
          required
          type="tel"
          name="phone"
          pattern="[0-9]{9,15}"
          value={formData.phone}
          onChange={handleChange}
          className="input-legacy"
          title="Inserisci solo numeri, minimo 9 cifre"
        />

        <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />
        
        <h3 style={{ fontSize: '26px', marginTop: '30px' }}>Consensi di Compliance</h3>

        <div className="checkbox-group-legacy">
          <input
            required
            type="checkbox"
            id="gdprConsent"
            name="gdprConsent"
            checked={formData.gdprConsent}
            onChange={handleChange}
            style={{ transform: 'scale(1.8)', marginRight: '15px' }}
          />
          <label htmlFor="gdprConsent" style={{ fontSize: '20px' }}>
            Dichiaro di aver letto l'Informativa sul Trattamento dei Dati Personali e acconsento al trattamento dei dati. (Obbligatorio)
          </label>
          <br /><br />

          <input
            type="checkbox"
            id="marketingConsent"
            name="marketingConsent"
            checked={formData.marketingConsent}
            onChange={handleChange}
            style={{ transform: 'scale(1.8)', marginRight: '15px' }}
          />
          <label htmlFor="marketingConsent" style={{ fontSize: '20px' }}>
            Acconsento all'invio di comunicazioni e newsletter (Facoltativo)
          </label>
        </div>

        {error && <div style={{ color: 'red', fontSize: '24px', textAlign: 'center', margin: '20px 0' }}>❌ {error}</div>}

        <button type="submit" disabled={loading} className="button-legacy">
          {loading ? 'Invio in corso...' : 'Registra e Invia Codice'}
        </button>
      </form>

      <style jsx>{`
        .container-legacy { width: 100%; min-height: 100vh; padding: 20px; box-sizing: border-box; background: white; }
        .header-logo-legacy { display: flex; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        .header-logo-legacy h2 { margin: 0; font-size: 30px; font-weight: bold; color: #007bff; margin-left: 15px; }
        .label-legacy { display: block; margin-top: 25px; margin-bottom: 10px; font-weight: bold; font-size: 24px; }
        .input-legacy { width: 100%; padding: 20px; border: 2px solid #ccc; border-radius: 8px; box-sizing: border-box; font-size: 26px; }
        .checkbox-group-legacy { margin: 30px 0; padding: 15px; border: 1px solid #f0f0f0; border-radius: 8px; }
        .button-legacy { background-color: #007bff; color: white; padding: 25px; margin: 40px 0 15px 0; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-size: 30px; font-weight: bold; }
        p { font-size: 22px; color: #333; }
      `}</style>
    </div>
  );
}
