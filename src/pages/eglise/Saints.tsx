import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage } from '@ionic/react';
import { CALENDAR_SAINTS, SAINT_CATEGORIES, type CalendarSaint } from '../../data/saintsCalendrier';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { tapHaptic } from '../../utils/haptics';
import './Saints.css';

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MCOURT = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
const DIM = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const ERAS = [0, 500, 1000, 1500, 2000];
const EASE = 'cubic-bezier(.2,.7,.2,1)';

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const sortKey = (n: string) => fold(n).replace(/^(le |la |de |d')/, '');
const initial = (n: string) => sortKey(n)[0].toUpperCase();
const dayOfYear = (m: number, d: number) => DIM.slice(0, m).reduce((a, b) => a + b, d);
const dayLabel = (d: number) => (d === 1 ? '1er' : String(d));
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;
const qualLine = (s: CalendarSaint) => [s.qual, s.dates].filter(Boolean).join(' · ');

/** Saint dont la date de fête est connue : seul à figurer sur la roue. */
type DatedSaint = CalendarSaint & { month: number; day: number };
const isDated = (s: CalendarSaint): s is DatedSaint => s.month != null && s.day != null;
const feastLabel = (s: DatedSaint) => `${dayLabel(s.day)} ${MOIS[s.month]}`;

const BY_DATE = CALENDAR_SAINTS.filter(isDated).sort((a, b) => a.month - b.month || a.day - b.day);
const BY_NAME = CALENDAR_SAINTS.slice().sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name), 'fr'));

/* Traits de la roue : rayon de départ (bord du disque intérieur), longueur
   pour un saint, allongement par saint en plus, longueur maximale (avant le bord). */
const TICK_R0 = 112;
const TICK_BASE = 7;
const TICK_STEP = 6;
const TICK_MAX = 40;

/** Angle de la roue qui place le mois `m` sous le repère du haut. */
const monthAngle = (m: number) => -(m * 30 + 15);
/** Angle équivalent à `target` le plus proche de `from`, pour tourner par le plus court. */
const nearest = (from: number, target: number) => from + ((((target - from) % 360) + 540) % 360) - 180;

const STARS = (() => {
  let seed = 23;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 30 }, () => {
    const left = rnd() * 100;
    const top = rnd() * 100;
    const duration = 2 + rnd() * 3;
    const delay = -rnd() * 4;
    return { left, top, duration, delay };
  });
})();

type Mode = 'year' | 'az';

interface WheelDrag {
  a0: number;
  base: number;
  delta: number;
  moved: boolean;
}

