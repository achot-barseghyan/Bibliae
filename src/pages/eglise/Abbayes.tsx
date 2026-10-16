import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage } from '@ionic/react';
import {
  ABBAYES,
  FAMILIES,
  FAMILY_FILTERS,
  GENDER_LABELS,
  type Abbey,
  type Gender,
  type MonasticFamily
} from '../../data/abbayes';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import { ExternalArrowIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './Abbayes.css';

const EASE = 'cubic-bezier(.2,.7,.2,1)';

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// Six lieux n'ont pas d'article : on cherche alors leur nom et leur ordre.
const wikiUrl = (a: Abbey) =>
  a.article
    ? `https://fr.wikipedia.org/wiki/${encodeURIComponent(a.article)}`
    : `https://fr.wikipedia.org/w/index.php?search=${encodeURIComponent(`${a.name} ${a.orderShort}`)}`;
const mapsUrl = (a: Abbey) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    a.lat !== null && a.lon !== null ? `${a.lat},${a.lon}` : (a.address ?? `${a.name}, ${a.commune}, France`)
  )}`;

/** « diocèse d'Autun », « diocèse de Rodez ». */
const dioceseLabel = (d: string) => (/^[AEÉÈIOUY]/.test(d) ? `diocèse d'${d}` : `diocèse de ${d}`);

const STARS = (() => {
  let seed = 11;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 22 }, () => {
    const left = rnd() * 100;
    const top = rnd() * 70;
    const duration = 2.2 + rnd() * 3;
    const delay = -rnd() * 4;
    return { left, top, duration, delay };
  });
})();

type GenderFilter = 'T' | Gender;
type FamilyFilter = 'Tous' | MonasticFamily;

const GENDERS: [GenderFilter, string][] = [
  ['T', 'Tous'],
  ['H', 'Moines'],
  ['F', 'Moniales'],
  ['M', 'Mixtes']
];

/** Vitrail en arche aux couleurs de la famille, sur la liste et la fiche. */
/** Régions présentes, avec leur nombre de lieux, pour le menu de sélection. */
const REGION_OPTIONS = [...new Set(ABBAYES.map((a) => a.region))]
  .sort((a, b) => a.localeCompare(b, 'fr'))
  .map((name) => ({ name, count: ABBAYES.filter((a) => a.region === name).length }));

const Arch: React.FC<{ abbey: Abbey; className: string }> = ({ abbey, className }) => (
  <span className={className} style={{ background: FAMILIES[abbey.family].color }} aria-hidden="true">
    {FAMILIES[abbey.family].glyph}
  </span>
);

