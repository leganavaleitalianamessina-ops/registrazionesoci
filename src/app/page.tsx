'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="container-legacy">
      <div className="header-logo-legacy">
        {/* Logo con larghezza auto e altezza fissa per mantenere le proporzioni */}
        <div style={{ height: '100px', width: 'auto', position: 'relative' }}>
          <img 
            src="/logo.png" 
            alt="Logo LNI Messina" 
            style={{ height: '100%', width: 'auto', display: 'block' }} 
          />
        </div>
      </div>
      
      <h1 style={{ textAlign: 'center', fontSize: '38px', fontWeight: '900', color: '#003366', marginTop: '20px', marginBottom: '10px' }}>
        LNI MESSINA
      </h1>
      
      <p style={{ textAlign: 'center', margin: '20px 0 40px 0', fontSize: '24px', color: '#333', lineHeight: '1.3' }}>
        Benvenuti nella Web App ufficiale.<br/>
        Seleziona un'operazione:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
        {/* Pulsante Pre-Iscrizione: Blu con Scritta Bianca */}
        <Link href="/register" className="button-legacy-blue">
          Richiesta Pre-Iscrizione
        </Link>
        
        {/* Pulsante Recupero: Blu con Scritta Bianca */}
        <Link href="/recover-qr" className="button-legacy-blue">
          Recupera QRCode
        </Link>
      </div>

      <footer style={{ marginTop: 'auto', padding: '40px 0', textAlign: 'center', color: '#888', fontSize: '18px' }}>
        &copy; {new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina
      </footer>

      <style jsx>{`
        .container-legacy { 
          width: 100%; 
          min-height: 100vh; 
          padding: 20px; 
          box-sizing: border-box; 
          background: white; 
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .header-logo-legacy { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin-bottom: 20px; 
          width: 100%;
        }
        .button-legacy-blue { 
          background-color: #003366; /* Blu LNI */
          color: white !important; 
          padding: 35px 20px; 
          border: none; 
          border-radius: 15px; 
          cursor: pointer; 
          width: 100%; 
          font-size: 32px; 
          font-weight: bold; 
          box-sizing: border-box; 
          display: block; 
          text-align: center; 
          text-decoration: none;
          box-shadow: 0 10px 20px rgba(0,51,102,0.2);
          transition: transform 0.2s;
        }
        .button-legacy-blue:active {
          transform: scale(0.98);
          background-color: #002244;
        }
      `}</style>
    </div>
  );
}
