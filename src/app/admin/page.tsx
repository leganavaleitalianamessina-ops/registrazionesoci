'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [stats, setStats] = useState({ users: 0, activeMembers: 0, preMembers: 0, activeQr: 0, todayCheckins: 0 });
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: roleData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single()
      setAdminRole(roleData?.role || null)

      // Fetch weekly report status
      try {
        const r = await fetch('/api/admin/weekly-report-status')
        const d = await r.json()
        setWeeklyReport(d.enabled)
      } catch {}

      const today = new Date().toISOString().split('T')[0]
      const { count: u } = await supabase.from('users').select('*', { count: 'exact', head: true })
      const { count: am } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'active_member')
      const { count: pm } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'pre_member')
      const { count: q } = await supabase.from('qr_tokens').select('*', { count: 'exact', head: true }).eq('is_active', true)
      const { count: c } = await supabase
        .from('checkin_logs')
        .select('*', { count: 'exact', head: true })
        .in('checkin_result', ['SUCCESS', 'EXPIRED', 'REVOKED', 'NOT_FOUND'])
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`)

      setStats({ users: u || 0, activeMembers: am || 0, preMembers: pm || 0, activeQr: q || 0, todayCheckins: c || 0 })
      setReady(true)
    })()
  }, [])

  const toggleWeeklyReport = async () => {
    const newVal = !weeklyReport
    setWeeklyReport(newVal)
    try {
      await fetch('/api/admin/weekly-report-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newVal }),
      })
    } catch {}
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!ready) return <div style={{ textAlign: 'center', padding: '60px', fontSize: '22px', fontFamily: 'Arial, sans-serif', color: '#888' }}>Caricamento...</div>

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}>
      <Header onLogout={handleLogout} />
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <Card value={stats.users} label="Utenti Totali" color="#007bff" />
          <Card value={stats.activeMembers} label="Soci Attivi" color="#28a745" />
          <Card value={stats.preMembers} label="Aspiranti Soci" color="#ffc107" />
          <Card value={stats.activeQr} label="QR Attivi" color="#6f42c1" />
          <Card value={stats.todayCheckins} label="Check-in Oggi" color="#dc3545" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <NavButton label="Gestione Utenti" desc="Aggiungi, modifica o elimina soci e pre-aderenti" onClick={() => router.push('/admin/users')} color="#007bff" />
          <NavButton label="Visualizza Ingressi" desc="Controlla i check-in per data con riepilogo giornaliero e mensile" onClick={() => router.push('/admin/checkins')} color="#28a745" />
          {adminRole === 'admin_full' && (
            <NavButton label="Registrazione Pubblica" desc="Torna al modulo di pre-iscrizione pubblico" onClick={() => window.open('/register', '_blank')} color="#6c757d" />
          )}
        </div>
        {adminRole === 'admin_full' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Report Settimanale Email</div>
                <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>Invia ogni lunedì le statistiche a leganavaleitalianamessina@gmail.com</div>
              </div>
              <button onClick={toggleWeeklyReport} style={{
                width: '60px', height: '32px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                background: weeklyReport ? '#28a745' : '#ccc', position: 'relative', transition: 'background 0.3s',
              }}>
                <span style={{
                  position: 'absolute', top: '3px', width: '26px', height: '26px', borderRadius: '50%',
                  background: 'white', transition: 'left 0.3s',
                  left: weeklyReport ? '31px' : '3px',
                }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Header({ onLogout }: { onLogout: () => void }) {
  return (
    <div style={{ background: '#003366', color: 'white', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src="/logo.png" alt="Logo" style={{ height: '50px', width: 'auto' }} />
        <h1 style={{ fontSize: '22px', margin: 0 }}>Pannello Amministrazione</h1>
      </div>
      <button onClick={onLogout} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>Esci</button>
    </div>
  )
}

function Card({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '25px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: '42px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '16px', color: '#666', marginTop: '5px' }}>{label}</div>
    </div>
  )
}

function NavButton({ label, desc, onClick, color }: { label: string; desc: string; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '25px', background: 'white', border: 'none', borderRadius: '12px',
      cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `6px solid ${color}`
    }}>
      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>{label}</div>
      <div style={{ fontSize: '15px', color: '#888', marginTop: '5px' }}>{desc}</div>
    </button>
  )
}
