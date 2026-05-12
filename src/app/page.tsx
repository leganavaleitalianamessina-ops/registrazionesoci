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

        {/* Contenitore per i pulsanti centrati con larghezza auto */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px', width: '100%' }}>
          <Link href="/register" className="button-legacy-adaptive">
            Richiesta Pre-Iscrizione
          </Link>
          
          <Link href="/recover-qr" className="button-legacy-adaptive">
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
        /* STILE ADATTIVO: Larghezza auto e centrato */
        .button-legacy-adaptive { 
          background-color: #007bff !important; 
          color: white !important; 
          padding: 25px 50px !important; /* Più padding laterale per bilanciare l'auto-width */
          margin: 0 !important; 
          border: none !important; 
          border-radius: 8px !important; 
          cursor: pointer !important; 
          width: auto !important; /* RICHIESTA: Larghezza adattiva */
          min-width: 320px; /* Minimo per leggibilità su mobile */
          max-width: 90%; /* Massimo per non uscire dallo schermo */
          font-size: 30px !important; 
          font-weight: bold !important; 
          box-sizing: border-box !important; 
          display: inline-block !important;
          text-align: center !important;
          text-decoration: none !important;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .button-legacy-adaptive:active {
          opacity: 0.9;
          transform: translateY(2px);
        }
      `}</style>
    </div>
  );
}
