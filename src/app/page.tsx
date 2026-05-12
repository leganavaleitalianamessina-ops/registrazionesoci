'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container-legacy">
      <header className="header-logo-legacy">
        <div style={{ height: '100px', width: 'auto' }}>
          <img 
            src="/logo.png" 
            alt="Logo LNI Messina" 
            style={{ height: '100%', width: 'auto', display: 'block' }} 
          />
        </div>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#007bff', marginLeft: '15px', margin: 0 }}>
          LNI MESSINA
        </h2>
      </header>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
        <p style={{ textAlign: 'center', margin: '20px 0 40px 0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
          Benvenuti nella Web App ufficiale della Sezione di Messina.
        </p>

        {/* Ora uso la classe GLOBALE button-legacy */}
        <Link href="/register" className="button-legacy">
          Richiesta Pre-Iscrizione
        </Link>
        
        <Link href="/recover-qr" className="button-legacy">
          Recupera QRCode
        </Link>
      </div>

      <footer style={{ marginTop: 'auto', padding: '40px 0', textAlign: 'center', color: '#888', fontSize: '18px' }}>
        &copy; {new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina
      </footer>
    </div>
  );
}
