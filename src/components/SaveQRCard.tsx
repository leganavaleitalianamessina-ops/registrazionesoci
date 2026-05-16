'use client';

import React, { useState } from 'react';
import QRCode from 'qrcode';

interface SaveQRCardProps {
  children: React.ReactNode;
  fileName?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
}

export default function SaveQRCard({ children, fileName = 'LNI_Messina_QR', firstName, lastName, token }: SaveQRCardProps) {
  const [saving, setSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const size = 400;
      const padding = 40;
      const textHeight = 50;
      const nameHeight = firstName || lastName ? 50 : 0;
      const subHeight = 35;

      const totalHeight = nameHeight + subHeight + padding + size + padding + textHeight + padding;
      const canvas = document.createElement('canvas');
      canvas.width = size + padding * 2;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let yOffset = 0;
      if (firstName || lastName) {
        ctx.fillStyle = '#003366';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${firstName || ''} ${lastName || ''}`.trim(), canvas.width / 2, nameHeight / 2);
        yOffset = nameHeight;
      }

      ctx.fillStyle = '#555';
      ctx.font = '20px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Registrazione a LNI Messina', canvas.width / 2, yOffset + subHeight / 2);
      yOffset += subHeight;

      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, `${window.location.origin}/validate/${token}`, {
        width: size,
        margin: 2,
        color: { dark: '#003366', light: '#ffffff' },
      });
      ctx.drawImage(qrCanvas, padding, yOffset + padding, size, size);

      ctx.fillStyle = '#003366';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token, canvas.width / 2, yOffset + padding + size + padding + textHeight / 2);

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
      <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden' }}>
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
