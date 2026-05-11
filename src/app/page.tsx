import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, UserPlus, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-white">
      <div className="mb-12">
        <div className="flex items-center justify-center w-40 h-40 mx-auto mb-8 bg-white rounded-full overflow-hidden shadow-2xl border border-slate-100 p-2">
          <Image 
            src="/logo.png" 
            alt="Logo LNI Messina" 
            width={160} 
            height={160} 
            className="object-contain"
          />
        </div>
        <h1 className="text-[40px] font-black tracking-tight text-lni-blue mb-4">
          LNI <span className="text-lni-light">MESSINA</span>
        </h1>
        <p className="text-slate-500 text-[22px] max-w-md mx-auto leading-tight">
          Gestione Pre-Adesioni e Check-in Soci
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
        <Link href="/register" className="w-full bg-lni-blue text-white py-8 rounded-2xl font-bold text-[28px] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all">
          <UserPlus className="w-8 h-8" />
          Pre-Adesione
        </Link>
        
        <Link href="/checkin" className="w-full bg-slate-800 text-white py-8 rounded-2xl font-bold text-[28px] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all">
          <ShieldCheck className="w-8 h-8" />
          Check-in
        </Link>

        <Link href="/recover-qr" className="flex items-center justify-center gap-2 text-slate-400 hover:text-lni-blue transition-colors py-4 text-xl">
          <Search className="w-5 h-5" />
          Recupera il tuo QRCode
        </Link>
      </div>

      <footer className="mt-20 text-slate-400 text-lg">
        &copy; {new Date().getFullYear()} Lega Navale Italiana - Messina
      </footer>
    </main>
  );
}
