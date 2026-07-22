export function ParaguayFlag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-label="Bandera de Paraguay">
      {/* Franja Roja */}
      <rect x="0" y="0" width="60" height="13.33" fill="#CE1126" />
      {/* Franja Blanca */}
      <rect x="0" y="13.33" width="60" height="13.34" fill="#FFFFFF" />
      {/* Franja Azul */}
      <rect x="0" y="26.67" width="60" height="13.33" fill="#0038A8" />
      {/* Círculo del escudo (simplificado) */}
      <circle cx="30" cy="20" r="6" fill="#FFFFFF" stroke="#0038A8" strokeWidth="0.5" />
      {/* Estrella central */}
      <polygon
        points="30,15 31.2,18.5 35,18.5 32,21 33.2,24.5 30,22 26.8,24.5 28,21 25,18.5 28.8,18.5"
        fill="#FFD700"
      />
      {/* Corona de palma y olivo (simplificada) */}
      <path d="M24,20 Q22,16 25,14" fill="none" stroke="#006B3F" strokeWidth="0.8" />
      <path d="M36,20 Q38,16 35,14" fill="none" stroke="#006B3F" strokeWidth="0.8" />
    </svg>
  )
}

export function ParaguayFlagBanner() {
  return (
    <div className="flex w-full h-2 rounded-full overflow-hidden shadow-sm">
      <div className="flex-1 bg-[#CE1126]" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#0038A8]" />
    </div>
  )
}
