'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
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
            expiration_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { error: tokenError } = await supabase
        .from('qr_tokens')
        .insert([{ user_id: userData.id, token: token, is_active: true }]);

      if (tokenError) throw tokenError;

      setGeneratedToken(token);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Errore durante la registrazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-white text-slate-900 p-6 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Registrazione Completata!</h1>
        <p className="text-2xl mb-10 text-slate-600">Ecco il tuo QRCode per l'accesso.</p>
        
        {generatedToken && <QRCodeDisplay token={generatedToken} />}
        
        <div className="mt-12 space-y-4 w-full max-w-md">
          <button onClick={() => window.print()} className="w-full bg-slate-100 py-6 rounded-xl font-bold text-2xl border-2 border-slate-200">
            Salva QRCode
          </button>
          <Link href="/" className="block w-full bg-lni-blue text-white py-6 rounded-xl font-bold text-2xl text-center">
            Torna alla Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-2xl mx-auto p-5">
        {/* HEADER IDENTICO AL VECCHIO SISTEMA */}
        <header className="flex items-center border-b border-slate-200 pb-4 mb-6">
          <div className="w-[100px] mr-4">
            <Image src="/logo.png" alt="Logo LNI" width={100} height={100} className="object-contain" />
          </div>
          <h2 className="text-[30px] font-bold text-lni-blue leading-tight">
            Richiesta di Pre-Iscrizione
          </h2>
        </header>

        <p className="text-[22px] mb-8 text-slate-700">
          Compila il modulo per avviare la tua pre-iscrizione non vincolante alla LNI Messina.
        </p>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-5 rounded-xl mb-8 text-xl font-bold text-center">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-[24px] font-bold">Nome *</label>
            <input
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border-2 border-slate-300 rounded-lg p-5 text-[26px] outline-none focus:border-lni-blue"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[24px] font-bold">Cognome *</label>
            <input
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border-2 border-slate-300 rounded-lg p-5 text-[26px] outline-none focus:border-lni-blue"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[24px] font-bold">Email *</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-2 border-slate-300 rounded-lg p-5 text-[26px] outline-none focus:border-lni-blue"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[24px] font-bold">Telefono *</label>
            <input
              required
              type="tel"
              name="phone"
              pattern="[0-9]{9,15}"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Minimo 9 cifre"
              className="w-full border-2 border-slate-300 rounded-lg p-5 text-[26px] outline-none focus:border-lni-blue"
            />
          </div>

          <hr className="border-slate-200" />

          <section>
            <h3 className="text-[26px] font-bold mb-6">Consensi di Compliance</h3>
            
            <div className="space-y-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="flex items-start gap-4">
                <input
                  required
                  type="checkbox"
                  id="gdprConsent"
                  name="gdprConsent"
                  checked={formData.gdprConsent}
                  onChange={handleChange}
                  className="mt-2 w-8 h-8 rounded border-slate-300 text-lni-blue focus:ring-lni-blue accent-lni-blue"
                  style={{ transform: 'scale(1.5)' }}
                />
                <label htmlFor="gdprConsent" className="text-[20px] text-slate-700 leading-tight">
                  Dichiaro di aver letto l'Informativa sul Trattamento dei Dati Personali e acconsento al trattamento dei dati. (Obbligatorio)
                </label>
              </div>

              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  name="marketingConsent"
                  checked={formData.marketingConsent}
                  onChange={handleChange}
                  className="mt-2 w-8 h-8 rounded border-slate-300 text-lni-blue focus:ring-lni-blue accent-lni-blue"
                  style={{ transform: 'scale(1.5)' }}
                />
                <label htmlFor="marketingConsent" className="text-[20px] text-slate-700 leading-tight">
                  Acconsento all'invio di comunicazioni e newsletter (Facoltativo)
                </label>
              </div>
            </div>
          </section>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-lni-blue text-white py-8 rounded-xl font-bold text-[30px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : 'Registra e Invia Codice'}
          </button>
        </form>

        <footer className="py-10 text-center text-slate-400 text-xl">
          &copy; Lega Navale Italiana - Sezione di Messina
        </footer>
      </div>
    </main>
  );
}
