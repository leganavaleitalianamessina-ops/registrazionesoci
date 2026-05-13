'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  user_type: 'pre_member' | 'active_member';
  status: 'active' | 'expired' | 'revoked';
  gdpr_consent: boolean;
  marketing_consent: boolean;
  expiration_date: string | null;
  created_at: string;
  qr_tokens?: { token: string; is_active: boolean; created_at: string }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', user_type: 'active_member' as string });

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser.id, ...form }),
      })
    } else {
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setShowForm(false)
    setEditingUser(null)
    setForm({ first_name: '', last_name: '', email: '', phone: '', user_type: 'active_member' })
    fetchUsers()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare definitivamente questo utente?')) return
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    fetchUsers()
  }

  const openEdit = (u: User) => {
    setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, phone: u.phone || '', user_type: u.user_type })
    setEditingUser(u)
    setShowForm(true)
  }

  const statusColor = (s: string) => s === 'active' ? '#28a745' : s === 'expired' ? '#ffc107' : '#dc3545'

  const filtered = users.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ width: '100%', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}><p style={{ textAlign: 'center', fontSize: '24px', padding: '60px' }}>Caricamento...</p></div>

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}>
      <Header onBack={() => window.location.href = '/admin'} title="Gestione Utenti" />

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            placeholder="Cerca nome, cognome o email..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '14px 18px', border: '2px solid #ddd', borderRadius: '10px', fontSize: '17px' }}
          />
          <button onClick={() => { setEditingUser(null); setForm({ first_name: '', last_name: '', email: '', phone: '', user_type: 'active_member' }); setShowForm(true) }}
            style={{ padding: '14px 30px', background: '#007bff', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer' }}>
            + Nuovo Socio
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>{editingUser ? 'Modifica Utente' : 'Nuovo Socio'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input required placeholder="Nome" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} style={inputStyle} />
              <input required placeholder="Cognome" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} style={inputStyle} />
              <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
              <input placeholder="Telefono" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={inputStyle} />
              <select value={form.user_type} onChange={e => setForm(p => ({ ...p, user_type: e.target.value }))} style={inputStyle}>
                <option value="active_member">Socio Attivo</option>
                <option value="pre_member">Pre-Aderente</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" style={{ padding: '14px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer' }}>
                {editingUser ? 'Salva Modifiche' : 'Crea Utente'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingUser(null) }}
                style={{ padding: '14px 30px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '10px', fontSize: '17px', cursor: 'pointer' }}>
                Annulla
              </button>
            </div>
          </form>
        )}

        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '20px', color: '#888', padding: '60px' }}>Nessun utente trovato</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <thead>
                <tr style={{ background: '#003366', color: 'white' }}>
                  <th style={th}>Nome</th>
                  <th style={th}>Email</th>
                  <th style={th}>Telefono</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Stato</th>
                  <th style={th}>QR Token</th>
                  <th style={th}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={td}>{u.first_name} {u.last_name}</td>
                    <td style={td}>{u.email}</td>
                    <td style={td}>{u.phone || '-'}</td>
                    <td style={td}>{u.user_type === 'active_member' ? 'Socio' : 'Pre-Aderente'}</td>
                    <td style={td}><span style={{ background: statusColor(u.status), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px' }}>{u.status}</span></td>
                    <td style={td}>
                      {u.qr_tokens?.filter(t => t.is_active).length ? (
                        <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#003366' }}>
                          {u.qr_tokens.find(t => t.is_active)?.token}
                        </span>
                      ) : (
                        <span style={{ color: '#999' }}>Nessuno</span>
                      )}
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEdit(u)} style={{ padding: '8px 16px', background: '#ffc107', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Modifica</button>
                        <button onClick={() => handleDelete(u.id)} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Elimina</button>
                      </div>
                    </td>
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

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div style={{ background: '#003366', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
      <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '16px' }}>← Indietro</button>
      <h1 style={{ fontSize: '20px', margin: 0 }}>{title}</h1>
    </div>
  )
}

const th: React.CSSProperties = { padding: '14px 12px', textAlign: 'left', fontSize: '15px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '12px', fontSize: '15px' }

const inputStyle: React.CSSProperties = { padding: '12px 14px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', width: '100%', boxSizing: 'border-box' }
