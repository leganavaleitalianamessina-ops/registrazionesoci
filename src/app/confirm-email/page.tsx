'use client';

import React from 'react';

export default function ConfirmEmailPage() {
  return (
    <div style={{
      width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif',
      background: '#f0f2f5', padding: '20px', boxSizing: 'border-box', textAlign: 'center'
    }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <img src="/logo.png" alt="Logo LNI" style={{ height: '80px', marginBottom: '20px' }} />
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Verifica Email non più richiesta</h2>
        <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
          La registrazione ora è immediata e non richiede più la conferma via email.
          Il QR Code viene generato al momento dell&apos;iscrizione.
        </p>
        <button onClick={() => window.location.href = '/'} style={{
          marginTop: '30px', padding: '16px 40px', background: '#003366', color: 'white',
          border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
        }}>
          Torna alla Home
        </button>
      </div>
    </div>
  );
}
