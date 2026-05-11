'use client';

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, ShieldAlert, Camera, RefreshCw } from 'lucide-react';

interface ScanResult {
  success: boolean;
  message: string;
  userName?: string;
  type?: string;
}

export default function CheckinPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [0] // Camera only
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanError);

    function onScanError(err: any) {
      // Ignoriamo gli errori di "non trovato" durante la scansione continua
    }

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    if (!isScanning || loading) return;
    
    setIsScanning(false);
    setLoading(true);

    try {
      // 1. Estrarre il token dall'URL (formato: https://domain/validate/TOKEN)
      const parts = decodedText.split('/');
      const token = parts[parts.length - 1];

      if (!token) throw new Error("QR Code non valido");

      // 2. Verificare il token nel DB
      const { data: tokenData, error: tokenError } = await supabase
        .from('qr_tokens')
        .select('*, users(*)')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      if (tokenError || !tokenData) {
        setScanResult({ success: false, message: "Codice non trovato o revocato" });
      } else {
        const user = tokenData.users;
        const isExpired = user.expiration_date && new Date(user.expiration_date) < new Date();

        if (isExpired) {
          setScanResult({ 
            success: false, 
            message: "Accesso Scaduto", 
            userName: `${user.first_name} ${user.last_name}` 
          });
        } else {
          setScanResult({ 
            success: true, 
            message: "Accesso Autorizzato", 
            userName: `${user.first_name} ${user.last_name}`,
            type: user.user_type
          });

          // 3. Registrare il log (Check-in)
          await supabase.from('checkin_logs').insert([
            { 
              user_id: user.id, 
              checkin_result: 'SUCCESS',
              device_info: navigator.userAgent
            }
          ]);
          
          // Feedback aptico (vibrazione) se supportato
          if (navigator.vibrate) navigator.vibrate(200);
        }
      }
    } catch (err: any) {
      setScanResult({ success: false, message: "Errore durante la scansione" });
    } finally {
      setLoading(false);
    }
  }

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col p-4">
      <header className="flex items-center justify-between py-4 border-bottom border-slate-800 mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Camera className="text-lni-accent" />
          LNI Check-in
        </h1>
        <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {isScanning && (
          <div className="w-full max-w-md overflow-hidden rounded-3xl border-2 border-slate-800 bg-slate-900 shadow-2xl">
            <div id="reader"></div>
          </div>
        )}

        {scanResult && (
          <div className={`w-full max-w-md p-8 rounded-3xl text-center animate-in zoom-in duration-300 ${
            scanResult.success ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {scanResult.success ? (
              <ShieldCheck className="w-24 h-24 mx-auto mb-6" />
            ) : (
              <ShieldAlert className="w-24 h-24 mx-auto mb-6" />
            )}
            
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">
              {scanResult.message}
            </h2>
            
            {scanResult.userName && (
              <div className="bg-black/20 p-4 rounded-xl mb-8">
                <p className="text-xl font-bold">{scanResult.userName}</p>
                {scanResult.type && (
                  <p className="text-sm opacity-80 uppercase font-medium mt-1">
                    {scanResult.type === 'active_member' ? 'Socio Attivo' : 'Pre-Aderente'}
                  </p>
                )}
              </div>
            )}

            <button 
              onClick={resetScanner}
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <RefreshCw className="w-6 h-6" />
              NUOVA SCANSIONE
            </button>
          </div>
        )}
      </div>

      <footer className="py-6 text-center text-slate-500 text-sm">
        Sistema di Controllo Accessi LNI Messina
      </footer>

      <style jsx global>{`
        #reader { border: none !important; }
        #reader img { display: none; }
        #reader__status_span { display: none; }
        #reader__scan_region { background: black; }
        #reader__dashboard_section_csr button {
          background: #003366 !important;
          color: white !important;
          padding: 10px 20px !important;
          border-radius: 8px !important;
          border: none !important;
          margin-top: 10px !important;
        }
      `}</style>
    </main>
  );
}
