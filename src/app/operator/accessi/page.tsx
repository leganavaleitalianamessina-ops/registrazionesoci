'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LogEntry {
  id: string;
  checkin_result: string;
  created_at: string;
  users: { first_name: string; last_name: string } | null;
}

export default function OperatorAccessiPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [range, setRange] = useState(24);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setAuthenticated(true);
      setLoading(false);
    });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const fromDate = new Date(Date.now() - range * 60 * 60 * 1000).toISOString();

    const { data, error: fetchError } = await supabase
      .from('checkin_logs')
      .select('*, users(first_name, last_name)')
      .gte('created_at', fromDate)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setLogs(data || []);
      setTotal(data?.length || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, range]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    if (username !== 'operatore') {
      setLoginError('Credenziali non valide');
      setLoginLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'operatore@leganavale.it',
      password,
    });

    if (signInError) {
      setLoginError('Credenziali non valide');
      setLoginLoading(false);
    } else {
      setAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
    setLogs([]);
    setTotal(0);
  };

  const resultBadge = (r: string) => {
    const colors: Record<string, string> = { SUCCESS: '#28a745', EXPIRED: '#ffc107', NOT_FOUND: '#dc3545' };
    return { background: colors[r] || '#6c757d', label: r === 'SUCCESS' ? '✅' : r === 'EXPIRED' ? '⏳' : '❌' };
  };

  if (!authenticated) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#003366', fontFamily: 'Arial, sans-serif', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '16px', padding: '40px 30px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
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
            {loginError && <div style={{ color: '#dc3545', textAlign: 'center', margin: '10px 0', padding: '10px', background: '#f8d7da', borderRadius: '8px', fontSize: '15px' }}>{loginError}</div>}
            <button type="submit" disabled={loginLoading}
              style={{ width: '100%', padding: '16px', background: '#003366', color: 'white', border: 'none', borderRadius: '10px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', opacity: loginLoading ? 0.7 : 1 }}>
              {loginLoading ? 'Accesso...' : 'Entra'}
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
    <div style={{ width: '100%', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#003366', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '35px', width: 'auto' }} />
          <h1 style={{ fontSize: '16px', margin: 0 }}>Registro Accessi</h1>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Esci</button>
      </div>

      <div style={{ padding: '15px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          {[24, 12, 6, 4].map(h => (
            <button key={h} onClick={() => setRange(h)}
              style={{
                flex: 1, minWidth: '70px', padding: '12px', border: range === h ? '3px solid #003366' : '2px solid #ddd',
                borderRadius: '10px', background: range === h ? '#003366' : 'white',
                color: range === h ? 'white' : '#333', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
              }}>
              Ultime {h}h
            </button>
          ))}
        </div>

        <div style={{
          background: '#003366', color: 'white', borderRadius: '12px', padding: '20px',
          textAlign: 'center', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '42px', fontWeight: 'bold' }}>{total}</div>
          <div style={{ fontSize: '16px', opacity: 0.9 }}>Accessi nelle ultime {range} ore</div>
        </div>

        <button onClick={fetchData} style={{
          width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none',
          borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px'
        }}>Aggiorna</button>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '18px' }}>Caricamento...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', padding: '30px', color: '#dc3545', fontSize: '18px' }}>Errore: {error}</p>
        ) : logs.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '18px' }}>Nessun accesso nelle ultime {range} ore</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {logs.map(l => {
              const badge = resultBadge(l.checkin_result);
              return (
                <div key={l.id} style={{
                  background: 'white', borderRadius: '10px', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  borderLeft: `5px solid ${badge.background}`
                }}>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#333' }}>
                      {l.users ? `${l.users.first_name} ${l.users.last_name}` : 'Sconosciuto'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '3px' }}>
                      {new Date(l.created_at).toLocaleString('it-IT')}
                    </div>
                  </div>
                  <span style={{ fontSize: '22px' }}>{badge.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
