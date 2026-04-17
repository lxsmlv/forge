'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QrCode, X, Download } from 'lucide-react';

export function ProfileQR({ username }: { username: string }) {
  const [show, setShow] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!show) return;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(`https://forgeclub.app/profile/${username}`, {
        width: 256,
        margin: 2,
        color: { dark: '#a78bfa', light: '#0f0f12' },
      }).then(setQrDataUrl);
    });
  }, [show, username]);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [show]);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="forge-press text-[var(--forge-text-secondary)] hover:text-[var(--forge-text-primary)] transition-colors"
      >
        <QrCode className="w-5 h-5" />
      </button>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={() => setShow(false)}
    >
      <div
        className="forge-glass rounded-[var(--forge-radius-lg)] p-6 flex flex-col items-center gap-4 max-w-sm w-full my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-semibold text-[var(--forge-text-primary)]">@{username}</span>
          <button
            onClick={() => setShow(false)}
            className="forge-press text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {qrDataUrl && (
          <>
            <img src={qrDataUrl} alt="QR Code" className="rounded-[var(--forge-radius-md)] max-w-full h-auto" />
            <a
              href={qrDataUrl}
              download={`forge-${username}-qr.png`}
              className="forge-press flex items-center gap-2 text-xs text-[var(--forge-purple-bright)] hover:text-[var(--forge-purple)] transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Save QR
            </a>
          </>
        )}
        <p className="text-xs text-[var(--forge-text-tertiary)]">Scan to open profile</p>
      </div>
    </div>,
    document.body
  );
}
