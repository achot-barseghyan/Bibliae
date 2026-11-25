import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { MASS_MOMENTS, MASS_PARTS, MASS_PRAYERS, type MassPart } from '../../data/messe';
import { ChevronRightIcon } from '../../components/nav/icons';
import WorldButton from '../../components/nav/WorldButton';
import { tapHaptic } from '../../utils/haptics';
import { RISE_IN, stagger, useBibleReducedMotion, useRevealOnce } from '../bible/bibleMotion';
import PrierHeroBar from './PrierHeroBar';
import { useOpenSearch } from '../accueil/searchContext';
import './SaintsList.css';
import './Messe.css';

type Tab = 'prieres' | 'guide';

const partLabel = (part: MassPart) => `Temps ${MASS_PARTS.indexOf(part) + 1} / ${MASS_PARTS.length}`;

/** Les prières de la messe (section III) : les prières de l'assemblée, ou le déroulé complet. */
const MassList: React.FC = () => {
  const navigate = useNavigate();
  const openSearch = useOpenSearch();
  const [tab, setTab] = useState<Tab>('prieres');
  const [part, setPart] = useState<MassPart | null>(null);
  const reduceMotion = useBibleReducedMotion();
  const pageRef = useRef<HTMLDivElement>(null);

  useRevealOnce(`${tab}:${part ?? 'all'}`, () => {
    if (reduceMotion || !pageRef.current) return;
    stagger(pageRef.current.querySelectorAll('[data-s6]'), RISE_IN, { duration: 850, delay: 120, step: 30, maxStagger: 900 });
  });

  const steps = MASS_MOMENTS.map((moment, index) => ({ moment, index })).filter(({ moment }) => !part || moment.part === part);
  const chips: Array<{ key: MassPart | null; label: string; count: number }> = [
    { key: null, label: 'Toute la messe', count: MASS_MOMENTS.length },
    ...MASS_PARTS.map((p) => ({ key: p, label: p, count: MASS_MOMENTS.filter((m) => m.part === p).length }))
  ];

  return (
    <IonPage>
      <IonContent fullscreen className="prier-page">
        <div ref={pageRef}>
          <div className="prier-hero messe-list-hero">
            <span className="prier-hero-numeral messe-list-numeral" aria-hidden="true">
              III
            </span>
            <span className="messe-list-shine" aria-hidden="true" />
            <PrierHeroBar backLabel="Prier" onBack={() => navigate(-1)} onSearch={() => openSearch(null)} />
            <h1 className="prier-hero-title messe-list-title" data-s6>
              Les prières de la messe
            </h1>
            <p className="prier-hero-text messe-list-text" data-s6>
              Tout ce que l'assemblée dit, chante et fait, dans l'ordre de la célébration. Pour ne plus jamais être
              perdu à la messe.
            </p>
          </div>

          <div className="messe-legend" data-s6>
            <p className="messe-legend-title">Comment lire ce guide</p>
            <dl className="messe-legend-grid">
              <dt className="messe-mark">{'℣︎'}</dt>
              <dd>Ce que dit le prêtre, ou le lecteur</dd>
              <dt className="messe-mark">{'℟︎'}</dt>
              <dd>
                <b>Ce que répond l'assemblée</b>, donc toi
              </dd>
              <dt className="messe-mark messe-mark--all">{'✚︎'}</dt>
              <dd>
                <b>Ce que tout le monde dit ensemble</b>
              </dd>
            </dl>
          </div>

          <div className="messe-list-bar">
            <div className="messe-tabs" role="tablist" aria-label="Affichage">
              <span className={`messe-tabs-thumb${tab === 'guide' ? ' is-right' : ''}`} aria-hidden="true" />
              {(
                [
                  ['prieres', 'Les prières', MASS_PRAYERS.length],
                  ['guide', 'Guide complet', MASS_MOMENTS.length]
                ] as const
              ).map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  className={`messe-tab${tab === key ? ' is-active' : ''}`}
                  onClick={() => {
                    tapHaptic();
                    setTab(key);
                  }}
                >
                  <span className="messe-tab-label">{label}</span>
                  <span className="messe-tab-count">{count}</span>
                </button>
              ))}
            </div>
            {tab === 'guide' ? (
              <div className="saints-list-chips" role="tablist" aria-label="Temps de la messe">
                {chips.map((chip) => {
                  const isActive = chip.key === part;
                  return (
                    <button
                      key={chip.key ?? 'all'}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`saints-list-chip${isActive ? ' is-active' : ''}`}
                      onClick={() => {
                        tapHaptic();
                        setPart(chip.key);
                      }}
                    >
                      <span className="saints-list-chip-label">{chip.label}</span>
                      <span className="saints-list-chip-count">{chip.count}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="messe-list-bar-gap" />
            )}
          </div>

          {tab === 'prieres' ? (
            <div className="messe-list-body">
              {MASS_PRAYERS.map((prayer, k) => (
                <div key={prayer.name}>
                  {(k === 0 || MASS_PRAYERS[k - 1].part !== prayer.part) && (
                    <h2 className="messe-part" data-s6>
                      <span className="messe-part-num">{partLabel(prayer.part)}</span>
                      <span className="messe-part-row">
                        <span className="messe-part-name">{prayer.part}</span>
                        <span className="saints-list-group-rule" />
                      </span>
                    </h2>
                  )}
                  <article className="messe-prayer-card" data-s6>
                    <h3 className="messe-prayer-name">{prayer.name}</h3>
                    {prayer.subtitle && <p className="messe-prayer-sub">{prayer.subtitle}</p>}
                    <span className="messe-prayer-rule" aria-hidden="true" />
                    <p className="messe-prayer-text">{prayer.text}</p>
                  </article>
                </div>
              ))}
            </div>
          ) : (
            <div className="messe-list-body">
              {steps.map(({ moment, index }, k) => (
                <div key={moment.id}>
                  {(k === 0 || steps[k - 1].moment.part !== moment.part) && (
                    <h2 className="messe-part" data-s6>
                      <span className="messe-part-num">{partLabel(moment.part)}</span>
                      <span className="messe-part-row">
                        <span className="messe-part-name">{moment.part}</span>
                        <span className="saints-list-group-rule" />
                      </span>
                    </h2>
                  )}
                  <button
                    type="button"
                    className="messe-step"
                    data-s6
                    onClick={() => {
                      tapHaptic();
                      navigate(`/prier/messe/${moment.id}`);
                    }}
                  >
                    <span className="messe-step-num">{index + 1}</span>
                    <span className="messe-step-body">
                      <span className="messe-step-name">{moment.name}</span>
                      <span className="messe-step-meta">
                        <span className="messe-step-posture">{moment.posture}</span>
                        {moment.essential && <span className="messe-step-key">À savoir par cœur</span>}
                      </span>
                    </span>
                    <ChevronRightIcon size={12} className="prier-chevron" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default MassList;
