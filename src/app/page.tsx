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
      
      <div className="content-center">
        <p style={{ textAlign: 'center', margin: '40px 0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
          Benvenuti nella Web App ufficiale della Sezione di Messina.
        </p>

        {/* Pulsanti a larghezza piena identici alla registrazione */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '600px' }}>
          <Link href="/register" className="button-legacy-full">
            Richiesta Pre-Iscrizione
          </Link>
          
          <Link href="/recover-qr" className="button-legacy-full">
            Recupera QRCode
          </Link>
        </div>
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
          margin-bottom: 25px; 
          padding-bottom: 15px; 
          border-bottom: 1px solid #eee; 
          width: 100%;
          box-sizing: border-box;
        }
        .content-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        /* STILE CLONE REGISTRAZIONE: Larghezza 100% */
        .button-legacy-full { 
          background-color: #007bff !important; 
          color: white !important; 
          padding: 25px !important; 
          margin: 10px 0 !important; 
          border: none !important; 
          border-radius: 8px !important; 
          cursor: pointer !important; 
          width: 100% !important; /* Larghezza piena come in registrazione */
          font-size: 30px !important; 
          font-weight: bold !important; 
          box-sizing: border-box !important; 
          display: block !important;
          text-align: center !important;
          text-decoration: none !important;
        }
        .button-legacy-full:active {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
