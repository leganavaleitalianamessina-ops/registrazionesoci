import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Promozione - LNI Messina",
  description:
    "Lega Navale Italiana - Sezione di Messina: pre-adesione e check-in con QR code.",
};

export default function PromozionePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <header className="flex w-full items-center justify-center border-b border-slate-200 bg-white py-4 shadow-sm">
        <div className="flex h-16 w-auto items-center">
          <img
            src="/logo.png"
            alt="Logo LNI Messina"
            className="block h-full w-auto"
          />
        </div>
        <h2
          className="ml-4 text-2xl font-bold text-[#003366]"
          style={{ color: "#007bff" }}
        >
          LNI MESSINA
        </h2>
      </header>

      <main className="flex w-full max-w-2xl flex-col items-center px-4 pb-12">
        <section className="py-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#003366]">
            Lega Navale Italiana
          </h1>
          <p className="mt-2 text-lg font-semibold text-slate-600">
            Sezione di Messina
          </p>
        </section>

        <div className="w-full max-w-[430px] overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-200">
          <img
            src="/promozione/poster.jpg"
            alt="Poster promozionale LNI Messina"
            className="h-auto w-full"
            loading="eager"
          />
        </div>

        <section className="mt-10 w-full max-w-[430px]">
          <p className="mb-6 text-center text-lg font-semibold text-slate-700">
            Pre-aderisci comodamente dal tuo smartphone: compila il modulo e
            ricevi il tuo QR code per il check-in in sede.
          </p>

          <Link
            href="/register"
            className="block w-full rounded-lg bg-[#007bff] py-5 text-center text-xl font-bold text-white no-underline shadow-md transition active:translate-y-0.5 active:opacity-90"
          >
            Richiesta Pre-Iscrizione
          </Link>

          <Link
            href="/recover-qr"
            className="mt-4 block w-full rounded-lg border-2 border-[#007bff] bg-white py-5 text-center text-xl font-bold text-[#007bff] no-underline shadow-md transition active:translate-y-0.5 active:opacity-90"
          >
            Recupera QRCode
          </Link>
        </section>
      </main>

      <footer className="mt-auto w-full border-t border-slate-200 py-6 text-center text-slate-500">
        &copy; {new Date().getFullYear()} Lega Navale Italiana - Sezione di
        Messina
      </footer>
    </div>
  );
}
