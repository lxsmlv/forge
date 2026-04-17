'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QrCode, X, Download, Share2 } from 'lucide-react';
import { useT } from '@/lib/useT';

export function ProfileQR({ username }: { username: string }) {
  const [show, setShow] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const t = useT();

  useEffect(() => {
    if (!show) return;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(`https://forgeclub.app/profile/${username}`, {
        width: 300,
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
        className="forge-press h-9 w-9 rounded-full bg-[var(--forge-surface)] border border-[var(--forge-border)] flex items-center justify-center hover:border-[var(--forge-border-hover)] transition-all"
      >
        <QrCode className="w-4 h-4 text-[var(--forge-text-secondary)]" strokeWidth={2} />
      </button>
    );
  }

  const handleShare = async () => {
    const url = `https://forgeclub.app/profile/${username}`;
    if (navigator.share) {
      await navigator.share({ title: `@${username} — FORGE`, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      onClick={() => setShow(false)}
    >
      <div
        className="w-full max-w-xs flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={() => setShow(false)}
          className="forge-press self-end text-[var(--forge-text-tertiary)] hover:text-[var(--forge-text-primary)] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* FORGE wordmark */}
        <h2
          className="text-2xl tracking-[0.18em] font-medium forge-text-glow"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          FORGE
        </h2>

        {/* QR with gradient border */}
        {qrDataUrl && (
          <div className="p-[3px] rounded-[var(--forge-radius-lg)]" style={{ background: 'var(--forge-gradient-action)' }}>
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="rounded-[calc(var(--forge-radius-lg)-3px)] w-full h-auto"
            />
          </div>
        )}

        {/* Username prominent */}
        <div className="text-center">
          <p className="text-lg font-bold text-[var(--forge-text-primary)]">@{username}</p>
          <p className="text-[11px] text-[var(--forge-text-tertiary)] mt-1">{t('qr.scan_hint')}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`forge-${username}-qr.png`}
              className="forge-btn-secondary flex-1 py-2.5 text-[12px] flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> {t('qr.save')}
            </a>
          )}
          <button
            onClick={handleShare}
            className="forge-btn-primary flex-1 py-2.5 text-[12px] flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" /> {t('qr.share')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
