import React from 'react';

export default function LicenseFooter() {
  return (
    <footer style={{
      marginTop: '40px', padding: '25px 20px', textAlign: 'center',
      fontSize: '14px', borderTop: '1px solid #ddd'
    }}>
      &copy; {new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina<br />
      <a href="/LICENSE.txt" target="_blank" style={{
        color: '#666', textDecoration: 'underline', fontWeight: 'bold', fontSize: '14px'
      }}>
        Licenza d'Uso
      </a>
    </footer>
  );
}
