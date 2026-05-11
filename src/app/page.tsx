'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="container-legacy">
      <div className="header-logo-legacy">
        <div style={{ width: '80px', height: '80px', position: 'relative' }}>
          <Image src="/logo.png" alt="Logo LNI Messina" fill className="object-contain" />
        </div>
        <h2>LNI MESSINA</h2>
      </div>
      
      <p style={{ textAlign: 'center', margin: '40px 0', fontSize: '24px', fontWeight: 'bold' }}>
        Benvenuti nella Web App ufficiale della Sezione di Messina.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Link href="/register" className="button-legacy" style={{ textAlign: 'center', textDecoration: 'none' }}>
          Richiesta Pre-Iscrizione
        </Link>
        
        <Link href="/recover-qr" className="button-legacy" style={{ textAlign: 'center', textDecoration: 'none', backgroundColor: '#6c757d' }}>
          Recupera QRCode
        </Link>
      </div>

      <footer style={{ marginTop: '60px', textAlign: 'center', color: '#888', fontSize: '18px' }}>
        &copy; {new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina
      </footer>

      <style jsx>{`
        .container-legacy { width: 100%; min-height: 100vh; padding: 20px; box-sizing: border-box; background: white; font-family: Arial, sans-serif; }
        .header-logo-legacy { display: flex; align-items: center; justify-content: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .header-logo-legacy h2 { margin: 0; font-size: 36px; font-weight: bold; color: #007bff; margin-left: 15px; }
        .button-legacy { background-color: #007bff; color: white; padding: 30px; border: none; border-radius: 12px; cursor: pointer; width: 100%; font-size: 30px; font-weight: bold; box-sizing: border-box; display: block; }
      `}</style>
    </div>
  );
}
