'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import OperatorGuard from '@/components/OperatorGuard';
import LicenseFooter from '@/components/LicenseFooter';

interface LogEntry {
  id: string;
  checkin_result: string;
  created_at: string;
  users: { first_name: string; last_name: string } | null;
}

export default function OperatorAccessiPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [range, setRange] = useState(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const fromDate = new Date(Date.now() - range * 60 * 60 * 1000).toISOString();
    const { data, error: fetchError } = await supabase
      .from('checkin_logs')
      .select('*, users(first_name, last_name)')
      .in('checkin_result', ['SUCCESS', 'EXPIRED', 'REVOKED', 'NOT_FOUND'])
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
    fetchData();
  }, [range]);

  const badge = (r: string) => {
    const bg: Record<string, string> = { SUCCESS: '#28a745', EXPIRED: '#ffc107', NOT_FOUND: '#dc3545' };
    return { background: bg[r] || '#6c757d', label: r === 'SUCCESS' ? '✅' : r === 'EXPIRED' ? '⏳' : '❌' };
  };

  return (
    <OperatorGuard>
      <div style={{ background: '#003366', color: 'white', padding: '10px 15px', display: 'flex', justifyContent: 'center' }}>
        <a href="/operator" style={{ color: 'white', fontSize: '14px', textDecoration: 'none', padding: '6px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px' }}>
          ← Home Operatore
        </a>
      </div>

      <div style={{ padding: '15px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          {[24, 12, 6, 4].map(h => (
            <button key={h} onClick={() => setRange(h)}
              style={{
                flex: 1, minWidth: '70px', padding: '12px',
                border: range === h ? '3px solid #003366' : '2px solid #ddd',
                borderRadius: '10px', background: range === h ? '#003366' : 'white',
                color: range === h ? 'white' : '#333', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
              }}>
              Ultime {h}h
            </button>
          ))}
        </div>

        <div style={{ background: '#003366', color: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
              const b = badge(l.checkin_result);
              return (
                <div key={l.id} style={{
                  background: 'white', borderRadius: '10px', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  borderLeft: `5px solid ${b.background}`
                }}>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#333' }}>
                      {l.users ? `${l.users.first_name} ${l.users.last_name}` : 'Sconosciuto'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '3px' }}>
                      {new Date(l.created_at).toLocaleString('it-IT')}
                    </div>
                  </div>
                  <span style={{ fontSize: '22px' }}>{b.label}</span>
                </div>
              );
            })}
          </div>
        )}
      <LicenseFooter />
      </div>
    </OperatorGuard>
  );
}
