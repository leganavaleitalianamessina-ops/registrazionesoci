'use client';

import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import SaveQRCard from '@/components/SaveQRCard';

export default function RegisterPage() {
  const formLoadedAt = useRef(Date.now());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    website: '',
    gdprConsent: true,
    marketingConsent: true,
  });

  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrPhone, setQrPhone] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '/' + val.slice(5);
    setFormData((prev) => ({ ...prev, dateOfBirth: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanFirstName = formData.firstName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      const cleanLastName = formData.lastName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName,
          dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.split('/').reverse().join('-') : null,
          phone: formData.phone.trim(),
          gdprConsent: formData.gdprConsent,
          marketingConsent: formData.marketingConsent,
          elapsed: Date.now() - formLoadedAt.current,
          website: formData.website,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore di comunicazione. Riprova.');
      }

      setQrToken(data.token);
      setQrPhone(data.phone);
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
          <div style={{ height: '80px', width: 'auto' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '100%', width: 'auto' }} />
          </div>
          <h2>Iscrizione Completata!</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <SaveQRCard fileName={`LNI_Messina_QR_${qrToken}`}>
            <div style={{ textAlign: 'center', padding: '25px' }}>
              <img src="/logo.png" alt="LNI Messina" style={{ height: '60px', width: 'auto', marginBottom: '15px' }} />
              <p style={{ fontSize: '18px', color: '#003366', fontWeight: 'bold', margin: '0 0 20px' }}>
                Lega Navale Italiana — Sezione di Messina
              </p>
              <QRCodeDisplay token={qrToken || ''} size={260} />
              <p style={{ fontSize: '18px', color: '#666', marginTop: '20px', lineHeight: '1.5' }}>
                Il tuo codice personale:<br />
                <strong style={{ fontSize: '28px', color: '#003366', letterSpacing: '3px' }}>{qrToken}</strong>
              </p>
              <p style={{ fontSize: '18px', color: '#666', marginTop: '20px', lineHeight: '1.5' }}>
                Mostra questo QR code all&apos;operatore per il check-in.
              </p>
              {qrPhone && <p style={{ fontSize: '14px', color: '#aaa', marginTop: '10px' }}>
                Puoi recuperare il QR code inserendo il numero <strong>{qrPhone}</strong> nella pagina Recupera QR.
              </p>}
            </div>
          </SaveQRCard>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
            <button onClick={() => window.open(`/validate/${qrToken}`, '_blank')} className="button-legacy">
              Visualizza QR Code
            </button>
            <button onClick={() => window.location.href = '/'} className="button-legacy" style={{ backgroundColor: '#666' }}>
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
          <img src="/logo.png" alt="Logo LNI" style={{ height: '100%', width: 'auto' }} />
        </div>
        <h2>Richiesta di Pre-Iscrizione</h2>
      </div>
      <p style={{ fontSize: '22px' }}>Compila il modulo per avviare la tua pre-iscrizione alla LNI Messina.</p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" value={formData.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
        </div>
        <label className="label-legacy">Nome *</label>
        <input required name="firstName" value={formData.firstName} onChange={handleChange} className="input-legacy" />

        <label className="label-legacy">Cognome *</label>
        <input required name="lastName" value={formData.lastName} onChange={handleChange} className="input-legacy" />

        <label className="label-legacy">Data di Nascita *</label>
        <input required type="text" name="dateOfBirth" inputMode="numeric" placeholder="DD/MM/AAAA" value={formData.dateOfBirth} onChange={handleDateChange} className="input-legacy" />

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

        {error && <div style={{ color: 'red', fontSize: '24px', textAlign: 'center', margin: '20px 0' }}>
          ❌ {error.includes('Home Page')
            ? <>Questo numero di telefono è già registrato. Usa 'Recupera QRCode' nella <a href="/" style={{ color: 'red', textDecoration: 'underline' }}>Home Page</a>.</>
            : error}
        </div>}

        <button type="submit" disabled={loading} className="button-legacy">
          {loading ? 'Invio in corso...' : 'Registrati e ricevi il tuo QR Code'}
        </button>
      </form>
    </div>
  );
}
