'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gdprConsent: false,
    marketingConsent: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Inserimento utente
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            user_type: 'pre_member',
            status: 'active',
            gdpr_consent: formData.gdprConsent,
            marketing_consent: formData.marketingConsent,
            expiration_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 giorni
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      // 2. Generazione Token QR (Random 8 caratteri)
      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { error: tokenError } = await supabase
        .from('qr_tokens')
        .insert([
          {
            user_id: userData.id,
            token: token,
            is_active: true,
          },
        ]);

      if (tokenError) throw tokenError;

      setSuccess(true);
      // In un'applicazione reale, qui scatterebbe l'invio email tramite Edge Function o servizio esterno
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Si è verificato un errore durante la registrazione.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Registrazione Completata!</h1>
        <p className="text-slate-400 text-lg mb-8 max-w-md">
          La tua richiesta di pre-adesione è stata presa in carico. Riceverai a breve un'email con il tuo QRCode per l'accesso.
        </p>
        <Link href="/" className="btn-primary">
          Torna alla Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-10 mt-4">
        <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="Logo LNI" 
            width={40} 
            height={40} 
            className="object-contain"
          />
          <span className="font-bold tracking-wider">LNI MESSINA</span>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <section className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">Pre-Adesione</h1>
        <p className="text-slate-400">Compila il modulo per ricevere il tuo codice di accesso temporaneo.</p>
      </section>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Nome</label>
            <input
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Inserisci il tuo nome"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-lg focus:ring-2 focus:ring-lni-blue outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Cognome</label>
            <input
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Inserisci il tuo cognome"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-lg focus:ring-2 focus:ring-lni-blue outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Email</label>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="esempio@email.com"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-lg focus:ring-2 focus:ring-lni-blue outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Telefono</label>
          <input
            required
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="333 1234567"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-lg focus:ring-2 focus:ring-lni-blue outline-none transition-all"
          />
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <input
              required
              type="checkbox"
              id="gdprConsent"
              name="gdprConsent"
              checked={formData.gdprConsent}
              onChange={handleChange}
              className="mt-1 w-5 h-5 rounded border-slate-700 bg-slate-800 text-lni-blue focus:ring-lni-blue"
            />
            <label htmlFor="gdprConsent" className="text-sm text-slate-300 leading-relaxed">
              Dichiaro di aver letto l'Informativa sul Trattamento dei Dati Personali e acconsento al trattamento dei dati ai fini della registrazione. (Obbligatorio)
            </label>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              id="marketingConsent"
              name="marketingConsent"
              checked={formData.marketingConsent}
              onChange={handleChange}
              className="mt-1 w-5 h-5 rounded border-slate-700 bg-slate-800 text-lni-blue focus:ring-lni-blue"
            />
            <label htmlFor="marketingConsent" className="text-sm text-slate-300 leading-relaxed">
              Acconsento all'invio di comunicazioni e newsletter (Facoltativo)
            </label>
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            'Registra e Invia Codice'
          )}
        </button>
      </form>
    </main>
  );
}
