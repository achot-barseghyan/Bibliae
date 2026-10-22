import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage } from '@ionic/react';
import {
  COMMUNAUTES,
  COMMUNITY_FILTERS,
  MAJOR_ORDERS,
  ORDER_FILTERS,
  ORDRES,
  type ReligiousFamily
} from '../../data/ordres';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import { ExternalArrowIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './Ordres.css';

const EASE = 'cubic-bezier(.2,.7,.2,1)';
const ROM = ['', 'Iᵉʳ', 'IIᵉ', 'IIIᵉ', 'IVᵉ', 'Vᵉ', 'VIᵉ', 'VIIᵉ', 'VIIIᵉ', 'IXᵉ', 'Xᵉ', 'XIᵉ', 'XIIᵉ', 'XIIIᵉ', 'XIVᵉ', 'XVᵉ', 'XVIᵉ', 'XVIIᵉ', 'XVIIIᵉ', 'XIXᵉ', 'XXᵉ', 'XXIᵉ'];

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const wikiUrl = (name: string) => `https://fr.wikipedia.org/w/index.php?search=${encodeURIComponent(name)}`;

const STARS = (() => {
  let seed = 41;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 30 }, () => {
    const left = rnd() * 100;
    const top = rnd() * 100;
    const duration = 2 + rnd() * 3;
    const delay = -rnd() * 4;
    return { left, top, duration, delay };
  });
})();

type Mode = 'ordre' | 'communaute';

const matches = (o: ReligiousFamily, q: string) =>
  !q || fold([o.name, o.sigle, o.founder, o.place, o.cat, o.status, o.houses.join(' ')].join(' ')).includes(q);

/** Liste visible pour un mode : filtre de catégorie, puis recherche. Une
 * recherche porte sur toute la liste, même depuis « Principaux ». */
function filterList(mode: Mode, filter: string, query: string): ReligiousFamily[] {
  const q = fold(query.trim());
  if (mode === 'ordre') {
    return ORDRES.filter(
      (o) =>
        (filter === 'Tous' ||
          (filter === 'Principaux' ? !!q || MAJOR_ORDERS.has(o.name) : filter === 'Disparus' ? o.gone : o.cat === filter)) &&
        matches(o, q)
    );
  }
  return COMMUNAUTES.filter(
    (o) =>
      (filter === 'Toutes' || (filter === 'Principales' ? !!q || !!o.charism : o.cat === filter)) && matches(o, q)
  );
}

/** Pastille aux couleurs de l'habit : habit autour, scapulaire ou voile au centre. */
const Medal: React.FC<{ colors: [string, string]; className: string }> = ({ colors, className }) => (
  <span className={className} style={{ background: colors[0] }} aria-hidden="true">
    <span style={{ background: colors[1] }} />
  </span>
);

