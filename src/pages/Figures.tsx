import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { EPOQUES, normalizeLetter, type Epoque, type Figure, type Role } from '../data/figures';
import { useFigures } from '../hooks/useFigures';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { normalizeForSearch } from '../utils/text';
import { tapHaptic } from '../utils/haptics';
import './Figures.css';

// Les figures (maquette « Figures v2 ») : en-tête nuit avec frise des
// époques, barre collante (recherche, grille/liste, rôles), grille d'arches
// par ordre biblique ou liste A-Z.

const EASE = 'cubic-bezier(.2,.7,.2,1)';

/** Libellé court et repère de date de chaque époque, dans l'ordre biblique. */
const ERA_INFO: Record<Epoque, { label: string; when: string; bg: string }> = {
  Origines: { label: 'Origines', when: 'Gn 1-11', bg: 'linear-gradient(180deg,#4A3A26,#1E1A14)' },
  Patriarches: { label: 'Patriarches', when: '≈ 1800 av.', bg: 'linear-gradient(180deg,#6A552E,#23201A)' },
  Exode: { label: 'Exode', when: '≈ 1250 av.', bg: 'linear-gradient(180deg,#8A2A2F,#3A1014)' },
  Juges: { label: 'Juges', when: '≈ 1150 av.', bg: 'linear-gradient(180deg,#5E6A3A,#22261A)' },
  Royaume: { label: 'Royaume', when: '≈ 1000 av.', bg: 'linear-gradient(180deg,#7A2228,#2A0E10)' },
  Prophètes: { label: 'Prophètes', when: '≈ 750 av.', bg: 'linear-gradient(180deg,#3E3A6A,#171830)' },
  'Exil et retour': { label: 'Exil', when: '587 av.', bg: 'linear-gradient(180deg,#4A3A5A,#1E1828)' },
  Évangiles: { label: 'Évangiles', when: '≈ 30', bg: 'linear-gradient(180deg,#24406B,#141C30)' },
  'Église primitive': { label: 'Église naissante', when: '≈ 50', bg: 'linear-gradient(180deg,#2E5585,#141C30)' }
};

/** Puces de rôle : regroupent les rôles de la base (et le genre pour « Femmes »). */
const ROLE_CHIPS: { label: string; test: (f: Figure) => boolean }[] = [
  { label: 'Toutes', test: () => true },
  { label: 'Patriarches', test: (f) => f.role === 'Patriarche' || f.role === 'Matriarche' },
  { label: 'Rois', test: (f) => f.role === 'Roi' || f.role === 'Reine' },
  { label: 'Prophètes', test: (f) => f.role === 'Prophète' || f.role === 'Prophétesse' },
  { label: 'Juges', test: (f) => f.role === 'Juge' },
  { label: 'Prêtres', test: (f) => f.role === 'Prêtre' },
  { label: 'Chefs', test: (f) => f.role === 'Chef' || f.role === 'Gouverneur' },
  { label: 'Apôtres', test: (f) => f.role === 'Apôtre' },
  { label: 'Évangélistes', test: (f) => f.role === 'Évangéliste' },
  { label: 'Disciples', test: (f) => f.role === 'Disciple' || f.role === 'Missionnaire' },
  { label: 'Femmes', test: (f) => f.genre === 'femme' }
];

/** Largeur d'une époque sur la frise, marge de part et d'autre. */
const W = 84;
const PAD = 20;
const NARROW_NBSP = String.fromCharCode(0x202f);

const formatCount = (n: number) =>
  n >= 1000 ? `${Math.floor(n / 1000)}${NARROW_NBSP}${String(n % 1000).padStart(3, '0')}` : String(n);

const roleLine = (f: Figure) => [f.role === 'Autre' ? null : (f.role as Role), f.date].filter(Boolean).join(' · ');

// Étoiles de l'en-tête : positions fixes (générateur déterministe).
const STARS = (() => {
  let s = 11;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 32 }, () => ({
    left: `${(rnd() * 100).toFixed(1)}%`,
    top: `${(rnd() * 100).toFixed(1)}%`,
    size: rnd() > 0.75 ? 3 : 2,
    duration: `${(2 + rnd() * 3).toFixed(2)}s`,
    delay: `${(-rnd() * 4).toFixed(2)}s`
  }));
})();

/** Préférence « afficher les figures sans illustration », gardée sur l'appareil. */
const SHOW_UNILLUSTRATED_KEY = 'figures-show-unillustrated';

function loadShowUnillustrated(): boolean {
  try {
    return localStorage.getItem(SHOW_UNILLUSTRATED_KEY) === '1';
  } catch {
    return false;
  }
}

