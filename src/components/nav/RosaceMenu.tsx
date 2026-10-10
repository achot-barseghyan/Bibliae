import type { CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FiguresIcon from '../../assets/icons/fluent_people-community-20-regular.svg?react';
import BibleIcon from '../../assets/icons/at-icons_book.svg?react';
import { SettingsIcon, BookmarkIcon, CalendarIcon } from './icons';
import { tapHaptic } from '../../utils/haptics';
import { useElementWidth } from '../../hooks/useElementWidth';
import './RosaceMenu.css';

type WorldKey = 'compendium' | 'bible' | 'rosaire' | 'prier';

type IconComponent = React.FC<{ width?: number; height?: number; className?: string }>;

/** Chapelet : anneau de 6 grains et petite croix pendante. */
const ChapeletIcon: IconComponent = ({ width = 14, height = 14, className }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden="true">
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3;
      return <circle key={i} cx={12 + 5.5 * Math.sin(a)} cy={8.5 - 5.5 * Math.cos(a)} r="1.5" />;
    })}
    <path d="M12 16v6M9.8 18.2h4.4" />
  </svg>
);

/** Bougie : corps, mèche et flamme. */
const BougieIcon: IconComponent = ({ width = 14, height = 14, className }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 2.5c1.8 2.2 2.3 3.8 0 5.8-2.3-2-1.8-3.6 0-5.8z" />
    <path d="M12 8.3v2" />
    <rect x="8.5" y="10.5" width="7" height="11" rx="0.6" />
  </svg>
);

interface World {
  key: WorldKey;
  label: string;
  subtitle: string;
  path: string;
  Icon: IconComponent;
}

const worlds: World[] = [
  { key: 'compendium', label: 'Compendium', subtitle: 'Figures, lieux, frise, Église', path: '/compendium/accueil', Icon: FiguresIcon },
  { key: 'bible', label: 'La Bible', subtitle: '73 livres', path: '/bible', Icon: BibleIcon },
  { key: 'rosaire', label: 'Le Rosaire', subtitle: 'Prière du Rosaire', path: '/rosaire', Icon: ChapeletIcon },
  { key: 'prier', label: 'Prier', subtitle: 'Prières et intercession des saints', path: '/prier', Icon: BougieIcon }
];

const shortcuts = [
  { label: 'Liturgie', path: '/liturgie', icon: <CalendarIcon size={14} /> },
  { label: 'Favoris', path: '/favoris', icon: <BookmarkIcon size={14} filled /> },
  { label: 'Réglages', path: '/reglages', icon: <SettingsIcon size={14} /> }
];

function activeWorldFromPath(pathname: string): WorldKey | null {
  if (pathname.startsWith('/bible')) return 'bible';
  if (pathname.startsWith('/rosaire')) return 'rosaire';
  if (pathname.startsWith('/prier')) return 'prier';
  if (pathname.startsWith('/compendium')) return 'compendium';
  return null;
}

// Géométrie de la feuille (maquette sur 402px de large) : bord supérieur en
// arc brisé, deux arcs qui se rejoignent en pointe au centre. Plus le rayon
// est grand, plus les arcs sont tendus et la pointe aiguë (×1,1 la largeur :
// ~20° de pente au sommet, comme une ogive).
const SHEET_HEIGHT = 560;
const arcRadius = (w: number) => w * 1.1;
const ARC_SIDE = 150;

function sheetPath(w: number): string {
  const c = w / 2;
  const R = arcRadius(w);
  return `M0 ${SHEET_HEIGHT}V${ARC_SIDE}A${R} ${R} 0 0 1 ${c} 0A${R} ${R} 0 0 1 ${w} ${ARC_SIDE}V${SHEET_HEIGHT}`;
}

