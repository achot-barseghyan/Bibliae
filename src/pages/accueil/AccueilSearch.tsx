import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useFigures } from '../../hooks/useFigures';
import { useVerseSearch } from '../../hooks/useVerseSearch';
import { tapHaptic } from '../../utils/haptics';
import { LatinCrossIcon } from '../../components/nav/icons';
import {
  SEARCH_SCOPES,
  buildIndex,
  cut,
  parseReference,
  searchIndex,
  verseHits,
  type SearchHit
} from './searchIndex';
import './AccueilSearch.css';

// Recherche plein écran de l'accueil (maquette « Accueil v2 ») : en-tête nuit
// (champ + portées), récentes et suggestions quand le champ est vide, puis
// meilleur résultat et résultats groupés par type, correspondance surlignée.

const RECENTS_KEY = 'bibliae:recherches-recentes';
const RECENTS_MAX = 5;
/** Lignes par groupe quand on cherche « partout ». */
const GROUP_LIMIT = 3;

const TRIES: [string, number][] = [
  ['Moïse', 0],
  ['Jn 3, 16', 1],
  ['je suis', 1],
  ['Magnificat', 3],
  ["Jeanne d'Arc", 4],
  ['Pentecôte', 2]
];

const PLACEHOLDER = 'Une figure, un lieu, un verset…';

// Récentes : simple confort, propre à l'appareil.
function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string').slice(0, RECENTS_MAX) : [];
  } catch {
    return [];
  }
}

function saveRecents(list: string[]) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(list));
  } catch {
    /* stockage indisponible : les récentes ne sont pas gardées */
  }
}

// Étoiles de l'en-tête : positions fixes (générateur déterministe).
const STARS = (() => {
  let s = 5;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 32 }, () => ({
    left: `${(rnd() * 100).toFixed(1)}%`,
    top: `${(rnd() * 100).toFixed(1)}%`,
    size: rnd() > 0.75 ? 3 : 2,
    duration: `${(2 + rnd() * 3).toFixed(2)}s`,
    delay: `${(-rnd() * 4).toFixed(2)}s`
  }));
})();

interface AccueilSearchProps {
  open: boolean;
  /** Portée choisie sur l'accueil (-1 : partout), reprise à l'ouverture. */
  initialScope: number;
  onClose: () => void;
}

const Highlight: React.FC<{ text: string; at: number; n: number; className: string }> = ({ text, at, n, className }) => {
  const [a, b, c] = cut(text, at, n);
  return (
    <>
      {a}
      {b && <span className={className}>{b}</span>}
      {c}
    </>
  );
};