const Ordres: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [mode, setMode] = useState<Mode>('ordre');
  const [orderFilter, setOrderFilter] = useState(ORDER_FILTERS[0]);
  const [communityFilter, setCommunityFilter] = useState(COMMUNITY_FILTERS[0]);
  const [query, setQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cur, setCur] = useState<ReligiousFamily>(ORDRES[0]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetBodyRef = useRef<HTMLDivElement>(null);
  const firstMode = useRef(true);

  const filter = mode === 'ordre' ? orderFilter : communityFilter;
  const list = useMemo(() => filterList(mode, filter, query), [mode, filter, query]);

  const centuries = useMemo(() => {
    const out: { label: string; suffix: string; items: ReligiousFamily[] }[] = [];
    if (mode !== 'ordre') return out;
    list.forEach((o) => {
      const label = o.year ? ROM[Math.floor((o.year - 1) / 100) + 1] : 'Date';
      if (!out.length || out[out.length - 1].label !== label)
        out.push({ label, suffix: o.year ? 'siècle' : 'non précisée', items: [] });
      out[out.length - 1].items.push(o);
    });
    return out;
  }, [mode, list]);

  // Précédent / suivant dans la liste filtrée du mode de la fiche ouverte.
  const sequence = useMemo(() => {
    const L = cur.kind === 'ordre' ? filterList('ordre', orderFilter, query) : filterList('communaute', communityFilter, query);
    return L.length ? L : [cur];
  }, [cur, orderFilter, communityFilter, query]);
  const curIndex = Math.max(
    0,
    sequence.findIndex((o) => o.id === cur.id)
  );
  const prevItem = sequence[(curIndex - 1 + sequence.length) % sequence.length];
  const nextItem = sequence[(curIndex + 1) % sequence.length];

  /* --- Entrée, bouton retour qui s'efface au défilement --- */

  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    if (!reduced) {
      heroRef.current?.querySelectorAll('[data-in]').forEach((n, i) =>
        n.animate(
          [
            { opacity: 0, transform: 'translateY(18px)', filter: 'blur(5px)' },
            { opacity: 1, transform: 'none', filter: 'blur(0)' }
          ],
          { duration: 1100, delay: 120 + i * 120, easing: EASE, fill: 'backwards' }
        )
      );
    }
    const onScroll = () => backRef.current?.classList.toggle('is-hidden', sc.scrollTop > 300);
    sc.addEventListener('scroll', onScroll, { passive: true });
    return () => sc.removeEventListener('scroll', onScroll);
  }, [reduced]);

  /* --- Animations de liste et de mode --- */

  useEffect(() => {
    if (reduced) return;
    listRef.current?.querySelectorAll('[data-row]').forEach((c, i) => {
      if (i >= 12) return;
      c.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], {
        duration: 600,
        delay: i * 55,
        easing: EASE,
        fill: 'backwards'
      });
    });
  }, [mode, filter, query, reduced]);

  useEffect(() => {
    if (firstMode.current) {
      firstMode.current = false;
      return;
    }
    if (reduced) return;
    bodyRef.current?.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], {
      duration: 600,
      easing: EASE
    });
  }, [mode, reduced]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  useSheetDrag(sheetRef, () => setSheetOpen(false), sheetOpen);

  const pickMode = (m: Mode) => {
    if (m === mode) return;
    tapHaptic();
    setMode(m);
    setQuery('');
  };

  const pickFilter = (f: string) => {
    tapHaptic();
    if (mode === 'ordre') setOrderFilter(f);
    else setCommunityFilter(f);
  };

  const open = (o: ReligiousFamily) => {
    tapHaptic();
    setCur(o);
    setSheetOpen(true);
    const body = sheetBodyRef.current;
    if (body) {
      body.scrollTop = 0;
      if (!reduced)
        body.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], {
          duration: 650,
          delay: 120,
          easing: EASE,
          fill: 'backwards'
        });
    }
  };

  const isOrder = cur.kind === 'ordre';
  const curKicker = isOrder
    ? [cur.sigle, cur.cat, cur.gone ? 'Disparu' : ''].filter(Boolean).join(' · ')
    : `${cur.cat} · ${cur.status}`;
  const countLabel =
    mode === 'ordre'
      ? `${list.length} ${list.length > 1 ? 'ordres et congrégations' : 'ordre'}`
      : `${list.length} ${list.length > 1 ? 'communautés' : 'communauté'}`;

  return (
    <IonPage className="oc-page">
      <button
        ref={backRef}
        type="button"
        className="oc-back"
        onClick={() => {
          tapHaptic();
          navigate(-1);
        }}
      >
        <span className="oc-back-chevron" aria-hidden="true">
          ‹
        </span>
        Église
      </button>

      <div ref={scrollRef} className="oc-scroll">
        <div ref={heroRef} className="oc-hero">
          <div className="oc-stars" aria-hidden="true">
            {STARS.map((s, i) => (
              <span
                key={i}
                className="oc-star"
                style={{
                  left: `${s.left.toFixed(1)}%`,
                  top: `${s.top.toFixed(1)}%`,
                  animationDuration: `${s.duration.toFixed(2)}s`,
                  animationDelay: `${s.delay.toFixed(2)}s`
                }}
              />
            ))}
          </div>
          <div data-in="" className="oc-rosace" aria-hidden="true">
            <span className="oc-rosace-glow" />
            <span className="oc-rosace-ticks" />
            <span className="oc-rosace-core">✚︎</span>
          </div>
          <p data-in="" className="oc-hero-kicker">
            Vie consacrée · familles d'Église
          </p>
          <h1 data-in="" className="oc-hero-title">
            Ordres &amp; communautés
          </h1>
          <p data-in="" className="oc-hero-text">
            Des premiers moines aux communautés nouvelles, ceux qui ont tout quitté pour suivre le Christ.
          </p>
        </div>

        {/* --- Mode, recherche, catégories --- */}
        <div className="oc-toolbar">
          <div className="oc-toolbar-top">
            <div className="oc-seg" role="tablist" aria-label="Affichage">
              <span className={`oc-seg-thumb${mode === 'communaute' ? ' is-right' : ''}`} aria-hidden="true" />
              {(
                [
                  ['ordre', 'Ordres', ORDRES.length],
                  ['communaute', 'Communautés', COMMUNAUTES.length]
                ] as const
              ).map(([k, label, n]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={k === mode}
                  className={`oc-seg-btn${k === mode ? ' is-active' : ''}`}
                  onClick={() => pickMode(k)}
                >
                  {label}
                  <span className="oc-seg-count">{n}</span>
                </button>
              ))}
            </div>
            <label className="oc-search">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M8.2 14.4a6.2 6.2 0 100-12.4 6.2 6.2 0 000 12.4zM12.9 12.9l3.7 3.7"
                  stroke="rgba(35,32,26,0.55)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={mode === 'ordre' ? 'Ordre, sigle, fondateur, ville…' : 'Communauté, fondateur, ville…'}
                aria-label={mode === 'ordre' ? 'Chercher un ordre' : 'Chercher une communauté'}
                enterKeyHint="search"
              />
            </label>
          </div>
          <div className="oc-cats">
            {(mode === 'ordre' ? ORDER_FILTERS : COMMUNITY_FILTERS).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={c === filter}
                className={`oc-cat${c === filter ? ' is-active' : ''}`}
                onClick={() => pickFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div ref={bodyRef} className="oc-body">
          <div className="oc-body-head">
            <p className="oc-kicker">{mode === 'ordre' ? 'La frise des fondations' : 'Communautés nouvelles'}</p>
            <p className="oc-count">{countLabel}</p>
          </div>

          {mode === 'ordre' ? (
            <div ref={listRef} className="oc-frise">
              <span className="oc-frise-line" aria-hidden="true" />
              {centuries.map((g) => (
                <section key={g.label}>
                  <h2 className="oc-century">
                    <span className="oc-century-dot" aria-hidden="true" />
                    <span className="oc-century-label">{g.label}</span>
                    <span className="oc-century-suffix">{g.suffix}</span>
                  </h2>
                  {g.items.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      data-row=""
                      className={`oc-row${o.gone ? ' is-gone' : ''}`}
                      onClick={() => open(o)}
                    >
                      <span className="oc-row-year">{o.year ?? '—'}</span>
                      <span className="oc-row-dot" aria-hidden="true" />
                      <span className="oc-row-card">
                        <Medal colors={o.colors} className="oc-medal-sm" />
                        <span className="oc-row-text">
                          <span className="oc-row-name">{o.name}</span>
                          <span className="oc-row-founder">{o.founder || o.place || 'Fondateur non précisé'}</span>
                          <span className="oc-row-meta">
                            <span>{[o.sigle, o.cat].filter(Boolean).join(' · ')}</span>
                            {o.gone && <span className="oc-gone">Disparu</span>}
                          </span>
                        </span>
                        <span className="oc-row-chevron" aria-hidden="true">
                          ›
                        </span>
                      </span>
                    </button>
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <div ref={listRef} className="oc-coms">
              {list.map((o) => (
                <button key={o.id} type="button" data-row="" className="oc-com" onClick={() => open(o)}>
                  <span className="oc-com-top">
                    <span className="oc-com-head">
                      <span className="oc-com-cat">{o.cat}</span>
                      <span className="oc-com-name">{o.name}</span>
                    </span>
                    <span className="oc-com-when">
                      <span className="oc-com-year">{o.year ?? '—'}</span>
                      <span className="oc-com-place">{o.place}</span>
                    </span>
                  </span>
                  {o.charism && <span className="oc-com-charism">{o.charism}</span>}
                  <span className="oc-com-foot">
                    <span className="oc-com-founder">{o.founder || o.status}</span>
                    <span className="oc-com-arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {list.length === 0 && (
            <div className="oc-empty">
              <p className="oc-empty-title">Aucun résultat</p>
              <p className="oc-empty-text">Essaie un autre nom, un fondateur ou une ville.</p>
            </div>
          )}
        </div>

        <p className="oc-footer">Source : Wikipédia, « Liste des congrégations catholiques »</p>
      </div>

      {/* --- Fiche --- */}
      <div className={`oc-sheet-layer${sheetOpen ? ' is-open' : ''}`} aria-hidden={!sheetOpen}>
        <div className="oc-sheet-scrim" onClick={() => setSheetOpen(false)} />
        <div ref={sheetRef} className="oc-sheet" role="dialog" aria-modal="true" aria-label={cur.name}>
          <button type="button" className="oc-sheet-handle" aria-label="Fermer" onClick={() => setSheetOpen(false)}>
            <span />
          </button>
          <div ref={sheetBodyRef} className="oc-sheet-body">
            <div className="oc-medal" aria-hidden="true">
              <span className="oc-medal-ticks" />
              <span className="oc-medal-ring" />
              <Medal colors={cur.colors} className="oc-medal-core" />
            </div>
            <p className="oc-sheet-kicker">{curKicker}</p>
            <h2 className="oc-sheet-name">{cur.name}</h2>
            {isOrder && cur.motto && <p className="oc-sheet-motto">« {cur.motto} »</p>}

            <div className="oc-facts">
              <div className="oc-fact">
                <p className="oc-label">Fondation</p>
                <p className="oc-fact-year">{cur.year ?? '—'}</p>
                {cur.place && <p className="oc-fact-sub">{cur.place}</p>}
              </div>
              <div className="oc-fact">
                <p className="oc-label">{isOrder ? (cur.rule ? 'Règle' : 'Famille') : 'Statut'}</p>
                <p className="oc-fact-rule">{isOrder ? cur.rule || cur.cat : cur.status}</p>
              </div>
            </div>

            {cur.founder && (
              <div className="oc-section">
                <p className="oc-label">Fondateur</p>
                <p className="oc-founder">{cur.founder}</p>
              </div>
            )}

            {cur.charism && (
              <div className="oc-section">
                <p className="oc-label">Charisme</p>
                <p className="oc-charism">{cur.charism}</p>
              </div>
            )}

            {cur.habit && (
              <div className="oc-habit">
                <span className="oc-swatches" aria-hidden="true">
                  <span style={{ background: cur.colors[0] }} />
                  <span style={{ background: cur.colors[1] }} />
                </span>
                <p className="oc-habit-text">{cur.habit}</p>
              </div>
            )}

            {cur.houses.length > 0 && (
              <>
                <div className="oc-section oc-section--houses">
                  <p className="oc-label">Où les rencontrer en France</p>
                  <div className="oc-houses">
                    {cur.houses.map((h) => (
                      <span key={h} className="oc-house">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="oc-btn oc-btn--dark"
                  onClick={() => {
                    tapHaptic();
                    setSheetOpen(false);
                    navigate('/paroisses');
                  }}
                >
                  Voir sur la carte <span aria-hidden="true">→</span>
                </button>
              </>
            )}

            <a className="oc-btn oc-btn--outline" href={wikiUrl(cur.name)} target="_blank" rel="noopener noreferrer">
              Lire sur Wikipédia <ExternalArrowIcon />
            </a>

            <div className="oc-sheet-nav">
              <button type="button" className="oc-sheet-prev" onClick={() => open(prevItem)}>
                <span className="oc-sheet-nav-label">← Précédent</span>
                <span className="oc-sheet-nav-name">{prevItem.name}</span>
              </button>
              <button type="button" className="oc-sheet-next" onClick={() => open(nextItem)}>
                <span className="oc-sheet-nav-label">Suivant →</span>
                <span className="oc-sheet-nav-name">{nextItem.name}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </IonPage>
  );
};

export default Ordres;
