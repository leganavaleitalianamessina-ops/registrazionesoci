'use client';

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function CheckinPage() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 280, height: 280 }, aspectRatio: 1.0 },
      false
    );

    scanner.render(async (decodedText) => {
      if (!isScanning) return;
      setIsScanning(false);

      try {
        const parts = decodedText.split('/');
        const token = parts[parts.length - 1];

        const { data, error } = await supabase
          .from('qr_tokens')
          .select('*, users(*)')
          .eq('token', token)
          .single();

        if (error || !data) {
          setScanResult({ success: false, message: "NON VALIDO" });
        } else {
          const user = data.users;
          setScanResult({ success: true, message: "VALIDO", name: `${user.first_name} ${user.last_name}` });
          await supabase.from('checkin_logs').insert([{ user_id: user.id, checkin_result: 'SUCCESS' }]);
          if (navigator.vibrate) navigator.vibrate(200);
        }
      } catch (e) {
        setScanResult({ success: false, message: "ERRORE" });
      }
    }, () => {});

    return () => { scanner.clear().catch(() => {}); };
  }, [isScanning]);

  return (
    <div className="container-legacy">
      <div className="header-logo-legacy">
        <div style={{ height: '60px', width: 'auto' }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ height: '100%', width: 'auto', display: 'block' }} 
          />
        </div>
        <h2>Scanner Check-in</h2>
      </div>

      {isScanning ? (
        <div id="reader" style={{ width: '100%', borderRadius: '20px', overflow: 'hidden', border: '4px solid #007bff' }}></div>
      ) : (
        <div style={{ 
          padding: '40px 20px', 
          borderRadius: '20px', 
          backgroundColor: scanResult?.success ? '#28a745' : '#dc3545', 
          color: 'white', 
          textAlign: 'center' 
        }}>
          <h1 style={{ fontSize: '60px', fontWeight: '900', margin: '0' }}>{scanResult?.message}</h1>
          {scanResult?.name && <p style={{ fontSize: '30px', fontWeight: 'bold', marginTop: '20px' }}>{scanResult.name}</p>}
          <button 
            onClick={() => { setScanResult(null); setIsScanning(true); }}
            className="button-legacy" 
            style={{ backgroundColor: 'white', color: 'black', marginTop: '40px' }}
          >
            NUOVA SCANSIONE
          </button>
        </div>
      )}

      <style jsx>{`
        .container-legacy { width: 100%; min-height: 100vh; padding: 20px; box-sizing: border-box; background: white; font-family: Arial, sans-serif; }
        .header-logo-legacy { display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .header-logo-legacy h2 { margin: 0; font-size: 28px; font-weight: bold; color: #007bff; margin-left: 10px; }
        .button-legacy { background-color: #007bff; color: white; padding: 25px; border: none; border-radius: 12px; cursor: pointer; width: 100%; font-size: 26px; font-weight: bold; }
      `}</style>
    </div>
  );
}