const AccueilSearch: React.FC<AccueilSearchProps> = ({ open, initialScope, onClose }) => {
  const navigate = useNavigate();
  const { figures } = useFigures();
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const [scope, setScope] = useState(-1);
  const [recents, setRecents] = useState<string[]>(loadRecents);

  // À l'ouverture : portée de l'accueil, champ prêt à taper, liste en haut.
  useEffect(() => {
    if (!open) return;
    setScope(initialScope);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 120);
    return () => window.clearTimeout(t);
  }, [open, initialScope]);

  // Bouton retour Android : ferme la recherche plutôt que de quitter l'accueil.
  useEffect(() => {
    if (!open) return;
    const onBack = (ev: Event) => {
      (ev as CustomEvent<{ register: (priority: number, handler: () => void) => void }>).detail.register(100, onClose);
    };
    document.addEventListener('ionBackButton', onBack);
    return () => document.removeEventListener('ionBackButton', onBack);
  }, [open, onClose]);

  const index = useMemo(() => buildIndex(figures), [figures]);
  const trimmed = q.trim();
  const wantsVerses = scope < 0 || scope === 1;
  const { results: verseRows, isLoading: versesLoading } = useVerseSearch(wantsVerses ? trimmed : '');

  const hits = useMemo(() => {
    if (!trimmed) return [] as SearchHit[];
    const list = searchIndex(index, trimmed, scope);
    if (wantsVerses) {
      const ref = parseReference(trimmed);
      if (ref) list.unshift(ref);
      list.push(...verseHits(verseRows, trimmed));
    }
    return list;
  }, [index, trimmed, scope, wantsVerses, verseRows]);

  const remember = (label: string) => {
    setRecents((prev) => {
      const next = [label, ...prev.filter((r) => r !== label)].slice(0, RECENTS_MAX);
      saveRecents(next);
      return next;
    });
  };

  const removeRecent = (label: string) => {
    setRecents((prev) => {
      const next = prev.filter((r) => r !== label);
      saveRecents(next);
      return next;
    });
  };

  const openHit = (hit: SearchHit) => {
    tapHaptic();
    remember(trimmed || hit.title);
    inputRef.current?.blur();
    onClose();
    navigate(hit.path, hit.state ? { state: hit.state } : undefined);
  };

  const close = () => {
    inputRef.current?.blur();
    onClose();
  };

  // Meilleur résultat : seulement s'il commence le titre ou un de ses mots.
  const rest = hits.slice();
  const top = rest.length > 0 && rest[0].score <= 1 ? rest.shift()! : null;
  const groups = useMemo(() => {
    const by = new Map<number, SearchHit[]>();
    for (const h of rest) by.set(h.scope, [...(by.get(h.scope) ?? []), h]);
    return [...by.entries()].sort((a, b) => a[1][0].score - b[1][0].score || a[0] - b[0]);
    // `rest` dérive de `hits`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hits]);

  const total = hits.length;
  const searching = wantsVerses && versesLoading;
  const scopeName = scope >= 0 ? SEARCH_SCOPES[scope].label : 'Tout';
  const placeholder = scope >= 0 ? SEARCH_SCOPES[scope].examples[0] : PLACEHOLDER;

  // Rendu dans le cadre de l'app (.app-shell) : au-dessus de la barre rosace,
  // hors du contexte d'empilement de la page Ionic, mais toujours dans le
  // cadre « téléphone » sur grand écran (voir theme/desktopFrame.css).
  return createPortal(
    <div className={`acs${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Rechercher" aria-hidden={!open} inert={!open}>
      <div className="acs-head">
        <div className="acs-stars" aria-hidden="true">
          {STARS.map((s, i) => (
            <span
              key={i}
              style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDuration: s.duration, animationDelay: s.delay }}
            />
          ))}
        </div>
        <span className="acs-glow" aria-hidden="true" />
        <span className="acs-rosace" aria-hidden="true" />

        <div className="acs-head-top">
          <div className="acs-kicker">
            <LatinCrossIcon size={14} className="acs-kicker-cross" />
            Rechercher
          </div>
          <button type="button" className="acs-cancel" onClick={close} tabIndex={open ? 0 : -1}>
            Annuler
          </button>
        </div>

        <label className="acs-field">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.6" cy="6.6" r="5.4" stroke="currentColor" strokeWidth="1.2" />
            <path d="M10.6 10.6L15 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="acs-input"
            value={q}
            placeholder={placeholder}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
              if (e.key === 'Enter' && trimmed) {
                remember(trimmed);
                inputRef.current?.blur();
              }
            }}
            enterKeyHint="search"
            aria-label="Rechercher une figure, un verset, un événement, une prière ou un saint"
            tabIndex={open ? 0 : -1}
          />
          {q && (
            <button
              type="button"
              className="acs-clear"
              onClick={() => {
                setQ('');
                inputRef.current?.focus();
              }}
              aria-label="Effacer"
            >
              ×
            </button>
          )}
        </label>

        <div className="acs-scopes">
          {[{ label: 'Tout', glyph: null }, ...SEARCH_SCOPES].map((s, j) => {
            const i = j - 1;
            return (
              <button
                key={s.label}
                type="button"
                className={`acs-scope${i === scope ? ' is-active' : ''}`}
                aria-pressed={i === scope}
                onClick={() => setScope(i)}
                tabIndex={open ? 0 : -1}
              >
                <span className="acs-scope-glyph" aria-hidden="true">
                  {s.glyph ?? <LatinCrossIcon size={11} />}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* La clé rejoue l'apparition en cascade à chaque saisie ou portée. */}
      <div ref={bodyRef} className="acs-body">
        <div key={open ? `${scope}|${trimmed}` : 'closed'} className="acs-anim">
          {!trimmed && (
            <>
              {recents.length > 0 && (
                <section className="acs-res" style={{ '--r': 0 } as React.CSSProperties}>
                  <div className="acs-rule">
                    <span className="acs-rule-label">Récentes</span>
                    <span className="acs-rule-line" />
                    <button
                      type="button"
                      className="acs-rule-action"
                      onClick={() => {
                        setRecents([]);
                        saveRecents([]);
                      }}
                    >
                      Effacer
                    </button>
                  </div>
                  <div className="acs-recents">
                    {recents.map((label) => (
                      <div key={label} className="acs-recent">
                        <button type="button" className="acs-recent-main" onClick={() => setQ(label)}>
                          <span className="acs-recent-icon" aria-hidden="true">
                            ↺
                          </span>
                          <span className="acs-recent-label">{label}</span>
                        </button>
                        <button
                          type="button"
                          className="acs-recent-x"
                          onClick={() => removeRecent(label)}
                          aria-label={`Retirer « ${label} »`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <section className="acs-res acs-tries-wrap" style={{ '--r': recents.length > 0 ? 1 : 0 } as React.CSSProperties}>
                <div className="acs-rule">
                  <span className="acs-rule-label">Essayer</span>
                  <span className="acs-rule-line" />
                </div>
                <div className="acs-tries">
                  {TRIES.map(([label, t]) => (
                    <button key={label} type="button" className="acs-try" onClick={() => setQ(label)}>
                      <span className="acs-try-glyph" aria-hidden="true">
                        {SEARCH_SCOPES[t].glyph}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {trimmed && total > 0 && (
            <>
              <p className="acs-count acs-res" style={{ '--r': 0 } as React.CSSProperties} aria-live="polite">
                {total} résultat{total > 1 ? 's' : ''} · {scopeName}
                {searching ? ' · versets…' : ''}
              </p>

              {top && (
                <button
                  type="button"
                  className="acs-top acs-res"
                  style={{ '--r': 1 } as React.CSSProperties}
                  onClick={() => openHit(top)}
                >
                  <span className="acs-top-glow" aria-hidden="true" />
                  <span className="acs-top-rays" aria-hidden="true" />
                  <span className="acs-top-glyph" aria-hidden="true">
                    {SEARCH_SCOPES[top.scope].glyph}
                  </span>
                  <span className="acs-top-kicker">Meilleur résultat · {SEARCH_SCOPES[top.scope].type}</span>
                  <span className="acs-top-title">
                    <Highlight text={top.title} at={top.ti} n={top.n} className="acs-top-hl" />
                  </span>
                  <span className="acs-top-sub">
                    <Highlight text={top.sub} at={top.si} n={top.n} className="acs-top-hl-sub" />
                  </span>
                  <span className="acs-top-foot">
                    <span>{SEARCH_SCOPES[top.scope].cta}</span>
                    <span className="acs-top-chev" aria-hidden="true">
                      ›
                    </span>
                  </span>
                </button>
              )}

              {groups.map(([t, list], gi) => {
                const limit = scope >= 0 ? Infinity : GROUP_LIMIT;
                const def = SEARCH_SCOPES[t];
                return (
                  <section key={t} className="acs-group acs-res" style={{ '--r': gi + 2 } as React.CSSProperties}>
                    <div className="acs-rule">
                      <span className="acs-rule-glyph" aria-hidden="true">
                        {def.glyph}
                      </span>
                      <span className="acs-rule-label">{def.label}</span>
                      <span className="acs-rule-count">{list.length}</span>
                      <span className="acs-rule-line" />
                    </div>
                    <div className="acs-rows">
                      {list.slice(0, limit).map((h, i) => (
                        <button key={`${h.path}-${h.title}-${i}`} type="button" className="acs-row" onClick={() => openHit(h)}>
                          <span className="acs-row-glyph" aria-hidden="true">
                            {def.glyph}
                          </span>
                          <span className="acs-row-text">
                            <span className="acs-row-title">
                              <Highlight text={h.title} at={h.ti} n={h.n} className="acs-hl" />
                            </span>
                            {h.sub && (
                              <span className="acs-row-sub">
                                <Highlight text={h.sub} at={h.si} n={h.n} className="acs-hl acs-hl--sub" />
                              </span>
                            )}
                          </span>
                          <span className="acs-row-chev" aria-hidden="true">
                            ›
                          </span>
                        </button>
                      ))}
                    </div>
                    {list.length > limit && (
                      <button type="button" className="acs-more" onClick={() => setScope(t)}>
                        Voir les {list.length} {def.label.toLowerCase()}
                        <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </section>
                );
              })}
            </>
          )}

          {trimmed && total === 0 && (
            <div className="acs-none acs-res" style={{ '--r': 0 } as React.CSSProperties}>
              <div className="acs-none-mark" aria-hidden="true">
                <span className="acs-none-glow" />
                <span className="acs-none-rays" />
                <span className="acs-none-cross">
                  <LatinCrossIcon size={30} />
                </span>
              </div>
              {searching ? (
                <p className="acs-none-title">Recherche…</p>
              ) : (
                <>
                  <p className="acs-none-title">Aucun résultat</p>
                  <p className="acs-none-for">
                    pour « {trimmed} »{scope >= 0 ? ` dans ${SEARCH_SCOPES[scope].label.toLowerCase()}` : ''}
                  </p>
                  <p className="acs-none-hint">Essayez un nom, un événement ou une référence comme Jn 3, 16.</p>
                  {scope >= 0 && (
                    <button type="button" className="acs-widen" onClick={() => setScope(-1)}>
                      Chercher partout
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.querySelector('.app-shell') ?? document.body
  );
};

export default AccueilSearch;
