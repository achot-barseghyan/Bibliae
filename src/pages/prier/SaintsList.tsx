import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useRemoteSaints } from '../../hooks/content/useRemoteSaints';
import { ChevronRightIcon } from '../../components/nav/icons';
import WorldButton from '../../components/nav/WorldButton';
import { tapHaptic } from '../../utils/haptics';
import NightStars from '../bible/NightStars';
import { RISE_IN, stagger, useBibleReducedMotion, useRevealOnce } from '../bible/bibleMotion';
import PrierHeroBar from './PrierHeroBar';
import { useOpenSearch } from '../accueil/searchContext';
import './SaintsList.css';

const SaintsList: React.FC = () => {
  const navigate = useNavigate();
  const openSearch = useOpenSearch();
  const categories = useRemoteSaints();
  // Domaine affiché (null = tous).
  const [filter, setFilter] = useState<string | null>(null);
  const reduceMotion = useBibleReducedMotion();
  const pageRef = useRef<HTMLDivElement>(null);
  const total = categories.reduce((n, c) => n + c.items.length, 0);
  const shown = filter ? categories.filter((c) => c.key === filter) : categories;

  // À l'ouverture puis à chaque changement de domaine.
  useRevealOnce(filter ?? 'all', () => {
    if (reduceMotion || !pageRef.current) return;
    stagger(pageRef.current.querySelectorAll('[data-s4]'), RISE_IN, { duration: 850, delay: 120, step: 30, maxStagger: 900 });
  });

  const chips: Array<{ key: string | null; label: string; count: number }> = [
    { key: null, label: 'Toutes', count: total },
    ...categories.map((c) => ({ key: c.key, label: c.label, count: c.items.length }))
  ];

  return (
    <IonPage>
      <IonContent fullscreen className="prier-page">
        <div ref={pageRef}>
          <div className="prier-hero saints-list-hero">
            <NightStars count={24} seed={3} />
            <span className="prier-hero-numeral" aria-hidden="true">
              II
            </span>
            <PrierHeroBar backLabel="Prier" onBack={() => navigate(-1)} onSearch={() => openSearch('saints')} />
            <h1 className="prier-hero-title">Demander l'intercession des saints</h1>
            <p className="prier-hero-text">
              Dis ce que tu traverses. À chaque situation, un saint qui l'a connue, et une prière pour la lui confier.
            </p>
          </div>

          <div className="saints-list-filters">
            <div className="saints-list-chips" role="tablist" aria-label="Domaines">
              {chips.map((chip) => {
                const isActive = chip.key === filter;
                return (
                  <button
                    key={chip.key ?? 'all'}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`saints-list-chip${isActive ? ' is-active' : ''}`}
                    onClick={() => {
                      tapHaptic();
                      setFilter(chip.key);
                    }}
                  >
                    <span className="saints-list-chip-label">{chip.label}</span>
                    <span className="saints-list-chip-count">{chip.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="saints-list-body">
            {shown.map((category) => (
              <section key={category.key}>
                <h2 className="saints-list-group" data-s4>
                  <span>{category.label}</span>
                  <span className="saints-list-group-rule" />
                </h2>
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="saints-list-row"
                    data-s4
                    onClick={() => {
                      tapHaptic();
                      navigate(`/prier/saints/${item.id}`);
                    }}
                  >
                    <span className="saints-list-row-body">
                      <span className="saints-list-row-title">{item.situation}</span>
                      <span className="saints-list-row-saint">
                        <span className="prier-glyph" aria-hidden="true">
                          {'✦︎'}
                        </span>
                        {item.saintName}
                      </span>
                    </span>
                    <ChevronRightIcon size={13} className="prier-chevron" />
                  </button>
                ))}
              </section>
            ))}
          </div>
        </div>

        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default SaintsList;
