'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import OperatorGuard from '@/components/OperatorGuard';
import LicenseFooter from '@/components/LicenseFooter';

export default function OperatorHomePage() {
  const router = useRouter();

  return (
    <OperatorGuard>
      <div style={{
        width: '100%', minHeight: 'calc(100vh - 50px)', padding: '30px 20px',
        boxSizing: 'border-box', background: '#f0f2f5',
        fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="/logo.png" alt="Logo LNI" style={{ height: '90px', width: 'auto', marginBottom: '15px' }} />
          <h1 style={{ fontSize: '26px', color: '#003366', margin: 0 }}>Operatore LNI Messina</h1>
          <p style={{ fontSize: '15px', color: '#666', marginTop: '8px' }}>Seleziona un'operazione</p>
        </div>

        <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button onClick={() => router.push('/checkin')} style={{
            width: '100%', padding: '35px 20px', background: 'white', border: 'none',
            borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            borderLeft: '6px solid #007bff'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>Scanner Check-in</div>
            <div style={{ fontSize: '14px', color: '#888', marginTop: '6px' }}>Verifica QR code soci e pre-aderenti</div>
          </button>

          <button onClick={() => router.push('/operator/accessi')} style={{
            width: '100%', padding: '35px 20px', background: 'white', border: 'none',
            borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            borderLeft: '6px solid #28a745'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>Registro Accessi</div>
            <div style={{ fontSize: '14px', color: '#888', marginTop: '6px' }}>Visualizza ingressi nelle ultime ore</div>
          </button>
        </div>
      <LicenseFooter />
      </div>
    </OperatorGuard>
  );
}
