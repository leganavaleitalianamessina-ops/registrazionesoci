'use client';

import React from 'react';
import Image from 'next/image';

export default function StampaRegistrazionePage() {
  return (
    <div style={{
      width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif',
      padding: '40px 20px', boxSizing: 'border-box', textAlign: 'center'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <img src="/logo.png" alt="Logo LNI Messina" style={{ height: '120px', width: 'auto' }} />
      </div>

      <h1 style={{ fontSize: '32px', color: '#003366', margin: '0 0 10px' }}>
        Lega Navale Italiana — Sezione di Messina
      </h1>
      <p style={{ fontSize: '18px', color: '#555', margin: '0 0 40px' }}>
        Pre-iscrizione online
      </p>

      <div style={{
        background: '#f0f2f5', borderRadius: '20px', padding: '30px',
        marginBottom: '30px', display: 'inline-block'
      }}>
        <img src="/qr-register.png" alt="QR Code pre-iscrizione"
          style={{ width: '280px', height: '280px', display: 'block' }} />
      </div>

      <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#003366', margin: '0 0 10px' }}>
        Inquadra il QR code o visita:
      </p>
      <p style={{ fontSize: '24px', color: '#007bff', margin: '0 0 40px', wordBreak: 'break-all' }}>
        registrazionesoci.vercel.app/register
      </p>

      <div style={{
        border: '2px dashed #ccc', borderRadius: '12px', padding: '20px',
        maxWidth: '500px', fontSize: '15px', color: '#666', lineHeight: '1.6'
      }}>
        <strong>Come fare:</strong><br />
        1. Inquadra il QR code con la fotocamera del telefono<br />
        2. Compila il modulo di pre-iscrizione<br />
        3. Il tuo QR code personale verrà mostrato subito a schermo<br />
        4. Presenta il QR code all&apos;ingresso per il check-in
      </div>

      <div style={{ marginTop: '50px', fontSize: '13px', color: '#999' }}>
        Lega Navale Italiana — Sezione di Messina &copy; {new Date().getFullYear()}
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 1.5cm; }
        }
        @media screen {
          body { background: #fff; }
        }
      `}</style>
    </div>
  );
}
