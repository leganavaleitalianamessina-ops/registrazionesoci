'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import LicenseFooter from '@/components/LicenseFooter';

interface Recipient {
  id: string;
  email: string;
  enabled: boolean;
  created_at: string;
}

async function apiFetch(path: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
      ...options?.headers,
    },
  })
}

export default function AdminRecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');

  const fetchRecipients = async () => {
    const res = await apiFetch('/api/admin/recipients')
    if (res.ok) setRecipients(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchRecipients() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await apiFetch('/api/admin/recipients', { method: 'POST', body: JSON.stringify({ email: newEmail }) })
    if (!res.ok) {
      const err = await res.json()
      setError(err.error || 'Errore durante l\'aggiunta')
      return
    }
    setNewEmail('')
    fetchRecipients()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Rimuovere questo indirizzo email?')) return
    await apiFetch(`/api/admin/recipients?id=${id}`, { method: 'DELETE' })
    fetchRecipients()
  }

  if (loading) return <div style={{ textAlign: 'center', fontSize: '24px', padding: '60px', background: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>Caricamento...</div>

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#003366', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <a href="/admin" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '16px', textDecoration: 'none' }}>← Indietro</a>
        <h1 style={{ fontSize: '20px', margin: 0 }}>Destinatari Report</h1>
      </div>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <p style={{ fontSize: '15px', color: '#666', marginBottom: '20px' }}>
          Gli indirizzi email qui inseriti riceveranno il report settimanale (lunedì) e il report mensile (1° del mese).
        </p>

        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <input required type="email" placeholder="Inserisci email..." value={newEmail} onChange={e => setNewEmail(e.target.value)}
            style={{ flex: 1, minWidth: '250px', padding: '14px 18px', border: '2px solid #ddd', borderRadius: '10px', fontSize: '17px' }} />
          <button type="submit" style={{ padding: '14px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer' }}>
            + Aggiungi
          </button>
        </form>

        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 16px', borderRadius: '8px', marginBottom: '15px', fontSize: '15px' }}>{error}</div>}

        {recipients.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#888', padding: '40px' }}>Nessun destinatario configurato</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recipients.map(r => (
              <div key={r.id} style={{
                background: 'white', borderRadius: '10px', padding: '15px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                borderLeft: `5px solid ${r.enabled ? '#28a745' : '#ccc'}`
              }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{r.email}</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '3px' }}>
                    {r.enabled ? 'Attivo' : 'Disabilitato'} · Aggiunto il {new Date(r.created_at).toLocaleDateString('it-IT')}
                  </div>
                </div>
                <button onClick={() => handleDelete(r.id)} style={{
                  padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
                }}>Rimuovi</button>
              </div>
            ))}
          </div>
        )}
        <LicenseFooter />
      </div>
    </div>
  )
}
