'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, RotateCcw, Crop, Sparkles } from 'lucide-react';

const FILTERS = [
  { id: 'none', label: 'Original', css: '' },
  { id: 'vivid', label: 'Vivid', css: 'saturate(1.4) contrast(1.1)' },
  { id: 'warm', label: 'Warm', css: 'sepia(0.2) saturate(1.3) brightness(1.05)' },
  { id: 'cool', label: 'Cool', css: 'saturate(0.9) hue-rotate(15deg) brightness(1.05)' },
  { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.1)' },
  { id: 'noir', label: 'Noir', css: 'grayscale(1) contrast(1.4) brightness(0.9)' },
  { id: 'fade', label: 'Fade', css: 'saturate(0.7) contrast(0.9) brightness(1.1)' },
  { id: 'chrome', label: 'Chrome', css: 'saturate(1.5) contrast(1.2) brightness(1.05)' },
];

const CROP_RATIOS = [
  { id: 'free', label: 'Free', ratio: 0 },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '4:3', label: '4:3', ratio: 4 / 3 },
  { id: '3:4', label: '3:4', ratio: 3 / 4 },
  { id: '16:9', label: '16:9', ratio: 16 / 9 },
];

interface Props {
  file: File;
  onSave: (editedFile: File) => void;
  onCancel: () => void;
}

export function PhotoEditor({ file, onSave, onCancel }: Props) {
  const [imgSrc, setImgSrc] = useState('');
  const [activeTab, setActiveTab] = useState<'filter' | 'crop'>('filter');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isRu = typeof window !== 'undefined' && (localStorage.getItem('forge-locale') || 'en') === 'ru';

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const getCssFilter = useCallback(() => {
    const base = FILTERS.find((f) => f.id === selectedFilter)?.css || '';
    const extras = [];
    if (brightness !== 100) extras.push(`brightness(${brightness / 100})`);
    if (contrast !== 100) extras.push(`contrast(${contrast / 100})`);
    return [base, ...extras].filter(Boolean).join(' ') || 'none';
  }, [selectedFilter, brightness, contrast]);

  const handleSave = async () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle rotation
    const isRotated = rotation % 180 !== 0;
    canvas.width = isRotated ? img.naturalHeight : img.naturalWidth;
    canvas.height = isRotated ? img.naturalWidth : img.naturalHeight;

    ctx.filter = getCssFilter();
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const editedFile = new File([blob], file.name, { type: 'image/jpeg' });
      onSave(editedFile);
    }, 'image/jpeg', 0.9);
  };

  const handleReset = () => {
    setSelectedFilter('none');
    setBrightness(100);
    setContrast(100);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--forge-black)] flex flex-col">
      {/* Header */}
      <header className="forge-header shrink-0">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={onCancel} className="forge-press text-[var(--forge-text-secondary)]">
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-[var(--forge-text-secondary)]">{isRu ? 'Редактор' : 'Editor'}</span>
          <button onClick={handleSave} className="forge-btn-primary text-[12px] py-2 px-4 uppercase" style={{ letterSpacing: '0.08em' }}>
            <Check className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-4 py-4">
        {imgSrc && (
          <img
            ref={imgRef}
            src={imgSrc}
            alt=""
            crossOrigin="anonymous"
            className="max-w-full max-h-full object-contain rounded-[var(--forge-radius-md)]"
            style={{
              filter: getCssFilter(),
              transform: `rotate(${rotation}deg)`,
              transition: 'filter 0.2s, transform 0.3s',
            }}
          />
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="shrink-0 bg-[var(--forge-surface)] border-t border-[var(--forge-border)]">
        {/* Tabs */}
        <div className="flex gap-1 p-1 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('filter')}
            className={`forge-press flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--forge-radius-sm)] text-[12px] font-medium transition-all ${
              activeTab === 'filter' ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)]' : 'text-[var(--forge-text-tertiary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> {isRu ? 'Фильтры' : 'Filters'}
          </button>
          <button
            onClick={() => setActiveTab('crop')}
            className={`forge-press flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--forge-radius-sm)] text-[12px] font-medium transition-all ${
              activeTab === 'crop' ? 'bg-[var(--forge-purple-glow)] text-[var(--forge-purple-bright)]' : 'text-[var(--forge-text-tertiary)]'
            }`}
          >
            <Crop className="w-3.5 h-3.5" /> {isRu ? 'Настройки' : 'Adjust'}
          </button>
          <button
            onClick={handleReset}
            className="forge-press flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--forge-radius-sm)] text-[12px] text-[var(--forge-text-tertiary)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-w-lg mx-auto px-4 pb-6 pt-2">
          {activeTab === 'filter' ? (
            /* Filters */
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`forge-press shrink-0 flex flex-col items-center gap-1.5 ${selectedFilter === f.id ? '' : 'opacity-60'}`}
                >
                  <div
                    className={`w-16 h-16 rounded-[var(--forge-radius-md)] overflow-hidden border-2 transition-all ${
                      selectedFilter === f.id ? 'border-[var(--forge-purple-bright)] shadow-[0_0_8px_rgba(139,92,246,0.4)]' : 'border-transparent'
                    }`}
                  >
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ filter: f.css || 'none' }}
                      />
                    )}
                  </div>
                  <span className="text-[9px] text-[var(--forge-text-tertiary)]">{f.label}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Adjust controls */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">{isRu ? 'Яркость' : 'Brightness'}</label>
                  <span className="text-[10px] text-[var(--forge-text-muted)] tabular-nums">{brightness}%</span>
                </div>
                <input
                  type="range" min="50" max="150" value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-[var(--forge-purple-bright)] h-1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] text-[var(--forge-text-tertiary)] uppercase tracking-wider">{isRu ? 'Контраст' : 'Contrast'}</label>
                  <span className="text-[10px] text-[var(--forge-text-muted)] tabular-nums">{contrast}%</span>
                </div>
                <input
                  type="range" min="50" max="150" value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-[var(--forge-purple-bright)] h-1"
                />
              </div>
              <div className="flex gap-2">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setRotation(deg)}
                    className={`forge-badge forge-badge-interactive flex-1 justify-center ${rotation === deg ? 'forge-badge-purple' : ''}`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
