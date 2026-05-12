'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container-legacy">
      <div className="header-logo-legacy">
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
      </div>
      
      <p style={{ textAlign: 'center', margin: '40px 0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
        Benvenuti nella Web App ufficiale della Sezione di Messina.
      </p>

      {/* Contenitore centrato per i pulsanti */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        <Link href="/register" className="button-legacy-fixed">
          Richiesta Pre-Iscrizione
        </Link>
        
        <Link href="/recover-qr" className="button-legacy-fixed">
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
          background: white !important; 
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center; 
        }
        .header-logo-legacy { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin-bottom: 25px; 
          padding-bottom: 15px; 
          border-bottom: 1px solid #eee; 
          width: 100%;
          box-sizing: border-box;
        }
        /* STILE BLINDATO IDENTICO AL PULSANTE DI REGISTRAZIONE */
        .button-legacy-fixed { 
          background-color: #007bff !important; 
          color: white !important; 
          padding: 25px !important; 
          margin: 15px 0 !important; 
          border: none !important; 
          border-radius: 8px !important; 
          cursor: pointer !important; 
          width: 100% !important; 
          font-size: 30px !important; 
          font-weight: bold !important; 
          box-sizing: border-box !important; 
          display: block !important;
          text-align: center !important;
          text-decoration: none !important;
        }
      `}</style>
    </div>
  );
}