const Abbayes: React.FC = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [gender, setGender] = useState<GenderFilter>('T');
  const [family, setFamily] = useState<FamilyFilter>('Tous');
  /** Région choisie, ou '' pour toutes. */
  const [region, setRegion] = useState('');
  const [query, setQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cur, setCur] = useState<Abbey>(ABBAYES[0]);
  /** Photos qui n'ont pas pu se charger (hors ligne) : bandeau de couleur à la place. */
  const [brokenPhotos, setBrokenPhotos] = useState<Set<string>>(() => new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetBodyRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    const q = fold(query.trim());
    return ABBAYES.filter(
      (a) =>
        (gender === 'T' || a.gender === gender) &&
        (family === 'Tous' || a.family === family) &&
        (!region || a.region === region) &&
        (!q || fold(`${a.name} ${a.commune} ${a.dept} ${a.diocese} ${a.region} ${a.order}`).includes(q))
    );
  }, [gender, family, region, query]);

  /** Par région (ordre alphabétique), puis par nom. */
  const regions = useMemo(() => {
    const byRegion = new Map<string, Abbey[]>();
    list.forEach((a) => byRegion.set(a.region, [...(byRegion.get(a.region) ?? []), a]));
    return [...byRegion.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'fr'))
      .map(([name, items]) => ({ name, items: items.sort((a, b) => a.name.localeCompare(b.name, 'fr')) }));
  }, [list]);

  // Précédent / suivant dans l'ordre de la liste affichée.
  const sequence = useMemo(() => {
    const flat = regions.flatMap((r) => r.items);
    return flat.length ? flat : [cur];
  }, [regions, cur]);
  const curIndex = Math.max(
    0,
    sequence.findIndex((a) => a.id === cur.id)
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
            { opacity: 0, transform: 'translateY(18px)', filter: 'blur(4px)' },
            { opacity: 1, transform: 'none', filter: 'blur(0)' }
          ],
          { duration: 1000, delay: 120 + i * 120, easing: EASE, fill: 'backwards' }
        )
      );
    }
    const onScroll = () => backRef.current?.classList.toggle('is-hidden', sc.scrollTop > 300);
    sc.addEventListener('scroll', onScroll, { passive: true });
    return () => sc.removeEventListener('scroll', onScroll);
  }, [reduced]);

  /* --- Animation de la liste --- */

  const firstList = useRef(true);
  useEffect(() => {
    if (reduced) return;
    const base = firstList.current ? 500 : 0;
    firstList.current = false;
    listRef.current?.querySelectorAll('[data-row]').forEach((c, i) => {
      if (i >= 14) return;
      c.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], {
        duration: 650,
        delay: base + i * 45,
        easing: EASE,
        fill: 'backwards'
      });
    });
  }, [gender, family, region, query, reduced]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  useSheetDrag(sheetRef, () => setSheetOpen(false), sheetOpen);

  const open = (a: Abbey) => {
    tapHaptic();
    setCur(a);
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

  const genderIndex = GENDERS.findIndex(([k]) => k === gender);

  return (
    <IonPage className="am-page">
      <button
        ref={backRef}
        type="button"
        className="am-back"
        onClick={() => {
          tapHaptic();
          navigate(-1);
        }}
      >
        <span className="am-back-chevron" aria-hidden="true">
          ‹
        </span>
        Église
      </button>

      <div ref={scrollRef} className="am-scroll">
        <div ref={heroRef} className="am-hero">
          <div className="am-stars" aria-hidden="true">
            {STARS.map((s, i) => (
              <span
                key={i}
                className="am-star"
                style={{
                  left: `${s.left.toFixed(1)}%`,
                  top: `${s.top.toFixed(1)}%`,
                  animationDuration: `${s.duration.toFixed(2)}s`,
                  animationDelay: `${s.delay.toFixed(2)}s`
                }}
              />
            ))}
          </div>
          <div data-in="" className="am-window" aria-hidden="true">
            <span className="am-window-glow" />
            <span className="am-window-frame" />
            <span className="am-window-glass" />
            <span className="am-window-mullion" />
            <span className="am-window-transom" />
            <span className="am-window-medal">✠︎</span>
          </div>
          <p data-in="" className="am-hero-kicker">
            Vie monastique en France
          </p>
          <h1 data-in="" className="am-hero-title">
            Abbayes &amp; monastères
          </h1>
          <p data-in="" className="am-hero-text">
            Des lieux où l'on prie encore aujourd'hui, et où l'on peut souvent séjourner quelques jours.
          </p>
        </div>

        {/* --- Communauté, recherche, familles --- */}
        <div className="am-toolbar">
          <div className="am-toolbar-top">
            <div className="am-seg" role="tablist" aria-label="Communauté">
              <span className="am-seg-thumb" style={{ transform: `translateX(${genderIndex * 100}%)` }} aria-hidden="true" />
              {GENDERS.map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={k === gender}
                  className={`am-seg-btn${k === gender ? ' is-active' : ''}`}
                  onClick={() => {
                    if (k === gender) return;
                    tapHaptic();
                    setGender(k);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="am-filters">
              <label className="am-search">
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
                  placeholder="Abbaye, ville…"
                  aria-label="Chercher une abbaye"
                />
              </label>
              <label className={`am-region-select${region ? ' is-active' : ''}`}>
                <span className="am-region-select-label">{region || 'Toutes les régions'}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <select
                  value={region}
                  onChange={(e) => {
                    tapHaptic();
                    setRegion(e.target.value);
                  }}
                  aria-label="Région"
                >
                  <option value="">Toutes les régions</option>
                  {REGION_OPTIONS.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name} ({r.count})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="am-cats">
            {FAMILY_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={f === family}
                className={`am-cat${f === family ? ' is-active' : ''}`}
                onClick={() => {
                  tapHaptic();
                  setFamily(f);
                }}
              >
                <span
                  className="am-cat-dot"
                  style={{ background: f === 'Tous' ? 'var(--color-or)' : FAMILIES[f].color }}
                  aria-hidden="true"
                />
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="am-body">
          <div className="am-body-head">
            <p className="am-kicker">Par région</p>
            <p className="am-count">
              {list.length} {list.length > 1 ? 'abbayes' : 'abbaye'}
            </p>
          </div>

          <div ref={listRef}>
            {regions.map((r) => (
              <section key={r.name} className="am-region">
                <h2 className="am-region-head">
                  <span className="am-region-name">{r.name}</span>
                  <span className="am-region-count">
                    {r.items.length} {r.items.length > 1 ? 'lieux' : 'lieu'}
                  </span>
                </h2>
                <div className="am-rows">
                  {r.items.map((a) => (
                    <button key={a.id} type="button" data-row="" className="am-row" onClick={() => open(a)}>
                      <Arch abbey={a} className="am-row-arch" />
                      <span className="am-row-text">
                        <span className="am-row-name">{a.name}</span>
                        <span className="am-row-where">
                          {a.commune} · {a.dept}
                        </span>
                        <span className="am-row-meta">
                          {a.orderShort}
                          {a.year ? ` · ${a.year}` : ''}
                        </span>
                      </span>
                      <span className="am-row-chevron" aria-hidden="true">
                        ›
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {list.length === 0 && (
            <div className="am-empty">
              <p className="am-empty-title">Aucun résultat</p>
              <p className="am-empty-text">Essaie un autre nom, une ville ou un département.</p>
            </div>
          )}
        </div>

        <p className="am-footer">
          Source : Wikipédia, « Liste des abbayes et monastères catholiques actifs en France » ; Service des moniales
          (Paray-le-Monial)
        </p>
      </div>

      {/* --- Fiche --- */}
      <div className={`am-sheet-layer${sheetOpen ? ' is-open' : ''}`} aria-hidden={!sheetOpen}>
        <div className="am-sheet-scrim" onClick={() => setSheetOpen(false)} />
        <div ref={sheetRef} className="am-sheet" role="dialog" aria-modal="true" aria-label={cur.name}>
          <button type="button" className="am-sheet-handle" aria-label="Fermer" onClick={() => setSheetOpen(false)}>
            <span />
          </button>
          <div ref={sheetBodyRef} className="am-sheet-body">
            <div className="am-cover" style={{ background: FAMILIES[cur.family].color }}>
              <span className="am-cover-arch" aria-hidden="true">
                {FAMILIES[cur.family].glyph}
              </span>
              {cur.photo && !brokenPhotos.has(cur.id) && (
                <>
                  <img
                    key={cur.id}
                    className="am-cover-photo"
                    src={cur.photo.url}
                    alt={cur.name}
                    loading="lazy"
                    onError={() => setBrokenPhotos((s) => new Set(s).add(cur.id))}
                  />
                  <a className="am-cover-credit" href={cur.photo.page} target="_blank" rel="noopener noreferrer">
                    Photo : {[cur.photo.auteur, cur.photo.licence, 'Wikimedia Commons'].filter(Boolean).join(' · ')}
                  </a>
                </>
              )}
            </div>
            <p className="am-sheet-kicker">
              {cur.orderShort} · {cur.region}
            </p>
            <h2 className="am-sheet-name">{cur.name}</h2>
            <p className="am-sheet-where">
              {cur.commune}, {cur.dept} · {dioceseLabel(cur.diocese)}
            </p>

            <div className="am-facts">
              <div className="am-fact">
                <p className="am-label">Installation</p>
                <p className="am-fact-year">{cur.year ?? '—'}</p>
              </div>
              <div className="am-fact">
                <p className="am-label">Communauté</p>
                <p className="am-fact-value">{GENDER_LABELS[cur.gender]}</p>
              </div>
            </div>

            {cur.order !== cur.orderShort && (
              <div className="am-order">
                <p className="am-label">Ordre</p>
                <p className="am-order-value">{cur.order}</p>
              </div>
            )}

            <p className="am-about">{FAMILIES[cur.family].about}</p>

            <a className="am-btn am-btn--dark" href={mapsUrl(cur)} target="_blank" rel="noopener noreferrer">
              Itinéraire <span aria-hidden="true">→</span>
            </a>
            {!cur.article && cur.site ? (
              <a className="am-btn am-btn--outline" href={cur.site} target="_blank" rel="noopener noreferrer">
                Voir la page du monastère <ExternalArrowIcon />
              </a>
            ) : (
              <a className="am-btn am-btn--outline" href={wikiUrl(cur)} target="_blank" rel="noopener noreferrer">
                Lire sur Wikipédia <ExternalArrowIcon />
              </a>
            )}

            <div className="am-sheet-nav">
              <button type="button" className="am-sheet-prev" onClick={() => open(prevItem)}>
                <span className="am-sheet-nav-label">← Précédent</span>
                <span className="am-sheet-nav-name">{prevItem.name}</span>
              </button>
              <button type="button" className="am-sheet-next" onClick={() => open(nextItem)}>
                <span className="am-sheet-nav-label">Suivant →</span>
                <span className="am-sheet-nav-name">{nextItem.name}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </IonPage>
  );
};

export default Abbayes;