function saveShowUnillustrated(value: boolean) {
  try {
    localStorage.setItem(SHOW_UNILLUSTRATED_KEY, value ? '1' : '0');
  } catch {
    // Stockage indisponible : la liste repartira masquée au prochain lancement.
  }
}

/** Arche : portrait de la figure, ou son initiale sur le fond de l'époque. */
const Arch: React.FC<{ figure: Figure; index: number }> = ({ figure, index }) => {
  const [broken, setBroken] = useState(false);
  const era = ERA_INFO[figure.epoque];
  return (
    <span className="fg-arch" style={{ background: era.bg }}>
      {figure.image && !broken ? (
        <img className="fg-arch-img" src={figure.image} alt="" loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <>
          <span className="fg-arch-glow" style={{ animationDelay: `${-(index % 5)}s` }} />
          <span className="fg-arch-rays" />
          <span className="fg-arch-initial">{normalizeLetter(figure.name)}</span>
        </>
      )}
      <span className="fg-arch-frame" />
      <span className="fg-arch-foot">
        <span className="fg-arch-era">{era.label}</span>
        <span className="fg-arch-name">{figure.name}</span>
      </span>
    </span>
  );
};

const Figures: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { figures: allFigures } = useFigures();
  // Les figures ajoutées avant leur portrait restent masquées par défaut (elles
  // restent accessibles par la recherche, les liens et l'arbre généalogique).
  const [showUnillustrated, setShowUnillustrated] = useState(loadShowUnillustrated);
  const unillustratedCount = useMemo(() => allFigures.filter((f) => !f.image).length, [allFigures]);
  const figures = useMemo(
    () => (showUnillustrated ? allFigures : allFigures.filter((f) => f.image)),
    [allFigures, showUnillustrated]
  );

  const [era, setEra] = useState(-1);
  const [role, setRole] = useState(0);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const contentRef = useRef<HTMLIonContentElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  /* --- Filtrage --- */

  const q = normalizeForSearch(query.trim());
  // Recherche et époque d'abord : les compteurs des puces de rôle en dépendent.
  const base = useMemo(
    () =>
      figures.filter((f) => {
        if (era >= 0 && f.epoque !== EPOQUES[era]) return false;
        if (!q) return true;
        return normalizeForSearch(
          [f.name, f.originalName, f.role, f.date, ERA_INFO[f.epoque].label, ...f.books].join(' ')
        ).includes(q);
      }),
    [figures, era, q]
  );
  const list = useMemo(() => base.filter(ROLE_CHIPS[role].test), [base, role]);

  // Ordre biblique : par époque, puis l'ordre de la base (chronologique).
  const ordered = useMemo(() => {
    const pos = new Map(figures.map((f, i) => [f.id, i]));
    return list
      .slice()
      .sort((a, b) => EPOQUES.indexOf(a.epoque) - EPOQUES.indexOf(b.epoque) || pos.get(a.id)! - pos.get(b.id)!);
  }, [figures, list]);

  const groups = useMemo(() => {
    const out: { letter: string; rows: Figure[] }[] = [];
    for (const f of list.slice().sort((a, b) => a.name.localeCompare(b.name, 'fr'))) {
      const letter = normalizeLetter(f.name);
      if (out[out.length - 1]?.letter !== letter) out.push({ letter, rows: [] });
      out[out.length - 1].rows.push(f);
    }
    return out;
  }, [list]);

  const chips = ROLE_CHIPS.map((c, i) => ({ ...c, i, n: i === 0 ? base.length : base.filter(c.test).length })).filter(
    (c) => c.i === 0 || c.i === role || c.n > 0
  );

  /* --- Animations --- */

  // Entrée de l'en-tête et compteur de fiches.
  useEffect(() => {
    const page = pageRef.current;
    const total = totalRef.current;
    if (!page || !total) return;
    if (reduced) {
      total.textContent = formatCount(allFigures.length);
      return;
    }
    page.querySelectorAll('[data-in]').forEach((n, i) =>
      n.animate(
        [
          { opacity: 0, transform: 'translateY(18px)', filter: 'blur(5px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ],
        { duration: 1100, delay: 120 + i * 130, easing: EASE, fill: 'backwards' }
      )
    );
    const target = allFigures.length;
    const t0 = performance.now() + 500;
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - t0) / 1600));
      total.textContent = formatCount(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Une fois par chargement de la base (le nombre peut changer avec la base locale).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFigures.length]);

  // Parallaxe du décor de l'en-tête.
  useEffect(() => {
    if (reduced) return;
    let el: HTMLElement | null = null;
    let raf = 0;
    const onScroll = () => {
      if (raf || !el) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const art = artRef.current;
        if (!art || !el) return;
        art.style.transform = `translateY(${(el.scrollTop * 0.4).toFixed(1)}px)`;
        art.style.opacity = Math.max(0, 1 - el.scrollTop / 420).toFixed(3);
      });
    };
    contentRef.current?.getScrollElement().then((scrollEl) => {
      el = scrollEl;
      el.addEventListener('scroll', onScroll, { passive: true });
    });
    return () => {
      cancelAnimationFrame(raf);
      el?.removeEventListener('scroll', onScroll);
    };
  }, [reduced]);

  // Filtre changé alors qu'on est descendu : remonte au début des résultats.
  const filterKey = `${era}|${role}|${q}|${view}|${showUnillustrated}`;
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    contentRef.current?.getScrollElement().then((el) => {
      const body = bodyRef.current;
      if (!body) return;
      const top = body.offsetTop - (barRef.current?.offsetHeight ?? 118);
      if (el.scrollTop > top) el.scrollTop = top;
    });
  }, [filterKey]);

  const pickEra = (k: number) => {
    tapHaptic();
    const next = k === era ? -1 : k;
    setEra(next);
    const ribbon = ribbonRef.current;
    ribbon?.scrollTo({
      left: PAD + (next + 1) * W + W / 2 - ribbon.clientWidth / 2,
      behavior: reduced ? 'auto' : 'smooth'
    });
  };

  const resetAll = () => {
    setEra(-1);
    setRole(0);
    setQuery('');
    ribbonRef.current?.scrollTo({ left: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  const open = (f: Figure) => {
    tapHaptic();
    navigate(`/figures/${f.id}`);
  };

  const eras = [{ label: 'Toutes', when: 'époques' }, ...EPOQUES.map((e) => ERA_INFO[e])];
  const count = `${list.length} figure${list.length > 1 ? 's' : ''}${era >= 0 ? ` · ${ERA_INFO[EPOQUES[era]].label}` : ''}`;

  return (
    <IonPage>
      <IonContent ref={contentRef} fullscreen className="fg-content">
        <div ref={pageRef} className={`fg${reduced ? ' is-reduced' : ''}`}>
          {/* --- En-tête nuit --- */}
          <header className="fg-hero">
            <div className="fg-stars" aria-hidden="true">
              {STARS.map((s, i) => (
                <span
                  key={i}
                  style={{
                    left: s.left,
                    top: s.top,
                    width: s.size,
                    height: s.size,
                    animationDuration: s.duration,
                    animationDelay: s.delay
                  }}
                />
              ))}
            </div>
            <div ref={artRef} className="fg-hero-art" aria-hidden="true">
              <span className="fg-beams" />
              <span className="fg-halo" />
              <span className="fg-rays" />
            </div>

            <div className="fg-hero-text">
              <p className="fg-kicker" data-in>
                Compendium
              </p>
              <h1 className="fg-title" data-in>
                Les <em>figures</em>
              </h1>
              <p className="fg-lede" data-in>
                <span ref={totalRef}>{reduced ? formatCount(allFigures.length) : '0'}</span> fiches, de la Genèse à
                l'Apocalypse
              </p>
            </div>

            <div ref={ribbonRef} className="fg-ribbon" data-in>
              <div className="fg-ribbon-track" style={{ width: PAD * 2 + eras.length * W }}>
                <div className="fg-testament" style={{ left: PAD + W, width: W * 7 }}>
                  <span>Ancien Testament</span>
                  <i />
                </div>
                <div className="fg-testament" style={{ left: PAD + W * 8, width: W * 2 }}>
                  <span>Nouveau</span>
                  <i />
                </div>
                <span className="fg-ribbon-line" />
                <span className="fg-ribbon-mark" style={{ left: PAD + (era + 1) * W + W / 2 }} aria-hidden="true" />
                <div className="fg-eras" role="tablist" aria-label="Époque">
                  {eras.map((e, j) => {
                    const k = j - 1;
                    const on = k === era;
                    return (
                      <button
                        key={e.label}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        className={`fg-era${on ? ' is-active' : ''}${k < 0 ? ' is-all' : ''}`}
                        onClick={() => pickEra(k)}
                      >
                        <span className="fg-era-dot" />
                        <span className="fg-era-label">{e.label}</span>
                        <span className="fg-era-when">{e.when}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </header>

          {/* --- Barre collante --- */}
          <div ref={barRef} className="fg-bar">
            <div className="fg-bar-row">
              <label className="fg-search">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="6.6" cy="6.6" r="5.4" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M10.6 10.6L15 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  className="fg-search-input"
                  placeholder="Nom, rôle, référence…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Rechercher une figure"
                  enterKeyHint="search"
                />
                {query && (
                  <button type="button" className="fg-search-clear" onClick={() => setQuery('')} aria-label="Effacer">
                    ×
                  </button>
                )}
              </label>
              <div className={`fg-views${view === 'list' ? ' is-list' : ''}`} role="group" aria-label="Affichage">
                <span className="fg-views-pill" aria-hidden="true" />
                <button
                  type="button"
                  className="fg-view"
                  onClick={() => setView('grid')}
                  aria-pressed={view === 'grid'}
                  aria-label="Grille"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M1 6V3.5a2.5 2.5 0 015 0V6H1zM8 6V3.5a2.5 2.5 0 015 0V6H8zM1 13V9.5a2.5 2.5 0 015 0V13H1zM8 13V9.5a2.5 2.5 0 015 0V13H8z"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="fg-view"
                  onClick={() => setView('list')}
                  aria-pressed={view === 'list'}
                  aria-label="Liste de A à Z"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="fg-roles">
              {chips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  className={`fg-role${c.i === role ? ' is-active' : ''}`}
                  aria-pressed={c.i === role}
                  onClick={() => setRole(c.i)}
                >
                  {c.label}
                  <span className="fg-role-n">{c.n}</span>
                </button>
              ))}
            </div>
          </div>

          {/* --- Résultats (la clé rejoue l'apparition à chaque filtre) --- */}
          <div ref={bodyRef} className="fg-body" key={filterKey}>
            <div className="fg-count fg-res" style={{ '--r': 0 } as CSSProperties}>
              <span className="fg-count-main">{count}</span>
              <span className="fg-count-sort">{view === 'grid' ? 'par ordre biblique' : 'de A à Z'}</span>
            </div>

            {unillustratedCount > 0 && (
              <button
                type="button"
                className={`fg-unillustrated fg-res${showUnillustrated ? ' is-on' : ''}`}
                style={{ '--r': 0 } as CSSProperties}
                aria-pressed={showUnillustrated}
                onClick={() => {
                  tapHaptic();
                  setShowUnillustrated((v) => {
                    saveShowUnillustrated(!v);
                    return !v;
                  });
                }}
              >
                <span className="fg-unillustrated-switch" aria-hidden="true">
                  <span />
                </span>
                {showUnillustrated
                  ? `${unillustratedCount} fiches sans illustration affichées`
                  : `Afficher les ${unillustratedCount} fiches sans illustration`}
              </button>
            )}

            {view === 'grid' && ordered.length > 0 && (
              <div className="fg-grid">
                {ordered.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    className="fg-card fg-res"
                    style={{ '--r': Math.min(i + 1, 12) } as CSSProperties}
                    onClick={() => open(f)}
                  >
                    <Arch figure={f} index={i} />
                    <span className="fg-card-role">{roleLine(f)}</span>
                    <span className="fg-card-ref">{f.books.join(' · ')}</span>
                  </button>
                ))}
              </div>
            )}

            {view === 'list' &&
              groups.map((g, gi) => (
                <section key={g.letter} className="fg-group fg-res" style={{ '--r': Math.min(gi + 1, 12) } as CSSProperties}>
                  <div className="fg-letter">
                    <span>{g.letter}</span>
                    <i />
                  </div>
                  {g.rows.map((f) => (
                    <button key={f.id} type="button" className="fg-row" onClick={() => open(f)}>
                      <span className="fg-row-badge" style={{ background: ERA_INFO[f.epoque].bg }}>
                        {f.image ? <img src={f.image} alt="" loading="lazy" /> : normalizeLetter(f.name)}
                      </span>
                      <span className="fg-row-text">
                        <span className="fg-row-name">{f.name}</span>
                        <span className="fg-row-role">{roleLine(f)}</span>
                      </span>
                      <span className="fg-row-ref">{f.books.slice(0, 2).join(' · ')}</span>
                    </button>
                  ))}
                </section>
              ))}

            {list.length === 0 && (
              <div className="fg-empty fg-res" style={{ '--r': 1 } as CSSProperties}>
                <div className="fg-empty-mark" aria-hidden="true">
                  <span className="fg-empty-glow" />
                  <span className="fg-empty-rays" />
                  <span className="fg-empty-star">✦</span>
                </div>
                <p className="fg-empty-title">Aucune figure</p>
                <p className="fg-empty-text">Essayez une autre époque ou un autre rôle.</p>
                <button type="button" className="fg-empty-reset" onClick={resetAll}>
                  Tout afficher
                </button>
              </div>
            )}
          </div>

          <p className="fg-foot">Chaque fiche cite ses sources bibliques et patristiques</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Figures;
