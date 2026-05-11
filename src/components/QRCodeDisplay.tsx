'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  token: string;
  size?: number;
}

export default function QRCodeDisplay({ token, size = 250 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Formato richiesto dalla documentazione: https://app-domain/validate/TOKEN
      // Nota: In produzione l'host verrà rilevato automaticamente o impostato via ENV
      const validationUrl = `${window.location.origin}/validate/${token}`;
      
      QRCode.toCanvas(
        canvasRef.current,
        validationUrl,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#003366', // LNI Blue
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Errore generazione QR:', error);
        }
      );
    }
  }, [token, size]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-2xl shadow-2xl">
      <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" />
      <p className="text-slate-900 font-mono text-sm tracking-widest">{token}</p>
    </div>
  );
}
