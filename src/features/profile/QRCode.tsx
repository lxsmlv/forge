'use client';

import { useState, useEffect, useRef } from 'react';
import { QrCode, X, Download } from 'lucide-react';

export function ProfileQR({ username }: { username: string }) {
  const [show, setShow] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!show) return;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(`https://forgeclub.app/profile/${username}`, {
        width: 256,
        margin: 2,
        color: { dark: '#7c3aed', light: '#000000' },
      }).then(setQrDataUrl);
    });
  }, [show, username]);

  if (!show) {
    return (
      <button onClick={() => setShow(true)} className="text-zinc-600 hover:text-purple-400 transition-colors">
        <QrCode className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShow(false)}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-medium text-white">@{username}</span>
          <button onClick={() => setShow(false)} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {qrDataUrl && (
          <>
            <img src={qrDataUrl} alt="QR Code" className="rounded-lg" />
            <a
              href={qrDataUrl}
              download={`forge-${username}-qr.png`}
              className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Download className="w-3 h-3" /> Save QR
            </a>
          </>
        )}
        <p className="text-xs text-zinc-600">Scan to open profile</p>
      </div>
    </div>
  );
}
