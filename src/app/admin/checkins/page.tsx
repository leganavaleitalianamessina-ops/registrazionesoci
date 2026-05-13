'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CheckinLog {
  id: string;
  user_id: string;
  checkin_result: string;
  device_info: string;
  created_at: string;
  users: { first_name: string; last_name: string; email: string } | null;
}

async function apiFetch(path: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(path, {
    ...options,
    headers: { 'Authorization': `Bearer ${session?.access_token}`, ...options?.headers },
  })
}

export default function AdminCheckinsPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [logs, setLogs] = useState<CheckinLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [success, setSuccess] = useState(0)
  const [monthTotal, setMonthTotal] = useState(0)

  const fetchCheckins = async (d: string) => {
    setLoading(true)
    const [dayRes, monthRes] = await Promise.all([
      apiFetch(`/api/admin/checkins?date=${d}&range=day`),
      apiFetch(`/api/admin/checkins?date=${d}&range=month`),
    ])
    const dayData = await dayRes.json()
    const monthData = await monthRes.json()
    setLogs(dayData.logs || [])
    setTotal(dayData.total || 0)
    setSuccess(dayData.success || 0)
    setMonthTotal(monthData.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchCheckins(date) }, [])

  const resultColor = (r: string) => r === 'SUCCESS' ? '#28a745' : r === 'EXPIRED' ? '#ffc107' : '#dc3545'
  const resultLabel = (r: string) => r === 'SUCCESS' ? '✅ VALIDO' : r === 'EXPIRED' ? '⏳ SCADUTO' : r === 'NOT_FOUND' ? '❌ NON TROVATO' : r

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#003366', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <a href="/admin" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '16px', textDecoration: 'none' }}>← Indietro</a>
        <h1 style={{ fontSize: '20px', margin: 0 }}>Visualizza Ingressi</h1>
      </div>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>Seleziona Data</label>
          <input type="date" value={date} onChange={e => { setDate(e.target.value); fetchCheckins(e.target.value) }}
            style={{ padding: '12px 16px', border: '2px solid #ddd', borderRadius: '10px', fontSize: '17px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' }}>
          <StatCard value={total} label={`Ingressi del ${date}`} color="#007bff" />
          <StatCard value={success} label="Check-in Riusciti" color="#28a745" />
          <StatCard value={total - success} label="Non Riusciti" color="#dc3545" />
          <StatCard value={monthTotal} label="Ingressi del Mese" color="#ffc107" />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '22px', padding: '60px', color: '#888' }}>Caricamento...</p>
        ) : logs.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '20px', padding: '60px', color: '#888' }}>Nessun ingresso per questa data</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <thead>
                <tr style={{ background: '#003366', color: 'white' }}>
                  <th style={th}>Ora</th>
                  <th style={th}>Nome</th>
                  <th style={th}>Email</th>
                  <th style={th}>Esito</th>
                  <th style={th}>Dispositivo</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={td}>{new Date(l.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={td}>{l.users ? `${l.users.first_name} ${l.users.last_name}` : '—'}</td>
                    <td style={td}>{l.users?.email || '—'}</td>
                    <td style={td}><span style={{ background: resultColor(l.checkin_result), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px' }}>{resultLabel(l.checkin_result)}</span></td>
                    <td style={{ ...td, fontSize: '13px', color: '#888', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.device_info || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: '36px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>{label}</div>
    </div>
  )
}

const th: React.CSSProperties = { padding: '14px 12px', textAlign: 'left', fontSize: '15px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '12px', fontSize: '15px' }
