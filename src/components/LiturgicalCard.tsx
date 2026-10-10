import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { FeastOfDay } from '../services/liturgicalCalendar';
import { useElementWidth } from '../hooks/useElementWidth';
import { tapHaptic } from '../utils/haptics';
import './LiturgicalCard.css';

/** Couleur liturgique (AELF) → teinte du filet et du médaillon, encre du quadrilobe. */
const COLORS: Record<string, { color: string; ink: string; label: string }> = {
  vert: { color: '#3F6B4A', ink: '#CFE0C4', label: 'Vert' },
  violet: { color: '#5B3A6E', ink: '#E2D2EA', label: 'Violet' },
  blanc: { color: '#EFE4C8', ink: '#B5892E', label: 'Blanc' },
  or: { color: '#EFE4C8', ink: '#B5892E', label: 'Blanc' },
  rouge: { color: '#9B2A2A', ink: '#F0C9B8', label: 'Rouge' },
  rose: { color: '#C88A9A', ink: '#FBE9EC', label: 'Rose' },
  noir: { color: '#23201A', ink: '#CFC6B4', label: 'Noir' }
};

// Maquette sur 354 de large ; sur un écran plus large, la baie s'étire et
// les arcs se recalculent autour du centre.
const BASE_WIDTH = 354;
const BASE_HEIGHT = 252;
/** Hauteur ajoutée par ligne de titre au-delà de 2. */
const EXTRA_LINE = 26;

/** « 27ème » / « 27e » → « 27ᵉ » ; « 1er » reste tel quel. */
function formatOrdinals(text: string): string {
  return text.replace(/(\d+)(ème|eme|e)\b/g, '$1ᵉ');
}

interface LiturgicalCardProps {
  feast: FeastOfDay;
  gospelRef?: string;
  onOpen: () => void;
}

/** Carte « Jour liturgique » de l'Accueil, en forme de baie gothique. */
const LiturgicalCard: React.FC<LiturgicalCardProps> = ({ feast, gospelRef, onOpen }) => {
  const [cardRef, measured] = useElementWidth<HTMLButtonElement>(BASE_WIDTH);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [titleLines, setTitleLines] = useState(2);

  const { color, ink, label } = COLORS[feast.color] ?? COLORS.blanc;
  const title = formatOrdinals(feast.name);
  const date = new Date(`${feast.date}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  // Nombre de lignes du titre, pour agrandir la carte au-delà de 2.
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const update = () => {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 26;
      setTitleLines(Math.max(1, Math.round(el.offsetHeight / lineHeight)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [title]);

  const extra = Math.max(0, titleLines - 2) * EXTRA_LINE;
  const w = measured;
  const h = BASE_HEIGHT + extra;
  const cx = w / 2;

  return (
    <button
      ref={cardRef}
      type="button"
      className="liturgical-card"
      style={{ height: h, '--liturgie-couleur': color, '--extra': `${extra}px` } as CSSProperties}
      onClick={() => {
        tapHaptic();
        onOpen();
      }}
      aria-label={`Liturgie du jour : ${title}${gospelRef ? `, Évangile ${gospelRef}` : ''}`}
    >
      <svg className="liturgical-card-frame" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <path
          className="liturgical-card-bay"
          d={`M0.5 ${h - 0.5}V70A290 290 0 0 1 ${cx} 0.5A290 290 0 0 1 ${w - 0.5} 70V${h - 0.5}Z`}
        />
        <path
          className="liturgical-card-inner"
          d={`M7 ${h - 7}V73A282 282 0 0 1 ${cx} 8A282 282 0 0 1 ${w - 7} 73V${h - 7}Z`}
          stroke={color}
        />
        <circle className="liturgical-card-medallion" cx={cx} cy="34" r="15" fill={color} />
        <g className="liturgical-card-quatrefoil" stroke={ink}>
          <circle cx={cx} cy="27" r="4" />
          <circle cx={cx + 7} cy="34" r="4" />
          <circle cx={cx} cy="41" r="4" />
          <circle cx={cx - 7} cy="34" r="4" />
        </g>
        <g transform={`translate(0 ${extra})`}>
          <path d={`M${cx - 57} 180H${cx - 15}M${cx + 15} 180H${cx + 57}`} stroke="#B5892E" strokeWidth="0.6" />
          <path
            d={`M${cx} 174v12M${cx - 5.5} 179h11`}
            stroke="var(--color-oxblood)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      </svg>

      <div className="liturgical-card-top">
        <p className="liturgical-card-date">{date}</p>
        <p className="liturgical-card-title" ref={titleRef}>
          {title}
        </p>
        <p className="liturgical-card-color">
          <span className="liturgical-card-color-dot" aria-hidden="true" />
          {label}
        </p>
      </div>

      <div className="liturgical-card-bottom">
        {gospelRef && <p className="liturgical-card-gospel">Évangile · {gospelRef}</p>}
        <p className="liturgical-card-source">Source {feast.source.name}</p>
      </div>
    </button>
  );
};

export default LiturgicalCard;
