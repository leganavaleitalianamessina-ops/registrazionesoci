'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import Image from 'next/image';
import { Turnstile } from '@marsidev/react-turnstile';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

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
      const cleanEmail = formData.email.trim().toLowerCase();
      const cleanFirstName = formData.firstName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      const cleanLastName = formData.lastName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName,
          email: cleanEmail,
          phone: formData.phone.trim(),
          gdprConsent: formData.gdprConsent,
          marketingConsent: formData.marketingConsent,
          turnstileToken: turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore di comunicazione. Riprova.');
      }

      setSuccess(true);

      // Send confirmation email (silent fail)
      try {
        await fetch('/api/send-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.userId,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            type: 'confirmation',
            confirmToken: data.confirmToken,
          }),
        });
      } catch (emailErr) {
        console.error('Errore invio email conferma:', emailErr);
      }
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
          <div style={{ height: '80px', width: 'auto' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '100%', width: 'auto' }} />
          </div>
          <h2>Conferma la tua Email</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Mail size={64} style={{ color: '#007bff', marginTop: '20px' }} />
          <p style={{ fontSize: '22px', marginTop: '30px', lineHeight: '1.6' }}>
            Ti abbiamo inviato una email di conferma a<br />
            <strong>{formData.email}</strong>
          </p>
          <p style={{ fontSize: '18px', color: '#666', marginTop: '10px', lineHeight: '1.5' }}>
            Clicca sul link presente nell&apos;email per verificare il tuo indirizzo<br />
            e ricevere il tuo QRCode personale.
          </p>
          <div style={{
            marginTop: '30px', padding: '20px', background: '#fff3cd', borderRadius: '12px',
            border: '1px solid #ffc107', display: 'inline-block', textAlign: 'left', maxWidth: '450px'
          }}>
            <p style={{ fontSize: '16px', color: '#856404', margin: 0 }}>
              <strong>📌 Non hai ricevuto l&apos;email?</strong><br />
              1. Controlla la cartella Spam / Promozioni<br />
              2. Assicurati di aver inserito l&apos;email corretta<br />
              3. Se il problema persiste, contatta un amministratore
            </p>
          </div>
          <button onClick={() => window.location.href = '/'} className="button-legacy" style={{ backgroundColor: '#666', marginTop: '30px' }}>
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-legacy">
      <div className="header-logo-legacy">
        <div style={{ height: '80px', width: 'auto' }}>
          <img src="/logo.png" alt="Logo LNI" style={{ height: '100%', width: 'auto' }} />
        </div>
        <h2>Richiesta di Pre-Iscrizione</h2>
      </div>
      <p style={{ fontSize: '22px' }}>Compila il modulo per avviare la tua pre-iscrizione alla LNI Messina.</p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px' }}>
        <label className="label-legacy">Nome *</label>
        <input required name="firstName" value={formData.firstName} onChange={handleChange} className="input-legacy" />

        <label className="label-legacy">Cognome *</label>
        <input required name="lastName" value={formData.lastName} onChange={handleChange} className="input-legacy" />

        <label className="label-legacy">Email *</label>
        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input-legacy" />

        <label className="label-legacy">Telefono *</label>
        <input required type="tel" name="phone" pattern="[0-9]{9,15}" value={formData.phone} onChange={handleChange} className="input-legacy" />

        <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />
        
        <h3 style={{ fontSize: '26px', marginTop: '30px' }}>Consensi di Compliance</h3>

        <div style={{ margin: '30px 0', padding: '15px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <input required type="checkbox" id="gdprConsent" name="gdprConsent" checked={formData.gdprConsent} onChange={handleChange} style={{ transform: 'scale(1.8)', marginRight: '15px' }} />
            <label htmlFor="gdprConsent" style={{ fontSize: '18px' }}>
              Dichiaro di aver letto l'<a href="https://www.leganavale.it/mod/aalborg_theme/pages/generic.php?filename=0746730001778785218_InformativaTrattamentoDatiPersonaliRegistrazioneTelematica-Maggio.pdf" target="_blank" style={{ color: '#007bff', textDecoration: 'underline' }}>Informativa Privacy</a> e acconsento al trattamento dei dati personali (Obbligatorio)
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" id="marketingConsent" name="marketingConsent" checked={formData.marketingConsent} onChange={handleChange} style={{ transform: 'scale(1.8)', marginRight: '15px' }} />
            <label htmlFor="marketingConsent" style={{ fontSize: '18px' }}>Accetto l'invio di newsletter e comunicazioni</label>
          </div>
        </div>

        {error && <div style={{ color: 'red', fontSize: '24px', textAlign: 'center', margin: '20px 0' }}>❌ {error}</div>}
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={setTurnstileToken}
          />
        </div>
        
        <button type="submit" disabled={loading || !turnstileToken} className="button-legacy">
          {loading ? 'Invio in corso...' : 'Registrati e ricevi email di conferma'}
        </button>
      </form>
    </div>
  );
}
