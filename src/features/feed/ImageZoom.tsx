'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export function ImageZoom({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false);

  if (!zoomed) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center" onClick={() => setZoomed(false)}>
      <button className="absolute top-4 right-4 text-white z-10" onClick={() => setZoomed(false)}>
        <X className="w-6 h-6" />
      </button>
      <img src={src} alt={alt} className="max-w-full max-h-full object-contain" />
    </div>
  );
}

export function useImageZoom() {
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const openZoom = (src: string) => setZoomSrc(src);
  const closeZoom = () => setZoomSrc(null);

  const ZoomOverlay = () => {
    if (!zoomSrc) return null;
    return (
      <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center" onClick={closeZoom}>
        <button className="absolute top-4 right-4 text-white z-10" onClick={closeZoom}>
          <X className="w-6 h-6" />
        </button>
        <img src={zoomSrc} alt="" className="max-w-full max-h-full object-contain" />
      </div>
    );
  };

  return { openZoom, ZoomOverlay };
}
