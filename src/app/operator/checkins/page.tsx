'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface CheckinLog {
  id: string;
  user_id: string;
  checkin_result: string;
  created_at: string;
  users: { first_name: string; last_name: string } | null;
}

async function apiFetch(path: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(path, {
    ...options,
    headers: { 'Authorization': `Bearer ${session?.access_token}`, ...options?.headers },
  })
}

export default function OperatorCheckinsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<CheckinLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchCheckins = async () => {
    setLoading(true)
    const res = await apiFetch('/api/admin/checkins?range=24h')
    const data = await res.json()
    setLogs(data.logs || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchCheckins() }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const resultColor = (r: string) => r === 'SUCCESS' ? '#28a745' : r === 'EXPIRED' ? '#ffc107' : '#dc3545'
  const resultLabel = (r: string) => r === 'SUCCESS' ? '✅' : r === 'EXPIRED' ? '⏳' : '❌'

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#003366', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
          <h1 style={{ fontSize: '18px', margin: 0 }}>Monitoraggio Operatori — Ultime 24h</h1>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Esci</button>
      </div>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#28a745', color: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{total}</div>
          <div style={{ fontSize: '18px', opacity: 0.9 }}>Accessi totali nelle ultime 24 ore</div>
        </div>

        <button onClick={fetchCheckins} style={{
          width: '100%', padding: '14px', background: '#007bff', color: 'white', border: 'none',
          borderRadius: '10px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px'
        }}>Aggiorna</button>

        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '20px', padding: '40px', color: '#888' }}>Caricamento...</p>
        ) : logs.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '18px', padding: '40px', color: '#888' }}>Nessun accesso nelle ultime 24 ore</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.map(l => (
              <div key={l.id} style={{
                background: 'white', borderRadius: '10px', padding: '15px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                borderLeft: `5px solid ${resultColor(l.checkin_result)}`
              }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {resultLabel(l.checkin_result)} {l.users ? `${l.users.first_name} ${l.users.last_name}` : 'Sconosciuto'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
                    {new Date(l.created_at).toLocaleString('it-IT')}
                  </div>
                </div>
                <div style={{ fontSize: '13px', padding: '4px 10px', borderRadius: '20px', background: resultColor(l.checkin_result), color: 'white', fontWeight: 'bold' }}>
                  {l.checkin_result}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
