'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Credenziali non valide. Riprova.');
      setLoading(false);
    } else {
      router.push(redirect);
    }
  };

  return (
    <div style={{
      width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f0f2f5', fontFamily: 'Arial, sans-serif', padding: '20px', boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', background: 'white', borderRadius: '16px',
        padding: '40px 30px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/logo.png" alt="Logo LNI" style={{ height: '80px', width: 'auto', marginBottom: '15px' }} />
          <h1 style={{ fontSize: '24px', color: '#003366', margin: 0 }}>Area Riservata</h1>
          <p style={{ fontSize: '16px', color: '#666', margin: '8px 0 0 0' }}>Accedi per la gestione</p>
        </div>

        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: '#333' }}>Email</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', border: '2px solid #ddd', borderRadius: '10px', fontSize: '18px', boxSizing: 'border-box', marginBottom: '20px', outline: 'none' }}
            placeholder="admin@leganavale.it" />

          <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: '#333' }}>Password</label>
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', border: '2px solid #ddd', borderRadius: '10px', fontSize: '18px', boxSizing: 'border-box', marginBottom: '10px', outline: 'none' }} />

          {error && (
            <div style={{ color: '#dc3545', fontSize: '16px', textAlign: 'center', margin: '15px 0', padding: '10px', background: '#f8d7da', borderRadius: '8px' }}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '10px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#aaa' }}>
          <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>Torna alla Home</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px', fontSize: '20px', fontFamily: 'Arial, sans-serif' }}>Caricamento...</div>}>
      <LoginForm />
    </Suspense>
  );
}
