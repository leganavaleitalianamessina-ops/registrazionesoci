'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

interface SaveQRCardProps {
  children: React.ReactNode;
  fileName?: string;
}

export default function SaveQRCard({ children, fileName = 'LNI_Messina_QR' }: SaveQRCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Errore salvataggio immagine:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePDF = () => {
    window.print();
  };

  return (
    <>
      <div ref={cardRef} style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden' }}>
        {children}
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '25px', flexWrap: 'wrap' }}>
        <button onClick={handleSaveImage} disabled={saving}
          style={{
            padding: '16px 28px', background: '#28a745', color: 'white', border: 'none',
            borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', minWidth: '200px'
          }}>
          {saving ? 'Salvataggio...' : 'Salva come Immagine'}
        </button>
        <button onClick={handleSavePDF}
          style={{
            padding: '16px 28px', background: '#003366', color: 'white', border: 'none',
            borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', minWidth: '200px'
          }}>
          Salva come PDF
        </button>
      </div>
    </>
  );
}