/** Arc concentrique à l'arc brisé, décalé de `o` px vers l'intérieur. */
function innerArcPath(w: number, o: number): string {
  const c = w / 2;
  const d = Math.hypot(c, ARC_SIDE);
  const h = Math.sqrt(Math.max(arcRadius(w) ** 2 - (d / 2) ** 2, 0));
  // Centre de l'arc gauche (en bas à droite de sa corde).
  const cx = c / 2 + (h * ARC_SIDE) / d;
  const cy = ARC_SIDE / 2 + (h * c) / d;
  const r = arcRadius(w) - o;
  const sideY = cy - Math.sqrt(Math.max(r ** 2 - (o - cx) ** 2, 0));
  const apexY = cy - Math.sqrt(Math.max(r ** 2 - (c - cx) ** 2, 0));
  return `M${o} ${SHEET_HEIGHT}V${sideY}A${r} ${r} 0 0 1 ${c} ${apexY}A${r} ${r} 0 0 1 ${w - o} ${sideY}V${SHEET_HEIGHT}`;
}

const delay = (i: number) => ({ '--i': i } as CSSProperties);

interface RosaceMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Voile + feuille en arc brisé, posée juste au-dessus de la barre rosace
 * (voir RosaceNavBar). Les animations sont des transitions CSS pilotées par
 * la classe `.is-open` de l'ancêtre `.rosace-nav`.
 */
const RosaceMenu: React.FC<RosaceMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeWorld = activeWorldFromPath(location.pathname);
  const [sheetRef, width] = useElementWidth<HTMLDivElement>(402);
  const dx = (width - 402) / 2;

  const go = (path: string, isCurrent: boolean) => {
    tapHaptic();
    onClose();
    if (!isCurrent) navigate(path);
  };

  return (
    <>
      <div className="rosace-menu-voile" onClick={onClose} aria-hidden="true" />

      <div
        ref={sheetRef}
        className="rosace-menu-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!isOpen}
      >
        <svg
          className="rosace-menu-arch"
          width={width}
          height={SHEET_HEIGHT}
          viewBox={`0 0 ${width} ${SHEET_HEIGHT}`}
          aria-hidden="true"
        >
          <path d={`${sheetPath(width)}Z`} fill="var(--color-papier)" />
          <path d={sheetPath(width)} fill="none" stroke="var(--color-oxblood)" strokeOpacity="0.6" strokeWidth="1" />
          <path
            className="rosace-menu-arc rosace-menu-arc--1"
            d={innerArcPath(width, 12)}
            pathLength={1}
            fill="none"
            stroke="var(--color-or)"
            strokeWidth="0.8"
          />
          <path
            className="rosace-menu-arc rosace-menu-arc--2"
            d={innerArcPath(width, 18)}
            pathLength={1}
            fill="none"
            stroke="var(--color-or)"
            strokeWidth="0.4"
          />
          <g className="rosace-menu-traceries" transform={`translate(${dx} 0)`}>
            <path d="M201 18V30M150 52Q201 34 252 52" />
            <path d="M48 150Q120 120 160 128M354 150Q282 120 242 128" />
          </g>
        </svg>

        <div className="rosace-menu-rays" aria-hidden="true">
          <div className="rosace-menu-rays-disc" />
        </div>

        <div className="rosace-menu-content">
          <p className="rosace-menu-wordmark">Bibliae</p>

          <ul className="rosace-menu-entries">
            {worlds.map((world, i) => {
              const isCurrent = world.key === activeWorld;
              return (
                <li key={world.key} className="rosace-menu-entry-item" style={delay(i)}>
                  <button
                    type="button"
                    className={`rosace-menu-entry${isCurrent ? ' is-current' : ''}`}
                    onClick={() => go(world.path, isCurrent)}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    <span className="rosace-menu-lancet" aria-hidden="true">
                      <svg width="26" height="32" viewBox="0 0 26 32">
                        <path d="M2 31V13A17 17 0 0 1 13 1A17 17 0 0 1 24 13V31Z" strokeWidth="0.8" />
                      </svg>
                      <world.Icon width={13} height={13} className="rosace-menu-lancet-icon" />
                    </span>
                    <span className="rosace-menu-entry-text">
                      <span className="rosace-menu-entry-title">{world.label}</span>
                      <span className="rosace-menu-entry-subtitle">{world.subtitle}</span>
                    </span>
                    {isCurrent && <span className="rosace-menu-entry-here">Ici</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rosace-menu-shortcuts">
            {shortcuts.map((s, i) => (
              <button
                key={s.path}
                type="button"
                className="rosace-menu-shortcut"
                style={delay(i)}
                onClick={() => go(s.path, location.pathname.startsWith(s.path))}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RosaceMenu;
