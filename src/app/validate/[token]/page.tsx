'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, AlertCircle } from 'lucide-react';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import SaveQRCard from '@/components/SaveQRCard';
import { supabase } from '@/lib/supabase';

export default function ValidatePage() {
  const params = useParams();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data, error: fetchError } = await supabase
          .from('qr_tokens')
          .select('*, users(*)')
          .eq('token', token)
          .eq('is_active', true)
          .single();

        if (fetchError || !data) {
          setError("Codice non valido o scaduto.");
        } else {
          setUserData(data.users);
        }
      } catch (err) {
        setError("Errore durante il caricamento.");
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchUser();
  }, [token]);

  if (loading) {
    return (
      <div className="container-legacy" style={{ justifyContent: 'center' }}>
        <Loader2 className="w-12 h-12 animate-spin text-lni-blue" />
        <p className="mt-4 text-xl">Caricamento in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-legacy" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <AlertCircle className="w-20 h-20 text-red-500 mb-4" />
        <h2 className="text-3xl font-bold mb-2">Ops!</h2>
        <p className="text-xl text-slate-600 mb-8">{error}</p>
        <button onClick={() => window.location.href = '/'} className="button-legacy">Torna alla Home</button>
      </div>
    );
  }

  return (
    <div className="container-legacy">
      <div className="header-logo-legacy">
        <div style={{ height: '80px', width: 'auto' }}>
          <img src="/logo.png" alt="Logo LNI" style={{ height: '100%', width: 'auto' }} />
        </div>
        <h2>Il tuo QRCode</h2>
      </div>

      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
        <SaveQRCard fileName={`LNI_Messina_QR_${token}`}>
          <div style={{ textAlign: 'center', padding: '25px' }}>
            <img src="/logo.png" alt="LNI Messina" style={{ height: '70px', width: 'auto', marginBottom: '15px' }} />
            <p style={{ fontSize: '18px', color: '#003366', fontWeight: 'bold', margin: '0 0 20px' }}>
              Lega Navale Italiana — Sezione di Messina
            </p>
            <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
              {userData.first_name} {userData.last_name}
            </h3>
            <p style={{ fontSize: '20px', color: '#666', marginBottom: '25px' }}>
              {userData.user_type === 'pre_member' ? 'Socio Pre-Aderente' : 'Socio Attivo'}
            </p>
            <QRCodeDisplay token={token} size={300} />
            <p style={{ marginTop: '25px', fontSize: '18px', color: '#888', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
              Mostra questo codice all'operatore LNI per il check-in.
            </p>
          </div>
        </SaveQRCard>

        <button onClick={() => window.location.href = '/'} className="button-legacy" style={{ backgroundColor: '#6c757d', marginTop: '20px' }}>
          Torna alla Home
        </button>
      </div>

      <footer style={{ marginTop: '40px', padding: '20px', textAlign: 'center', color: '#aaa' }}>
        &copy; Lega Navale Italiana - Sezione di Messina
      </footer>
    </div>
  );
}
