import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Check, Move } from 'lucide-react';

interface Props {
  file: File;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

const CONT = 280; // display container px (also the crop circle diameter)
const OUT  = 200; // canvas output px — 200×200 is plenty for an avatar

export function AvatarCropModal({ file, onConfirm, onCancel }: Props) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const imgRef  = useRef<HTMLImageElement>(null);
  const minZoom = useRef(1);
  const panRef  = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const drag    = useRef<{ active: boolean; lx: number; ly: number }>({ active: false, lx: 0, ly: 0 });

  // Keep refs synced with state (so event handlers always see latest values)
  useEffect(() => { panRef.current  = pan;  }, [pan]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Load file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onCancel]);

  const clamp = (px: number, py: number, z: number, natW: number, natH: number) => {
    const iw = natW * z;
    const ih = natH * z;
    const mx = Math.max(0, (iw - CONT) / 2);
    const my = Math.max(0, (ih - CONT) / 2);
    return { x: Math.max(-mx, Math.min(mx, px)), y: Math.max(-my, Math.min(my, py)) };
  };

  const applyZoom = (raw: number) => {
    const img = imgRef.current;
    if (!img) return;
    const z = Math.max(minZoom.current, Math.min(8, raw));
    zoomRef.current = z;
    setZoom(z);
    const c = clamp(panRef.current.x, panRef.current.y, z, img.naturalWidth, img.naturalHeight);
    panRef.current = c;
    setPan(c);
  };

  const handleLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    // Zoom to fill the circle so there are no black bars
    const fill = Math.max(CONT / img.naturalWidth, CONT / img.naturalHeight);
    minZoom.current = fill;
    const z = fill;
    zoomRef.current = z;
    setZoom(z);
    panRef.current = { x: 0, y: 0 };
    setPan({ x: 0, y: 0 });
  };

  // Pointer drag (mouse + touch)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, lx: e.clientX, ly: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || !imgRef.current) return;
    const dx = e.clientX - drag.current.lx;
    const dy = e.clientY - drag.current.ly;
    drag.current.lx = e.clientX;
    drag.current.ly = e.clientY;
    const img = imgRef.current;
    const next = clamp(panRef.current.x + dx, panRef.current.y + dy, zoomRef.current, img.naturalWidth, img.naturalHeight);
    panRef.current = next;
    setPan(next);
  };
  const onPointerUp = () => { drag.current.active = false; };

  // Wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    applyZoom(zoomRef.current - e.deltaY * 0.0015);
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = OUT;
    const ctx = canvas.getContext('2d')!;

    // Where the image is drawn in display coords:
    //   center of image = (CONT/2 + pan.x, CONT/2 + pan.y)
    //   top-left = center - (natW*zoom/2, natH*zoom/2)
    const scale = OUT / CONT;
    const iLeft = (CONT / 2 + panRef.current.x - img.naturalWidth  * zoomRef.current / 2) * scale;
    const iTop  = (CONT / 2 + panRef.current.y - img.naturalHeight * zoomRef.current / 2) * scale;
    const iW    = img.naturalWidth  * zoomRef.current * scale;
    const iH    = img.naturalHeight * zoomRef.current * scale;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.drawImage(img, iLeft, iTop, iW, iH);

    canvas.toBlob((blob) => { if (blob) onConfirm(blob); }, 'image/jpeg', 0.82);
  };

  const pct = Math.round(zoom * 100);
  const minPct = Math.round(minZoom.current * 100);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', zIndex: 500 }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="flex flex-col"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 18,
          overflow: 'hidden',
          width: CONT + 80,
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <div className="flex items-center gap-2">
            <Move size={14} className="text-ink-3" />
            <span className="font-semibold text-sm text-ink-1">Cắt ảnh đại diện</span>
          </div>
          <button onClick={onCancel} className="btn btn-ghost btn-icon">
            <X size={14} />
          </button>
        </div>

        {/* Crop circle */}
        <div
          className="flex items-center justify-center"
          style={{ background: 'var(--bg-surface-2)', padding: '28px 40px' }}
        >
          {/* Outer shadow ring */}
          <div style={{ borderRadius: '50%', padding: 3, background: 'var(--sidebar-accent)', boxShadow: '0 0 0 4px rgba(0,0,0,0.15)' }}>
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              style={{
                width: CONT,
                height: CONT,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'grab',
                background: '#111',
                touchAction: 'none',
                userSelect: 'none',
              }}
            >
              {imgSrc && (
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt=""
                  onLoad={handleLoad}
                  draggable={false}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                    transformOrigin: 'center center',
                    maxWidth: 'none',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-[11px] text-ink-3 mt-1 mb-0">
          Kéo để di chuyển · Cuộn chuột hoặc dùng thanh trượt để thu phóng
        </p>

        {/* Zoom slider */}
        <div className="flex items-center gap-2 px-6 py-3">
          <button onClick={() => applyZoom(zoom - 0.05)} className="btn btn-ghost btn-icon shrink-0">
            <ZoomOut size={15} />
          </button>
          <input
            type="range"
            min={minPct}
            max={800}
            value={pct}
            onChange={(e) => applyZoom(parseInt(e.target.value) / 100)}
            className="flex-1"
            style={{ accentColor: 'var(--sidebar-accent)' }}
          />
          <button onClick={() => applyZoom(zoom + 0.05)} className="btn btn-ghost btn-icon shrink-0">
            <ZoomIn size={15} />
          </button>
          <span className="text-xs text-ink-3 w-10 text-right shrink-0">{pct}%</span>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-4 py-3 shrink-0"
          style={{ borderTop: '1px solid var(--rule)' }}
        >
          <button onClick={onCancel} className="btn btn-ghost btn-sm">Hủy</button>
          <button
            onClick={handleConfirm}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Check size={13} />
            Lưu ảnh đại diện
          </button>
        </div>
      </div>
    </div>
  );
}
