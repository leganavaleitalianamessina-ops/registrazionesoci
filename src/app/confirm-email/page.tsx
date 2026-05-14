'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QRCodeDisplay from '@/components/QRCodeDisplay';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Link non valido: token mancante.');
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setQrToken(data.token);
          // Send QR code email automatically
          try {
            await fetch('/api/send-qr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                token: data.token,
              }),
            });
          } catch {
            // Silent fail
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'Errore durante la verifica.');
        }
      } catch {
        setStatus('error');
        setMessage('Errore di comunicazione. Riprova.');
      }
    })();
  }, [token]);

  return (
    <div className="container-legacy">
      <div className="header-logo-legacy">
        <div style={{ height: '80px', width: 'auto' }}>
          <img src="/logo.png" alt="Logo LNI" style={{ height: '100%', width: 'auto' }} />
        </div>
        <h2>{status === 'loading' ? 'Verifica in corso...' : status === 'success' ? 'Email Verificata!' : 'Errore'}</h2>
      </div>

      {status === 'loading' && (
        <p style={{ fontSize: '22px', textAlign: 'center', padding: '40px' }}>Verifica della tua email in corso...</p>
      )}

      {status === 'success' && (
        <>
          <p style={{ fontSize: '22px', textAlign: 'center' }}>
            ✅ La tua email è stata verificata con successo!<br />
            Ecco il tuo QRCode ufficiale per il check-in.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
            {qrToken && <QRCodeDisplay token={qrToken} />}
          </div>
          <button
            onClick={() => {
              const canvas = document.querySelector('canvas');
              if (canvas) {
                const link = document.createElement('a');
                link.download = `LNI_Messina_QR_${qrToken}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
              }
            }}
            className="button-legacy"
          >
            Salva QRCode sul Telefono
          </button>
          <button onClick={() => window.print()} className="button-legacy" style={{ backgroundColor: '#6c757d', marginTop: '10px' }}>
            Stampa / PDF
          </button>
          <button onClick={() => window.location.href = '/'} className="button-legacy" style={{ backgroundColor: '#666', marginTop: '10px' }}>
            Torna alla Home
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <p style={{ fontSize: '22px', textAlign: 'center', color: '#dc3545' }}>❌ {message}</p>
          <button onClick={() => window.location.href = '/'} className="button-legacy" style={{ backgroundColor: '#666' }}>
            Torna alla Home
          </button>
        </>
      )}
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="container-legacy">
        <div className="header-logo-legacy">
          <h2>Caricamento...</h2>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
