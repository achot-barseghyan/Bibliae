import { useEffect, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Rosace from './Rosace';
import RosaceMenu from './RosaceMenu';
import { useElementWidth } from '../../hooks/useElementWidth';
import { tapHaptic } from '../../utils/haptics';
import { activeTabIndex, type NavTab } from './compendiumTabs';
import './RosaceNavBar.css';

// Maquette sur 402 de large. Sur un écran plus large, les arcades restent
// collées aux bords, le fronton au centre, et seuls les filets s'allongent ;
// sur un écran plus étroit, le dessin entier est légèrement resserré.
const BASE_WIDTH = 402;
const CLOSE_MS = 550;

const VITRAIL = ['#2F4A7A', '#8A2E33', '#B5892E'];
const LEFT_X = [10, 32, 54, 76, 98, 120];
const RIGHT_X = [376, 354, 332, 310, 288, 266];

const arcades = (xs: number[]) =>
  xs.map((x) => `M${x} 96V69.6A16 16 0 0 1 ${x + 8} 60A16 16 0 0 1 ${x + 16} 69.6V96`).join('');

const trilobes = (xs: number[]) =>
  xs.map((x) => `M${x + 8} 51.5m-2.4 0a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0`).join('');

const vitrail = (x: number) => `M${x + 2} 96V70.2A12 12 0 0 1 ${x + 8} 63A12 12 0 0 1 ${x + 14} 70.2V96Z`;

function frontonPath(c: number, w: number, y: number, k: number): string {
  // y : hauteur du filet ; k : 0 pour le bord, 1 pour le filet or décalé.
  const [a, b, d, e, f, apex] = k === 0 ? [50, 41, 35, 29, 15, 12] : [48, 39, 33, 27, 14, 16];
  const [y1, y2, y3] = k === 0 ? [40, 32, 16] : [43, 35, 20];
  return (
    `M0 ${y}H${c - a}C${c - b} ${y} ${c - d} ${y1} ${c - e} ${y2}Q${c - f} ${y3} ${c} ${apex}` +
    `Q${c + f} ${y3} ${c + e} ${y2}C${c + d} ${y1} ${c + b} ${y} ${c + a} ${y}H${w}`
  );
}

/** Le tracé progressif de la barre ne se joue qu'au premier affichage de l'app. */
let barHasBeenDrawn = false;

const order = (d: number) => ({ '--d': `${d}ms` } as CSSProperties);

interface RosaceNavBarProps {
  /** Onglets à placer de part et d'autre de la rosace (2 + 2), à la place des arcades. */
  tabs?: NavTab[];
}

/**
 * Barre du bas « rosace » : fronton ogival et rosace au centre qui ouvre le
 * menu (RosaceMenu). De part et d'autre, soit les arcades et vitraux, soit
 * (avec `tabs`) les onglets du Compendium. Voir WorldButton et AppTabBar.
 */
const RosaceNavBar: React.FC<RosaceNavBarProps> = ({ tabs }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [barRef, measured] = useElementWidth<HTMLDivElement>(BASE_WIDTH);
  const [phase, setPhase] = useState<'closed' | 'open' | 'closing'>('closed');
  const [drawIn] = useState(() => !barHasBeenDrawn);
  const isOpen = phase === 'open';

  const close = () => setPhase((p) => (p === 'open' ? 'closing' : p));

  useEffect(() => {
    barHasBeenDrawn = true;
  }, []);

  useEffect(() => {
    if (phase !== 'closing') return;
    const timer = window.setTimeout(() => setPhase('closed'), CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Échap et bouton retour Android referment le menu.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onBack = (e: Event) => {
      (e as CustomEvent<{ register: (priority: number, handler: () => void) => void }>).detail.register(110, close);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('ionBackButton', onBack);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('ionBackButton', onBack);
    };
  }, [isOpen]);

  useEffect(() => {
    close();
  }, [location.pathname]);

  const w = Math.max(measured, BASE_WIDTH);
  const c = w / 2;
  const right = `translate(${w - BASE_WIDTH} 0)`;
  const activeIndex = tabs ? activeTabIndex(location.pathname, tabs) : -1;

  const renderTab = (tab: NavTab, index: number) => {
    const isActive = index === activeIndex;
    return (
      <button
        key={tab.path}
        type="button"
        className={`rosace-bar-tab${isActive ? ' is-active' : ''}`}
        onClick={() => {
          tapHaptic();
          if (location.pathname !== tab.path) navigate(tab.path);
        }}
        aria-label={tab.label}
        aria-current={isActive ? 'page' : undefined}
      >
        <tab.Icon width={20} height={20} className="rosace-bar-tab-icon" />
        <span className="rosace-bar-tab-label">{tab.label}</span>
        <span className="rosace-bar-tab-diamond" aria-hidden="true" />
      </button>
    );
  };

  return (
    <div
      className={`rosace-nav${tabs ? ' rosace-nav--tabs' : ''}${isOpen ? ' is-open' : ''}${phase === 'closing' ? ' is-closing' : ''}${drawIn ? ' is-drawing' : ''}`}
    >
      <RosaceMenu isOpen={isOpen} onClose={close} />

      <div className="rosace-bar" ref={barRef}>
        <svg
          className="rosace-bar-frame"
          width="100%"
          height="120"
          viewBox={`0 0 ${w} 120`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={`${frontonPath(c, w, 48, 0)}V120H0Z`} fill="var(--color-papier)" />

          {!tabs && (
            <g className="rosace-bar-vitraux">
              {LEFT_X.map((x, i) => (
                <path
                  key={`l${i}`}
                  d={vitrail(x)}
                  fill={VITRAIL[i % 3]}
                  style={{ '--dist': 5 - i } as CSSProperties}
                />
              ))}
              <g transform={right}>
                {RIGHT_X.map((x, i) => (
                  <path
                    key={`r${i}`}
                    d={vitrail(x)}
                    fill={VITRAIL[i % 3]}
                    style={{ '--dist': 5 - i } as CSSProperties}
                  />
                ))}
              </g>
            </g>
          )}

          <g className="rosace-bar-lines" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path
              d={frontonPath(c, w, 48, 0)}
              pathLength={1}
              stroke="var(--color-oxblood)"
              strokeOpacity="0.55"
              strokeWidth="1"
              style={order(0)}
            />
            <path d={frontonPath(c, w, 51.5, 1)} pathLength={1} stroke="var(--color-or)" strokeWidth="0.5" style={order(150)} />
            {!tabs && (
              <>
                <path d={arcades(LEFT_X)} pathLength={1} stroke="var(--color-or)" strokeWidth="0.8" style={order(350)} />
                <path d={arcades(RIGHT_X)} transform={right} pathLength={1} stroke="var(--color-or)" strokeWidth="0.8" style={order(350)} />
                <path d={trilobes(LEFT_X)} pathLength={1} stroke="var(--color-or)" strokeWidth="0.5" style={order(700)} />
                <path d={trilobes(RIGHT_X)} transform={right} pathLength={1} stroke="var(--color-or)" strokeWidth="0.5" style={order(700)} />
                <path
                  d={`M0 97H${c - 53}M${c + 53} 97H${w}M0 101H${w}`}
                  pathLength={1}
                  stroke="var(--color-oxblood)"
                  strokeOpacity="0.7"
                  strokeWidth="0.5"
                  style={order(250)}
                />
              </>
            )}
          </g>
        </svg>

        {tabs && (
          <div className="rosace-bar-tabs">
            {tabs.slice(0, 2).map((tab, i) => renderTab(tab, i))}
            <span aria-hidden="true" />
            {tabs.slice(2).map((tab, i) => renderTab(tab, i + 2))}
          </div>
        )}

        <span className="rosace-bar-menu-label" aria-hidden="true">
          Menu
        </span>

        <button
          type="button"
          className="rosace-button"
          onClick={() => {
            tapHaptic();
            if (isOpen) close();
            else setPhase('open');
          }}
          aria-label="Menu"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <Rosace className="rosace-glyph" />
        </button>
      </div>
    </div>
  );
};

export default RosaceNavBar;