const Saints: React.FC = () => {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();

  const today = useMemo(() => {
    const now = new Date();
    return { month: now.getMonth(), doy: dayOfYear(now.getMonth(), now.getDate()) };
  }, []);

  const [mode, setMode] = useState<Mode>('year');
  const [cat, setCat] = useState('Tous');
  const [query, setQuery] = useState('');
  const [month, setMonthState] = useState(today.month);
  const [rot, setRot] = useState(monthAngle(today.month));
  const [dragging, setDragging] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cur, setCur] = useState<number | null>(null);
  const [bubble, setBubble] = useState('');
  const [scrub, setScrub] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLButtonElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const wheelBoxRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const azRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const sheetBodyRef = useRef<HTMLDivElement>(null);
  const wheelDrag = useRef<WheelDrag | null>(null);
  const railActive = useRef(false);
  /** Vrai juste après un glissement de la roue : le clic qui suit est ignoré. */
  const justDragged = useRef(false);
  const lettersRef = useRef<string[]>([]);
  const rotRef = useRef(rot);
  rotRef.current = rot;
  const firstMonth = useRef(true);
  const firstMode = useRef(true);

  /* --- Données dérivées --- */

  const untilLabel = (s: DatedSaint) => {
    const d = (dayOfYear(s.month, s.day) - today.doy + 366) % 366;
    return d === 0 ? "Aujourd'hui" : d === 1 ? 'Demain' : `Dans ${d} jours`;
  };

  const nextSaint = useMemo(() => BY_DATE.find((s) => dayOfYear(s.month, s.day) >= today.doy) ?? BY_DATE[0], [today]);
  const nextIn = (dayOfYear(nextSaint.month, nextSaint.day) - today.doy + 366) % 366;
  const nextKicker = `${nextIn === 0 ? "Fêté aujourd'hui" : nextIn === 1 ? 'Fêté demain' : `Prochaine fête · dans ${nextIn} jours`} · ${feastLabel(nextSaint)}`;

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return CALENDAR_SAINTS.filter(
      (s) =>
        (cat === 'Tous' || s.cat === cat) &&
        (!q || fold(`${s.name} ${s.qual} ${s.patronage} ${s.cat}`).includes(q))
    );
  }, [cat, query]);
  const visibleIds = useMemo(() => new Set(filtered.map((s) => s.id)), [filtered]);
  const datedCount = useMemo(() => filtered.filter(isDated).length, [filtered]);

  /** Un trait par jour fêté : nombre de saints visibles ce jour-là. */
  const dayTicks = useMemo(() => {
    const byDay = new Map<number, { month: number; day: number; count: number }>();
    filtered.filter(isDated).forEach((s) => {
      const key = s.month * 32 + s.day;
      const t = byDay.get(key);
      if (t) t.count++;
      else byDay.set(key, { month: s.month, day: s.day, count: 1 });
    });
    return [...byDay.values()];
  }, [filtered]);

  const monthSaints = useMemo(
    () => filtered.filter((s): s is DatedSaint => isDated(s) && s.month === month).sort((a, b) => a.day - b.day),
    [filtered, month]
  );

  const groups = useMemo(() => {
    const out: { label: string; saints: CalendarSaint[] }[] = [];
    BY_NAME.filter((s) => visibleIds.has(s.id)).forEach((s) => {
      const L = initial(s.name);
      if (!out.length || out[out.length - 1].label !== L) out.push({ label: L, saints: [] });
      out[out.length - 1].saints.push(s);
    });
    return out;
  }, [visibleIds]);
  lettersRef.current = groups.map((g) => g.label);

  const current: CalendarSaint = cur == null ? nextSaint : CALENDAR_SAINTS[cur];
  // Notice : de fête en fête si la date est connue, sinon dans l'ordre alphabétique.
  const sequence: CalendarSaint[] = isDated(current) ? BY_DATE : BY_NAME;
  const curIndex = sequence.findIndex((s) => s.id === current.id);
  const prevInSequence = sequence[(curIndex - 1 + sequence.length) % sequence.length];
  const nextInSequence = sequence[(curIndex + 1) % sequence.length];

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
      haloRef.current?.animate(
        [
          { transform: 'scale(.6) rotate(-40deg)', opacity: 0 },
          { transform: 'none', opacity: 1 }
        ],
        { duration: 1600, easing: EASE }
      );
    }
    const onScroll = () => backRef.current?.classList.toggle('is-hidden', sc.scrollTop > 300);
    sc.addEventListener('scroll', onScroll, { passive: true });
    return () => sc.removeEventListener('scroll', onScroll);
  }, [reduced]);

  /* --- Animations de liste et de mois --- */

  useEffect(() => {
    if (reduced) return;
    const box = mode === 'year' ? listRef.current : azRef.current;
    if (!box) return;
    [...box.children].slice(0, 14).forEach((c, i) =>
      c.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], {
        duration: 600,
        delay: i * 55,
        easing: EASE,
        fill: 'backwards'
      })
    );
  }, [mode, month, cat, query, reduced]);

  useEffect(() => {
    if (firstMonth.current) {
      firstMonth.current = false;
      return;
    }
    if (reduced) return;
    monthRef.current?.animate(
      [
        { opacity: 0, transform: 'scale(.85)', filter: 'blur(4px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' }
      ],
      { duration: 600, easing: EASE }
    );
  }, [month, reduced]);

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

  /* --- Roue de l'année --- */

  const setMonth = (m: number, fromRot = rotRef.current) => {
    const next = ((m % 12) + 12) % 12;
    setMonthState(next);
    setRot(nearest(fromRot, monthAngle(next)));
  };

  const angleAt = (e: PointerEvent | React.PointerEvent) => {
    const box = wheelBoxRef.current;
    if (!box) return 0;
    const r = box.getBoundingClientRect();
    return (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
  };

  const wheelDown = (e: React.PointerEvent) => {
    wheelDrag.current = { a0: angleAt(e), base: rotRef.current, delta: 0, moved: false };
  };

  /* --- Index alphabétique --- */

  const railAt = (clientY: number) => {
    const rail = railRef.current;
    const sc = scrollRef.current;
    const letters = lettersRef.current;
    if (!rail || !sc || !letters.length) return;
    const b = rail.getBoundingClientRect();
    const k = Math.max(0, Math.min(letters.length - 1, Math.floor(((clientY - b.top) / b.height) * letters.length)));
    const l = letters[k];
    setBubble(l);
    setScrub(true);
    const g = sc.querySelector<HTMLElement>(`[data-letter="${l}"]`);
    if (g) sc.scrollTop = g.offsetTop - (toolbarRef.current?.offsetHeight ?? 118);
  };

  useEffect(() => {
    let scrubTimer = 0;
    const onMove = (e: PointerEvent) => {
      const d = wheelDrag.current;
      if (d) {
        let delta = angleAt(e) - d.a0;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        d.delta = delta;
        if (Math.abs(delta) > 3 && !d.moved) {
          d.moved = true;
          setDragging(true);
        }
        if (d.moved) setRot(d.base + delta);
      } else if (railActive.current) {
        railAt(e.clientY);
      }
    };
    const onUp = () => {
      const d = wheelDrag.current;
      if (d) {
        wheelDrag.current = null;
        if (d.moved) {
          const at = d.base + d.delta;
          justDragged.current = true;
          window.setTimeout(() => (justDragged.current = false), 0);
          setDragging(false);
          tapHaptic();
          setMonth(Math.round((-at - 15) / 30), at);
        }
      }
      if (railActive.current) {
        railActive.current = false;
        window.clearTimeout(scrubTimer);
        scrubTimer = window.setTimeout(() => setScrub(false), 250);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.clearTimeout(scrubTimer);
    };
    // Les gestionnaires lisent l'état par des refs : un seul abonnement suffit.
  }, []);

  /* --- Notice d'un saint --- */

  const openSaint = (s: CalendarSaint) => {
    tapHaptic();
    setCur(s.id);
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

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const pickMode = (m: Mode) => {
    if (m === mode) return;
    tapHaptic();
    setMode(m);
  };

  const pickCat = (c: string) => {
    tapHaptic();
    setCat(c);
  };

  const renderRow = (s: DatedSaint) => (
    <button key={s.id} type="button" className="ls-month-row" onClick={() => openSaint(s)}>
      <span className="ls-month-date">
        <span className="ls-month-day">{dayLabel(s.day)}</span>
        <span className="ls-month-mon">{MCOURT[s.month]}</span>
      </span>
      <span>
        <span className="ls-row-name">{s.name}</span>
        {qualLine(s) && <span className="ls-row-qual">{qualLine(s)}</span>}
        {s.patronage && <span className="ls-row-pat">Patron · {s.patronage}</span>}
      </span>
      <span className="ls-row-chevron" aria-hidden="true">
        ›
      </span>
    </button>
  );

  // Frise masquée (null) quand l'époque du saint n'est pas connue.
  const barW = current.year == null ? null : sheetOpen ? `${((current.year / 2000) * 100).toFixed(1)}%` : '0%';

  return (
    <IonPage className="ls-page">
      <button
        ref={backRef}
        type="button"
        className="ls-back"
        onClick={() => {
          tapHaptic();
          navigate(-1);
        }}
      >
        <span className="ls-back-chevron" aria-hidden="true">
          ‹
        </span>
        Église
      </button>

      <div ref={scrollRef} className="ls-scroll">
        {/* --- Prochaine fête --- */}
        <div ref={heroRef} className="ls-hero">
          <div className="ls-stars" aria-hidden="true">
            {STARS.map((s, i) => (
              <span
                key={i}
                className="ls-star"
                style={{
                  left: `${s.left.toFixed(1)}%`,
                  top: `${s.top.toFixed(1)}%`,
                  animationDuration: `${s.duration.toFixed(2)}s`,
                  animationDelay: `${s.delay.toFixed(2)}s`
                }}
              />
            ))}
          </div>

          <button
            ref={haloRef}
            type="button"
            data-in=""
            className="ls-halo"
            aria-label={`Lire la notice : ${nextSaint.name}`}
            onClick={() => openSaint(nextSaint)}
          >
            <span className="ls-halo-glow" />
            <span className="ls-halo-rays" />
            <span className="ls-halo-ticks" />
            <span className="ls-halo-ring" />
            <span className="ls-halo-core">
              <span>{initial(nextSaint.name)}</span>
            </span>
          </button>
          <p data-in="" className="ls-hero-kicker">
            <span className="ls-ping" aria-hidden="true" />
            {nextKicker}
          </p>
          <h1 data-in="" className="ls-hero-name">
            {nextSaint.name}
          </h1>
          <p data-in="" className="ls-hero-qual">
            {nextSaint.qual}
          </p>
          <button data-in="" type="button" className="ls-hero-btn" onClick={() => openSaint(nextSaint)}>
            Lire la notice <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* --- Recherche, mode, catégories --- */}
        <div ref={toolbarRef} className="ls-toolbar">
          <div className="ls-toolbar-top">
            <label className="ls-search">
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
                placeholder="Nom, patronage…"
                aria-label="Chercher un saint"
              />
            </label>
            <div className="ls-seg" role="tablist" aria-label="Affichage">
              <span className={`ls-seg-thumb${mode === 'az' ? ' is-right' : ''}`} aria-hidden="true" />
              {(
                [
                  ['year', 'Année'],
                  ['az', 'A – Z']
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={k === mode}
                  className={`ls-seg-btn${k === mode ? ' is-active' : ''}`}
                  onClick={() => pickMode(k)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="ls-cats">
            {SAINT_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={c === cat}
                className={`ls-cat${c === cat ? ' is-active' : ''}`}
                onClick={() => pickCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div ref={bodyRef}>
          {mode === 'year' ? (
            <div className="ls-year">
              <div className="ls-year-head">
                <p className="ls-kicker">La roue de l'année</p>
                <p className="ls-count">{plural(datedCount, 'saint')}</p>
              </div>

              <div ref={wheelBoxRef} className="ls-wheel-box">
                <span className="ls-wheel-pointer" aria-hidden="true" />
                <div
                  className={`ls-wheel${dragging ? ' is-dragging' : ''}`}
                  style={{ transform: `rotate(${rot}deg)` }}
                  onPointerDown={wheelDown}
                >
                  <span className="ls-wheel-face" />
                  <span className="ls-wheel-ticks" />
                  <span
                    className="ls-wheel-arc"
                    style={{
                      background: `conic-gradient(from ${month * 30}deg, rgba(181,137,46,0.22) 0deg 30deg, transparent 30deg 360deg)`
                    }}
                  />
                  <span className="ls-wheel-inner" />
                  {dayTicks.map((t) => {
                    const deg = t.month * 30 + ((t.day - 0.5) / DIM[t.month]) * 30;
                    const len = Math.min(TICK_MAX, TICK_BASE + (t.count - 1) * TICK_STEP);
                    return (
                      <span
                        key={`${t.month}-${t.day}`}
                        className={`ls-tick${t.month === month ? ' is-sel' : ''}`}
                        style={{ height: len, transform: `rotate(${deg}deg) translateY(${-(TICK_R0 + len)}px)` }}
                      />
                    );
                  })}
                  {MCOURT.map((short, k) => {
                    const a = ((k * 30 + 15) * Math.PI) / 180;
                    return (
                      <button
                        key={short}
                        type="button"
                        className={`ls-wheel-month${k === month ? ' is-current' : ''}`}
                        aria-label={MOIS[k]}
                        aria-pressed={k === month}
                        style={{ left: 160 + 95 * Math.sin(a), top: 160 - 95 * Math.cos(a), transform: `rotate(${-rot}deg)` }}
                        onClick={() => {
                          if (justDragged.current) return;
                          tapHaptic();
                          setMonth(k);
                        }}
                      >
                        {short}
                      </button>
                    );
                  })}
                </div>
                <div className="ls-wheel-center" aria-live="polite">
                  <div ref={monthRef}>
                    <p className="ls-wheel-name">{MOIS[month]}</p>
                    <p className="ls-wheel-count">{plural(monthSaints.length, 'fête')}</p>
                  </div>
                </div>
              </div>

              <div className="ls-wheel-nav">
                <button
                  type="button"
                  className="ls-round ls-round--outline"
                  aria-label="Mois précédent"
                  onClick={() => {
                    tapHaptic();
                    setMonth(month - 1);
                  }}
                >
                  ←
                </button>
                <p className="ls-wheel-hint">Tourne la roue</p>
                <button
                  type="button"
                  className="ls-round ls-round--dark"
                  aria-label="Mois suivant"
                  onClick={() => {
                    tapHaptic();
                    setMonth(month + 1);
                  }}
                >
                  →
                </button>
              </div>

              <div ref={listRef} className="ls-month-list">
                {monthSaints.map(renderRow)}
                {monthSaints.length === 0 && <p className="ls-empty">Aucun saint ce mois-ci pour cette recherche.</p>}
              </div>
            </div>
          ) : (
            <div ref={azRef} className="ls-az">
              {groups.map((g) => (
                <section key={g.label} className="ls-az-group">
                  <h2 data-letter={g.label} className="ls-az-letter">
                    <span>{g.label}</span>
                    <span className="ls-az-rule" aria-hidden="true" />
                  </h2>
                  {g.saints.map((s) => (
                    <button key={s.id} type="button" className="ls-az-row" onClick={() => openSaint(s)}>
                      <span>
                        <span className="ls-row-name">{s.name}</span>
                        {qualLine(s) && <span className="ls-row-qual">{qualLine(s)}</span>}
                      </span>
                      <span className="ls-az-date">{isDated(s) && `${dayLabel(s.day)} ${MCOURT[s.month]}`}</span>
                    </button>
                  ))}
                </section>
              ))}
              {groups.length === 0 && (
                <div className="ls-az-empty">
                  <p className="ls-az-empty-title">Aucun saint trouvé</p>
                  <p className="ls-az-empty-text">Essaie un autre nom ou un autre patronage.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="ls-footer">
          Martyrologe romain · fêtes du calendrier général
          <br />
          Liste complétée d'après Wikipédia (CC BY-SA)
        </p>
      </div>

      {mode === 'az' && (
        <>
          <div
            ref={railRef}
            className="ls-rail"
            style={{ opacity: groups.length ? 1 : 0 }}
            aria-hidden="true"
            onPointerDown={(e) => {
              railActive.current = true;
              railAt(e.clientY);
            }}
          >
            {groups.map((g) => (
              <span key={g.label} className={g.label === bubble && scrub ? 'is-current' : undefined}>
                {g.label}
              </span>
            ))}
          </div>
          <div className={`ls-bubble${scrub ? ' is-visible' : ''}`} aria-hidden="true">
            {bubble}
          </div>
        </>
      )}

      {/* --- Notice --- */}
      <div className={`ls-sheet-layer${sheetOpen ? ' is-open' : ''}`} aria-hidden={!sheetOpen}>
        <div className="ls-sheet-scrim" onClick={() => setSheetOpen(false)} />
        <div className="ls-sheet" role="dialog" aria-modal="true" aria-label={current.name}>
          <button type="button" className="ls-sheet-handle" aria-label="Fermer" onClick={() => setSheetOpen(false)}>
            <span />
          </button>
          <div ref={sheetBodyRef} className="ls-sheet-body">
            <div className="ls-medal" aria-hidden="true">
              <span className="ls-medal-ticks" />
              <span className="ls-medal-ring" />
              <span className="ls-medal-core">{initial(current.name)}</span>
            </div>
            <p className="ls-sheet-cat">{current.cat}</p>
            <h2 className="ls-sheet-name">{current.name}</h2>
            {current.qual && <p className="ls-sheet-qual">{current.qual}</p>}

            <div className="ls-facts">
              <div className="ls-fact">
                <p className="ls-fact-label">Fête</p>
                {isDated(current) ? (
                  <>
                    <p className="ls-fact-value ls-fact-value--feast">{feastLabel(current)}</p>
                    <p className="ls-fact-sub">{untilLabel(current)}</p>
                  </>
                ) : (
                  <p className="ls-fact-value ls-fact-value--unknown">Non précisée</p>
                )}
              </div>
              <div className="ls-fact">
                <p className="ls-fact-label">Vie</p>
                {current.dates ? (
                  <p className="ls-fact-value">{current.dates}</p>
                ) : (
                  <p className="ls-fact-value ls-fact-value--unknown">Non précisée</p>
                )}
              </div>
            </div>

            {current.patronage && (
              <div className="ls-patron">
                <p className="ls-fact-label">Patron de</p>
                <p className="ls-patron-value">{current.patronage}</p>
              </div>
            )}

            {barW && (
              <div className="ls-history">
                <p className="ls-fact-label">Dans l'histoire de l'Église</p>
                <div className="ls-history-bar">
                  <span className="ls-history-track" />
                  <span className="ls-history-fill" style={{ width: barW }} />
                  <span className="ls-history-dot" style={{ left: barW }} />
                  {ERAS.map((y, j) => (
                    <span
                      key={y}
                      className="ls-history-era"
                      style={{
                        left: `${(y / 2000) * 100}%`,
                        transform: j === 0 ? 'none' : j === ERAS.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)'
                      }}
                    >
                      {y === 0 ? 'an 0' : y}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="ls-sheet-nav">
              <button type="button" className="ls-sheet-prev" onClick={() => openSaint(prevInSequence)}>
                <span className="ls-sheet-nav-label">{isDated(current) ? '← Fête précédente' : '← Précédent'}</span>
                <span className="ls-sheet-nav-name">{prevInSequence.name}</span>
              </button>
              <button type="button" className="ls-sheet-next" onClick={() => openSaint(nextInSequence)}>
                <span className="ls-sheet-nav-label">{isDated(current) ? 'Fête suivante →' : 'Suivant →'}</span>
                <span className="ls-sheet-nav-name">{nextInSequence.name}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </IonPage>
  );
};

export default Saints;
