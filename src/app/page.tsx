import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, UserPlus, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="mb-12">
        <div className="flex items-center justify-center w-32 h-32 mx-auto mb-6 bg-white rounded-full overflow-hidden shadow-xl">
          <Image 
            src="/logo.png" 
            alt="Logo LNI Messina" 
            width={120} 
            height={120} 
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          LNI <span className="text-lni-accent">MESSINA</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Web App ufficiale per la gestione pre-adesioni e check-in soci.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <Link href="/register" className="btn-primary flex items-center justify-center gap-3">
          <UserPlus className="w-5 h-5" />
          Pre-Adesione
        </Link>
        
        <Link href="/checkin" className="btn-primary bg-slate-800 hover:bg-slate-700 flex items-center justify-center gap-3">
          <ShieldCheck className="w-5 h-5" />
          Check-in Operatore
        </Link>

        <Link href="/recover-qr" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors py-4">
          <Search className="w-4 h-4" />
          Recupera il tuo QRCode
        </Link>
      </div>

      <footer className="mt-20 text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina
      </footer>
    </main>
  );
}
