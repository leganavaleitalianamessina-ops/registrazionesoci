'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface OperatorGuardProps {
  children: React.ReactNode;
}

export default function OperatorGuard({ children }: OperatorGuardProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setAuthenticated(true);
      setInitializing(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username !== 'operatore') {
      setError('Credenziali non valide');
      return;
    }
    setLoading(true);
    setError(null);

    // Rate limit check
    try {
      const rl = await fetch('/api/auth/check-rate-limit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginType: 'operator' }),
      });
      const rlData = await rl.json();
      if (!rlData.allowed) {
        setError(`Troppi tentativi. Riprova tra ${rlData.retryAfterMinutes} minuti.`);
        setLoading(false);
        return;
      }
    } catch {
      // If rate limit API fails, proceed anyway
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'operatore@leganavale.it',
      password,
    });

    if (signInError) {
      setError('Credenziali non valide');
      setLoading(false);
      // Log failed attempt
      fetch('/api/auth/log-attempt', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginType: 'operator', success: false }),
      }).catch(() => {});
    } else {
      setAuthenticated(true);
      // Log successful attempt
      fetch('/api/auth/log-attempt', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginType: 'operator', success: true }),
      }).catch(() => {});
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  };

  if (initializing) {
    return (
      <div style={{
        width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#003366', fontFamily: 'Arial, sans-serif'
      }}>
        <p style={{ color: 'white', fontSize: '18px' }}>Caricamento...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{
        width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#003366', fontFamily: 'Arial, sans-serif', padding: '20px', boxSizing: 'border-box'
      }}>
        <div style={{
          width: '100%', maxWidth: '400px', background: 'white', borderRadius: '16px',
          padding: '40px 30px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <img src="/logo.png" alt="Logo LNI" style={{ height: '70px', width: 'auto', marginBottom: '15px' }} />
            <h1 style={{ fontSize: '22px', color: '#003366', margin: 0 }}>Accesso Operatori</h1>
            <p style={{ fontSize: '14px', color: '#666', margin: '8px 0 0' }}>Inserisci le credenziali</p>
          </div>
          <form onSubmit={handleLogin}>
            <input required placeholder="Utente" value={username} onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', border: '2px solid #ddd', borderRadius: '10px', fontSize: '18px', boxSizing: 'border-box', marginBottom: '15px', outline: 'none' }} />
            <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', border: '2px solid #ddd', borderRadius: '10px', fontSize: '18px', boxSizing: 'border-box', marginBottom: '10px', outline: 'none' }} />
            {error && (
              <div style={{ color: '#dc3545', textAlign: 'center', margin: '10px 0', padding: '10px', background: '#f8d7da', borderRadius: '8px', fontSize: '15px' }}>{error}</div>
            )}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '16px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Accesso...' : 'Entra'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
            <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>Torna alla Home</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 20px', background: '#003366' }}>
        <button onClick={handleLogout}
          style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
          Esci
        </button>
      </div>
      {children}
    </>
  );
}
