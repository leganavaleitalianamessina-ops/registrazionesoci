'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import OperatorGuard from '@/components/OperatorGuard';

export default function CheckinPage() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const playSound = (success: boolean) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    if (success) {
      oscillator.frequency.value = 880;
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } else {
      oscillator.frequency.value = 220;
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    }
  };

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner("reader",
      { fps: 20, qrbox: { width: 280, height: 280 }, aspectRatio: 1.0, showTorchButtonIfSupported: true },
      false
    );
    scannerRef.current = scanner;

    try {
      scanner.render(async (decodedText) => {
        setIsScanning(false);
        try {
          const parts = decodedText.split('/');
          const token = parts[parts.length - 1].trim().toUpperCase();

          const { data, error } = await supabase
            .from('qr_tokens')
            .select('*, users(*)')
            .eq('token', token)
            .single();

          const deviceInfo = navigator.userAgent || 'unknown';

          const logCheckin = async (userId: string | null, result: string) => {
            await supabase.from('checkin_logs').insert({
              user_id: userId,
              checkin_result: result,
              device_info: deviceInfo,
            });
          };

          if (error || !data) {
            playSound(false);
            setScanResult({ success: false, message: "NON VALIDO", sub: "Codice non trovato" });
            await logCheckin(null, 'NOT_FOUND');
          } else {
            const user = data.users;
            const isExpired = new Date(user.expiration_date) < new Date();

            if (isExpired) {
              playSound(false);
              setScanResult({ success: false, message: "SCADUTO", sub: `Valido fino al ${new Date(user.expiration_date).toLocaleDateString()}` });
              await logCheckin(user.id, 'EXPIRED');
            } else {
              playSound(true);
              setScanResult({
                success: true,
                message: "VALIDO",
                name: `${user.first_name} ${user.last_name}`,
                type: user.user_type === 'pre_member' ? 'Pre-Iscrizione' : 'Socio'
              });
              await logCheckin(user.id, 'SUCCESS');
            }
          }
        } catch (e: any) {
          playSound(false);
          setScanResult({ success: false, message: "ERRORE", sub: "Riprova tra un istante" });
        }
      }, () => {});
    } catch (e) {
      setScannerError("Impossibile accedere alla fotocamera. Autorizza l'accesso e riprova.");
      setIsScanning(false);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
      }
    };
  }, [isScanning]);

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <OperatorGuard>
      <div style={{
        width: '100%', minHeight: 'calc(100vh - 50px)', padding: '20px', boxSizing: 'border-box',
        background: '#fff', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ height: '60px', width: 'auto' }}>
              <img src="/logo.png" alt="LNI Logo" style={{ height: '100%', width: 'auto' }} />
            </div>
            <h2 style={{ fontSize: '28px', color: '#007bff', marginLeft: '15px', margin: 0 }}>Scanner Check-in</h2>
          </div>
          <a href="/operator" style={{ color: '#007bff', fontSize: '14px', textDecoration: 'none', padding: '6px 16px', background: '#f0f2f5', borderRadius: '8px' }}>
            Home Operatore
          </a>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {scannerError ? (
            <div style={{ padding: '40px 20px', borderRadius: '20px', backgroundColor: '#fff3cd', color: '#856404', textAlign: 'center', border: '2px solid #ffc107' }}>
              <p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Errore Fotocamera</p>
              <p style={{ fontSize: '16px', marginTop: '10px' }}>{scannerError}</p>
              <button onClick={() => { setScannerError(null); setIsScanning(true); }}
                style={{ padding: '14px 30px', marginTop: '20px', background: '#ffc107', color: '#856404', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
                Riprova
              </button>
            </div>
          ) : isScanning ? (
            <div>
              <div id="reader" style={{ width: '100%', borderRadius: '20px', overflow: 'hidden', border: '4px solid #007bff', backgroundColor: '#f8f9fa' }}></div>
              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '20px', color: '#666' }}>Inquadra il QRCode del socio</p>
            </div>
          ) : (
            <div style={{
              padding: '60px 20px', borderRadius: '30px',
              backgroundColor: scanResult?.success ? '#28a745' : '#dc3545',
              color: 'white', textAlign: 'center',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
            }}>
              <h1 style={{ fontSize: '70px', fontWeight: '900', margin: '0' }}>{scanResult?.message}</h1>
              <div style={{ marginTop: '30px' }}>
                {scanResult?.name && <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '0' }}>{scanResult.name}</p>}
                {scanResult?.type && <p style={{ fontSize: '24px', opacity: 0.9 }}>{scanResult.type}</p>}
                {scanResult?.sub && <p style={{ fontSize: '22px', marginTop: '10px', fontStyle: 'italic' }}>{scanResult.sub}</p>}
              </div>
              <button onClick={resetScanner}
                style={{
                  padding: '25px 40px', background: 'white', color: 'black', border: 'none',
                  borderRadius: '15px', fontSize: '30px', fontWeight: 'bold', cursor: 'pointer',
                  marginTop: '50px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                PROSSIMO SOCIO
              </button>
            </div>
          )}
        </div>

        <footer style={{ marginTop: 'auto', padding: '20px', textAlign: 'center', color: '#888' }}>
          Sistema di Verifica LNI Messina<br />
          <a href="/operator" style={{ color: '#007bff', fontSize: '14px', textDecoration: 'none' }}>Home Operatore</a>
        </footer>
      </div>
    </OperatorGuard>
  );
}
