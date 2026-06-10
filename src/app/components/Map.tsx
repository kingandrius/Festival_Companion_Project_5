import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { Music, UtensilsCrossed, Heart, Package, X, Clock, Droplets } from "lucide-react";

interface Location {
  id: number;
  name: string;
  type: "stage" | "food" | "medical" | "locker" | "toilet";
  x: number;
  y: number;
  color: string;
  details: string;
  waitTime?: string;
}

const locations: Location[] = [
  {
    id: 1,
    name: "Main Stage",
    type: "stage",
    x: 50,
    y: 20,
    color: "neon-blue",
    details: "Our biggest stage featuring headliner performances all weekend long.",
  },
  {
    id: 2,
    name: "Digital Arena",
    type: "stage",
    x: 76,
    y: 47,
    color: "neon-green",
    details: "Electronic music haven with cutting-edge sound and laser visuals.",
  },
  {
    id: 3,
    name: "Neon Tent",
    type: "stage",
    x: 22,
    y: 44,
    color: "neon-pink",
    details: "Intimate tent stage for emerging artists and late-night DJ sets.",
  },
  {
    id: 4,
    name: "Rock Arena",
    type: "stage",
    x: 50,
    y: 65,
    color: "neon-yellow",
    details: "Open-air arena built for high-energy rock and metal performances.",
  },
  {
    id: 5,
    name: "Food Court Zone A",
    type: "food",
    x: 58,
    y: 52,
    color: "neon-orange",
    details: "International food trucks, vegan options, and gourmet street food.",
    waitTime: "5–10 mins",
  },
  {
    id: 6,
    name: "First Aid Station",
    type: "medical",
    x: 64,
    y: 84,
    color: "neon-red",
    details: "Medical assistance and emergency services available 24/7.",
  },
  {
    id: 7,
    name: "Locker Zone",
    type: "locker",
    x: 34,
    y: 84,
    color: "neon-purple",
    details: "Secure storage for your belongings. Phone charging available.",
  },
  {
    id: 8,
    name: "Food Court Zone B",
    type: "food",
    x: 27,
    y: 22,
    color: "neon-orange",
    details: "Quick bites right next to Main Stage. Grab food between sets without missing a beat.",
    waitTime: "3–7 mins",
  },
  {
    id: 9,
    name: "Toilets 1",
    type: "toilet",
    x: 31,
    y: 54,
    color: "muted-foreground",
    details: "Facilities on the west side of the grounds, near the Neon Tent.",
  },
  {
    id: 10,
    name: "Toilets 2",
    type: "toilet",
    x: 74,
    y: 68,
    color: "muted-foreground",
    details: "Facilities on the east side of the grounds, near the Digital Arena.",
  },
];

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function Map() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  // Explicit pixel size for the square map — derived from the container dimensions
  const [squareSize, setSquareSize] = useState(390);

  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const hasMoved = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panAtStart = useRef({ x: 0, y: 0 });
  const pinchDistRef = useRef<number | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const mapSizeRef = useRef(390);

  // Measure the container and derive the largest square that fits inside it
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const size = Math.min(width, height);
      setSquareSize(size);
      mapSizeRef.current = size;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clampPan = useCallback((p: { x: number; y: number }, z: number) => {
    const half = mapSizeRef.current / 2;
    const maxPan = Math.max(0, (z - 1) * half);
    return { x: clamp(p.x, -maxPan, maxPan), y: clamp(p.y, -maxPan, maxPan) };
  }, []);

  const applyZoom = useCallback((newZ: number) => {
    const clamped = clamp(newZ, MIN_ZOOM, MAX_ZOOM);
    setZoom(clamped);
    if (clamped <= 1) setPan({ x: 0, y: 0 });
  }, []);

  // Prevent passive touchmove so we can preventDefault on pinch
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => { if (e.touches.length >= 2) e.preventDefault(); };
    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, []);

  // Wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    applyZoom(zoomRef.current * (1 - e.deltaY * 0.0012));
  };

  // Pointer drag (on the inner zoomable div)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panAtStart.current = { ...pan };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved.current = true;
    setPan(clampPan({ x: panAtStart.current.x + dx, y: panAtStart.current.y + dy }, zoomRef.current));
  };

  const onPointerUp = () => { dragging.current = false; };

  // Touch pinch zoom
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDistRef.current = Math.hypot(dx, dy);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      applyZoom(zoomRef.current * (dist / pinchDistRef.current));
      pinchDistRef.current = dist;
    }
  };

  const onTouchEnd = () => { pinchDistRef.current = null; };

  const getIcon = (type: string) => {
    switch (type) {
      case "stage": return Music;
      case "food": return UtensilsCrossed;
      case "medical": return Heart;
      case "locker": return Package;
      case "toilet": return Droplets;
      default: return Music;
    }
  };

  return (
    <div className="min-h-screen bg-deep-bg flex flex-col">
      <header
        className="px-4 py-4 sticky top-0 z-10 border-b"
        style={{
          background: "linear-gradient(to bottom, rgba(255,20,147,0.13), rgba(26,26,36,0) 100%), var(--slate-gray)",
          borderBottomColor: "rgba(255,20,147,0.3)",
          boxShadow: "0 4px 24px -4px rgba(255,20,147,0.15)",
        }}
      >
        <div className="flex items-center gap-3 max-w-screen-sm mx-auto mb-3">
          <span className="text-2xl">🗺️</span>
          <h1 className="text-xl text-neon-pink font-bold tracking-wider" style={{ textShadow: "0 0 12px rgba(255,20,147,0.7), 0 0 30px rgba(255,20,147,0.3)" }}>FESTIVAL MAP</h1>
        </div>
        {/* Legend */}
        <div className="max-w-screen-sm mx-auto flex justify-center">
        <div className="flex items-center gap-4 bg-white/5 border border-white/15 rounded-full px-4 py-1.5">
          {([
            { Icon: Music,           iconColor: "#a0a0b0", label: "Stages" },
            { Icon: UtensilsCrossed, iconColor: "#ff8c00", label: "Food" },
            { Icon: Heart,           iconColor: "#ff2244", label: "Medical" },
            { Icon: Package,         iconColor: "#9d4edd", label: "Facilities" },
            { Icon: Droplets,        iconColor: "#6a6a8a", label: "Toilets" },
          ] as const).map(({ Icon, iconColor, label }) => (
            <div key={label} className="flex items-center gap-1">
              <Icon className="w-3 h-3 flex-shrink-0" style={{ color: iconColor }} strokeWidth={2.5} />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
        </div>
      </header>

      {/* Map viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        style={{ touchAction: "none" }}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Centering wrapper — keeps the square map centred in the viewport on any screen size */}
        <div className="absolute inset-0 flex items-center justify-center">
        {/* Square zoomable map — explicit pixel dimensions so pin % positions always match SVG units */}
        <div
          ref={innerRef}
          className="relative flex-shrink-0"
          style={{
            width: squareSize,
            height: squareSize,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            cursor: dragging.current ? "grabbing" : zoom > 1 ? "grab" : "default",
            willChange: "transform",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* SVG illustrated map */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: "none" }}
          >
            {/* ── FESTIVAL GROUNDS ── */}
            <path d="M 10 8 Q 50 4 90 8 Q 96 50 90 86 Q 50 94 10 86 Q 4 50 10 8 Z" fill="#0b1a0c" />
            {/* Perimeter fence */}
            <path d="M 10 8 Q 50 4 90 8 Q 96 50 90 86 Q 50 94 10 86 Q 4 50 10 8 Z" fill="none" stroke="#2a4a2a" strokeWidth="0.7" strokeDasharray="2,1.2" />

            {/* ── PATHS ── */}
            {/* Vertical spine */}
            <rect x="47.5" y="29" width="5" height="48" fill="#4a4030" rx="1" />
            {/* Horizontal cross */}
            <rect x="24" y="40.5" width="52" height="6" fill="#4a4030" rx="1" />
            {/* Short spur right to food court */}
            <rect x="52" y="50" width="8" height="4" fill="#3a3020" rx="1" />
            {/* Entrance area spurs to locker & first aid */}
            <rect x="29" y="77" width="19" height="4" fill="#3a3020" rx="1" />
            <rect x="52" y="77" width="14" height="4" fill="#3a3020" rx="1" />

            {/* ── MAIN STAGE (x:50 y:20) ── */}
            <rect x="32" y="6" width="36" height="26" rx="3" fill="#06111e" stroke="#00d9ff" strokeWidth="0.55" />
            <rect x="37" y="8.5" width="26" height="9" rx="1.5" fill="#081928" stroke="#00d9ff" strokeWidth="0.35" />
            {/* Stage front LED bar */}
            <rect x="37" y="17" width="26" height="1.2" rx="0.5" fill="#00d9ff" opacity="0.7" />
            {/* Audience arc */}
            <path d="M 36 20 Q 50 31 64 20 L 64 26 Q 50 36 36 26 Z" fill="#061610" stroke="#00d9ff" strokeWidth="0.25" strokeDasharray="1.5,0.8" opacity="0.6" />
            {/* Glow blobs on stage corners */}
            <circle cx="37" cy="17" r="0.8" fill="#00d9ff" opacity="0.8" />
            <circle cx="63" cy="17" r="0.8" fill="#00d9ff" opacity="0.8" />
            <circle cx="50" cy="17" r="0.6" fill="#00d9ff" opacity="0.6" />

            {/* ── DIGITAL ARENA (x:76 y:47) ── */}
            <polygon points="76,30 88,37 88,57 76,64 64,57 64,37" fill="#061a0e" stroke="#10d98e" strokeWidth="0.55" />
            <circle cx="76" cy="47" r="9" fill="#040e08" stroke="#10d98e" strokeWidth="0.35" />
            <circle cx="76" cy="47" r="6" fill="none" stroke="#10d98e" strokeWidth="0.2" strokeDasharray="1,0.6" opacity="0.5" />

            {/* ── NEON TENT (x:22 y:44) ── */}
            <polygon points="22,28 35,36 35,58 9,58 9,36" fill="#1a0611" stroke="#ff1493" strokeWidth="0.55" />
            <polygon points="22,31 32,38 32,55 12,55 12,38" fill="#0e0309" stroke="#ff1493" strokeWidth="0.3" />
            {/* Guy wires */}
            <line x1="22" y1="28" x2="9" y2="21" stroke="#ff1493" strokeWidth="0.2" opacity="0.45" />
            <line x1="22" y1="28" x2="35" y2="21" stroke="#ff1493" strokeWidth="0.2" opacity="0.45" />
            {/* Tent pole */}
            <line x1="22" y1="28" x2="22" y2="31" stroke="#ff1493" strokeWidth="0.4" />

            {/* ── ROCK ARENA (x:50 y:65) ── */}
            <rect x="35" y="57" width="30" height="16" rx="2" fill="#1a1206" stroke="#ffd700" strokeWidth="0.55" />
            <rect x="40" y="59" width="20" height="8" rx="1" fill="#0e0b03" stroke="#ffd700" strokeWidth="0.3" />
            <rect x="40" y="66.5" width="20" height="1" rx="0.5" fill="#ffd700" opacity="0.55" />
            <circle cx="40" cy="66.5" r="0.7" fill="#ffd700" opacity="0.8" />
            <circle cx="60" cy="66.5" r="0.7" fill="#ffd700" opacity="0.8" />
            <circle cx="50" cy="66.5" r="0.55" fill="#ffd700" opacity="0.6" />

            {/* ── FOOD COURT (x:58 y:52) — central festival area ── */}
            <rect x="53" y="48" width="11" height="8" rx="1.5" fill="#1a1206" stroke="#ff8c00" strokeWidth="0.3" opacity="0.8" />

            {/* ── FIRST AID (x:64 y:84) — near entrance, right ── */}
            <rect x="58" y="79" width="12" height="7" rx="1" fill="#1a0808" stroke="#ff2244" strokeWidth="0.3" opacity="0.8" />

            {/* ── LOCKER ZONE (x:34 y:84) — near entrance, left ── */}
            <rect x="28" y="79" width="12" height="7" rx="1" fill="#0a0818" stroke="#9d4edd" strokeWidth="0.3" opacity="0.8" />

            {/* ── FOOD COURT ZONE B (x:27 y:22) — near Main Stage, left ── */}
            <rect x="21" y="17" width="10" height="8" rx="1.5" fill="#1a1206" stroke="#ff8c00" strokeWidth="0.3" opacity="0.8" />
            {/* Short connector path from zone B to stage area */}
            <rect x="31" y="19" width="2" height="4" fill="#3a3020" rx="0.5" />

            {/* ── TOILETS 1 (x:31 y:54) — west side ── */}
            <rect x="25" y="50" width="9" height="6" rx="1" fill="#12121e" stroke="#6a6a8a" strokeWidth="0.3" opacity="0.75" />

            {/* ── TOILETS 2 (x:74 y:68) — east side ── */}
            <rect x="69" y="64" width="9" height="6" rx="1" fill="#12121e" stroke="#6a6a8a" strokeWidth="0.3" opacity="0.75" />

            {/* ── TREES ── */}
            <circle cx="8"  cy="29" r="3.5" fill="#0d2a0e" /><circle cx="12" cy="26" r="2.8" fill="#122a13" /><circle cx="7"  cy="23" r="2.2" fill="#0d2a0e" />
            <circle cx="92" cy="22" r="3.5" fill="#0d2a0e" /><circle cx="89" cy="18" r="3"   fill="#122a13" /><circle cx="93" cy="15" r="2.2" fill="#0d2a0e" />
            <circle cx="7"  cy="56" r="2.5" fill="#0d2a0e" /><circle cx="10" cy="53" r="2"   fill="#122a13" />
            <circle cx="93" cy="56" r="2.5" fill="#0d2a0e" /><circle cx="90" cy="53" r="2"   fill="#122a13" />
            <circle cx="9"  cy="80" r="3"   fill="#0d2a0e" /><circle cx="13" cy="78" r="2.5" fill="#122a13" /><circle cx="8" cy="75" r="2" fill="#0d2a0e" />
            <circle cx="91" cy="79" r="3"   fill="#0d2a0e" /><circle cx="88" cy="82" r="2.5" fill="#122a13" /><circle cx="92" cy="75" r="2" fill="#0d2a0e" />
            <circle cx="36" cy="53" r="2"   fill="#0d2a0e" opacity="0.85" />
            <circle cx="64" cy="53" r="2"   fill="#0d2a0e" opacity="0.85" />
            <circle cx="36" cy="74" r="1.8" fill="#0d2a0e" opacity="0.75" />
            <circle cx="64" cy="74" r="1.8" fill="#0d2a0e" opacity="0.75" />

            {/* ── PARKING & ENTRANCE ── */}
            <rect x="6" y="87" width="34" height="6" rx="1" fill="#111111" opacity="0.55" />
            <rect x="60" y="87" width="34" height="6" rx="1" fill="#111111" opacity="0.55" />
            <text x="23" y="91" fontSize="1.9" fill="#3a3a3a" textAnchor="middle" fontFamily="monospace">PARKING A</text>
            <text x="77" y="91" fontSize="1.9" fill="#3a3a3a" textAnchor="middle" fontFamily="monospace">PARKING B</text>
            {/* Gate posts */}
            <rect x="43" y="84" width="14" height="4" rx="1" fill="#2a2818" stroke="#524838" strokeWidth="0.35" />
            <line x1="43" y1="84" x2="43" y2="93" stroke="#524838" strokeWidth="0.5" />
            <line x1="57" y1="84" x2="57" y2="93" stroke="#524838" strokeWidth="0.5" />
            <text x="50" y="87.2" fontSize="1.9" fill="#a09060" textAnchor="middle" fontFamily="monospace">ENTRANCE</text>
          </svg>

          {/* Location pins — icon circle + name label, stacked so neither covers the other */}
          {locations.map((loc) => {
            const Icon = getIcon(loc.type);
            const isToilet = loc.type === "toilet";
            return (
              <button
                key={loc.id}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setSelectedLocation(loc); }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group"
                style={{ left: `${loc.x}%`, top: `${loc.y}%`, zIndex: 20 }}
              >
                <div
                  className={`rounded-full flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-90 ${isToilet ? "w-6 h-6" : "w-8 h-8"}`}
                  style={{
                    backgroundColor: isToilet ? "rgba(105,105,140,0.6)" : `var(--${loc.color})`,
                    boxShadow: isToilet ? "none" : `0 0 14px var(--${loc.color})`,
                    border: isToilet ? "1px solid #6a6a8a" : "none",
                  }}
                >
                  <Icon className={isToilet ? "w-3 h-3 text-slate-300" : "w-4 h-4 text-deep-bg"} strokeWidth={2.5} />
                </div>
                <span
                  className="text-[7px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap leading-tight"
                  style={{
                    color: isToilet ? "#9090a8" : `var(--${loc.color})`,
                    backgroundColor: "rgba(10,10,15,0.82)",
                    border: isToilet ? "1px solid #6a6a8a" : `1px solid var(--${loc.color})`,
                  }}
                >
                  {loc.name}
                </span>
              </button>
            );
          })}
        </div>
        </div>{/* end centering wrapper */}


        {/* Zoom level badge */}
        {zoom !== 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-gray/80 border border-slate-gray-light rounded-full px-3 py-1">
            <span className="text-xs text-muted-foreground">{zoom.toFixed(1)}×</span>
          </div>
        )}
      </div>

      {/* Location bottom sheet */}
      {selectedLocation && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedLocation(null)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-gray border-t-4 rounded-t-3xl p-6 max-w-screen-sm mx-auto animate-slide-up"
            style={{ borderTopColor: `var(--${selectedLocation.color})` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getIcon(selectedLocation.type);
                  return (
                    <div className="p-3 rounded-full" style={{ backgroundColor: `var(--${selectedLocation.color})` }}>
                      <Icon className="w-6 h-6 text-deep-bg" strokeWidth={2.5} />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="font-bold text-lg text-foreground">{selectedLocation.name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{selectedLocation.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-2 hover:bg-slate-gray-light rounded-lg transition-colors active:scale-90"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <p className="text-foreground mb-4 leading-relaxed">{selectedLocation.details}</p>

            {selectedLocation.waitTime && (
              <div className="flex items-center gap-2 bg-slate-gray-light rounded-lg p-3">
                <Clock className="w-5 h-5 text-neon-green" />
                <span className="text-sm text-foreground">
                  Wait time: <span className="font-bold text-neon-green">{selectedLocation.waitTime}</span>
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
