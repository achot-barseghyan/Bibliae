import type { CSSProperties } from 'react';

/** Couleurs de vitrail prises par les pétales quand le menu s'ouvre, en alternance. */
const VITRAIL = ['#2F4A7A', '#8A2E33', '#B5892E'];

const PETALS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * Math.PI) / 4;
  return {
    cx: 30 + 17.5 * Math.sin(angle),
    cy: 30 - 17.5 * Math.cos(angle),
    vitrail: VITRAIL[i % VITRAIL.length]
  };
});

/**
 * Rosace 60×60 : disque bordeaux, anneau or, 8 pétales et croix au cœur.
 * Les pétales passent en couleurs de vitrail quand un ancêtre porte la
 * classe `.is-open` (voir RosaceMenu.css).
 */
const Rosace: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" className={className} aria-hidden="true">
    <circle cx="30" cy="30" r="29" fill="#6B1E23" />
    <circle cx="30" cy="30" r="27" fill="none" stroke="#B5892E" strokeWidth="0.8" />
    {PETALS.map((p, i) => (
      <circle
        key={i}
        className="rosace-petal"
        cx={p.cx}
        cy={p.cy}
        r="6"
        stroke="#D9B66A"
        strokeWidth="0.6"
        style={{ '--i': i, '--vitrail': p.vitrail } as CSSProperties}
      />
    ))}
    <circle cx="30" cy="30" r="9" fill="#6B1E23" stroke="#D9B66A" strokeWidth="0.7" />
    <path d="M30 24.5v11M26 28.5h8" stroke="#F0D58E" strokeWidth="1.3" strokeLinecap="round" fill="none" />
  </svg>
);

export default Rosace;
