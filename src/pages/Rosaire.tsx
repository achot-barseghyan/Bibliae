import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { buildSequence, mysterySetForToday, MYSTERY_ORDER, type BeadImageKey } from '../data/rosary';
import { useRemoteRosary } from '../hooks/content/useRemoteRosary';
import { useRosaryProgress } from '../hooks/useRosaryProgress';
import { useAccessibility } from '../hooks/useAccessibility';
import { ChevronUpIcon, ChevronDownIcon, RefreshIcon } from '../components/nav/icons';
import WorldButton from '../components/nav/WorldButton';
import { tapHaptic } from '../utils/haptics';
import { BEAD_IMAGES } from './rosaire/beadImages';
import RosaryConfigSheet from './rosaire/RosaryConfigSheet';
import { rosaryMinutes, rosaryStepContent } from './rosaire/rosaryStep';
import VersePreviewSheet from './figures/VersePreviewSheet';
import type { ScriptureRef } from '../data/figureDetails';
import './bible/bibleTheme.css';
import './Rosaire.css';

// Assez de grains pour couvrir toute la hauteur de l'écran : le rail est
// fixe (position: fixed), centré sur l'écran, et ne bouge donc jamais avec
// la hauteur variable du texte de prière au-dessus.
const RAIL_RADIUS = 9;
const SLOT_SPACING = 46;
// Longueur de chaîne ajoutée là où la séquence marque un espace (gapBefore).
const GAP_SPACING = 30;
const RAIL_WIDTH = 110; // doit correspondre à la largeur de .rosaire-rail
// Décalage horizontal doux et continu (basé sur la position le long de la
// chaîne, pas sur la position dans la fenêtre visible) pour que le chapelet
// garde une allure de vrai collier qui ondule légèrement, sans que la courbe
// ne « saute » quand on avance d'un grain. Pas sur l'index : les étapes sans
// grain feraient avancer la vague sans grain dessiné, et le fil tirerait un
// trait droit entre deux grains éloignés dans la vague. Un demi-radian par
// espacement de grain courant.
const curveOffset = (chainPosition: number) => Math.sin((chainPosition / SLOT_SPACING) * 0.5) * 18;

// Le crucifix et le médaillon sont de vraies pièces du chapelet, nettement
// plus grandes que les grains courants, comme sur un chapelet réel.
function beadSize(bead: BeadImageKey | null, distance: number): number {
  if (bead === null) return 0;
  if (bead === 'crucifix') return Math.max(32, 130 - distance * 7);
  if (bead === 'medaille') return Math.max(18, 50 - distance * 3);
  return Math.max(14, 32 - distance * 2);
}

const TEXT_EASE = [0.2, 0.7, 0.2, 1] as const;

/** Réglages du chapelet (icône « curseurs » de la maquette). */
const SlidersIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
    <path d="M1.5 4h8M12.5 4h2M1.5 8h2.5M7 8h7.5M1.5 12h9M13.5 12h1" />
    <circle cx="11" cy="4" r="1.5" />
    <circle cx="5.5" cy="8" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);

const Rosaire: React.FC = () => {
  const { mysterySet, stepIndex, config, setStepIndex, setMysterySet, setConfig } = useRosaryProgress();
  const { settings } = useAccessibility();
  const { mysterySets, prayers } = useRemoteRosary();
  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [meditationRef, setMeditationRef] = useState<ScriptureRef | null>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);

  const sequence = useMemo(() => buildSequence(config), [config]);
  // Position de chaque grain le long de la chaîne, espaces compris.
  const chainPositions = useMemo(() => {
    const positions: number[] = [];
    sequence.forEach((bead, i) => {
      if (i === 0) {
        positions.push(0);
        return;
      }
      // Les étapes sans grain qui se suivent (Gloire au Père, Fatima,
      // annonce du mystère suivant…) se partagent un seul espace de chaîne,
      // réparties à égale distance entre les deux grains qui l'encadrent.
      const onBareChain = bead.bead === null || sequence[i - 1].bead === null;
      let step = SLOT_SPACING + (bead.gapBefore ? GAP_SPACING : 0);
      if (onBareChain) {
        let start = i - 1;
        while (start > 0 && sequence[start].bead === null) start -= 1;
        let end = i;
        while (end < sequence.length - 1 && sequence[end].bead === null) end += 1;
        // Sans grain après (fin du chapelet), on compte un grain virtuel.
        step = (SLOT_SPACING + GAP_SPACING) / (end - start + (sequence[end].bead === null ? 1 : 0));
      }
      positions.push(positions[i - 1] + step);
    });
    return positions;
  }, [sequence]);
  const total = sequence.length;
  const clampedIndex = Math.min(stepIndex, total - 1);
  const current = sequence[clampedIndex];
  const mysteryLabel = mysterySets[mysterySet];
  const content = rosaryStepContent(current, mysteryLabel, prayers, config);
  const todaySet = mysterySetForToday(new Date(), config.calendrier);
  const configSummary = `${total} étapes · ${rosaryMinutes(sequence, prayers)} min`;
  const openMeditation = (ref: ScriptureRef) => {
    tapHaptic();
    setMeditationRef(ref);
  };

  const goTo = (index: number) => {
    setStepIndex(Math.max(0, Math.min(total - 1, index)));
  };

  // Sens du dernier pas, pour faire arriver le texte d'en haut ou d'en bas.
  const previousIndexRef = useRef(clampedIndex);
  const direction = clampedIndex >= previousIndexRef.current ? 1 : -1;
  useEffect(() => {
    previousIndexRef.current = clampedIndex;
    contentRef.current?.scrollToTop(0);
  }, [clampedIndex, mysterySet]);

  // Le rail (fixe) ne passe pas sur le bandeau de nuit : il est rogné au bas
  // du bandeau, qui remonte avec le défilement, puis fondu sur 48 px.
  const heroRef = useRef<HTMLElement>(null);
  const [railTop, setRailTop] = useState(0);
  const updateRailTop = () => {
    const bottom = heroRef.current?.getBoundingClientRect().bottom ?? 0;
    setRailTop(Math.max(0, Math.round(bottom)));
  };
  useLayoutEffect(() => {
    updateRailTop();
    window.addEventListener('resize', updateRailTop);
    return () => window.removeEventListener('resize', updateRailTop);
  });
  const railMask = `linear-gradient(to bottom, transparent ${railTop}px, #000 ${railTop + 48}px)`;

  // Chaque bloc du texte arrive l'un après l'autre, en sortant du flou.
  const reveal = (order: number) =>
    settings.reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: -16 * direction, filter: 'blur(5px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { duration: 0.75, delay: order * 0.07, ease: TEXT_EASE }
        };

  // Framer Motion capture le pointeur pendant un pan, donc le pointerup final
  // (même loin du grain de départ) redéclenche un clic sur ce grain — sans
  // ce garde-fou, le clic ramènerait aussitôt à l'index de départ.
  const suppressClickRef = useRef(false);

  // Glisser vers le bas avance dans le chapelet, vers le haut recule.
  const handlePanEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.y > 60 || info.velocity.y > 400) {
      suppressClickRef.current = true;
      goTo(clampedIndex + 1);
    } else if (info.offset.y < -60 || info.velocity.y < -400) {
      suppressClickRef.current = true;
      goTo(clampedIndex - 1);
    }
  };

  const handleBeadClick = (index: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    goTo(index);
  };

  // Position, taille et opacité de chaque grain visible, calculées une
  // seule fois pour pouvoir aussi tracer le fil qui les relie (le fil a
  // besoin de connaître les deux extrémités).
  const beadSlots = [];
  for (let offset = -RAIL_RADIUS; offset <= RAIL_RADIUS; offset += 1) {
    const index = clampedIndex + offset;
    if (index < 0 || index >= total) {
      beadSlots.push(null);
      continue;
    }
    const distance = Math.abs(offset);
    beadSlots.push({
      index,
      bead: sequence[index],
      distance,
      size: beadSize(sequence[index].bead, distance),
      opacity: Math.max(0.12, 1 - (distance / RAIL_RADIUS) * 0.9),
      leftPercent: 50 + curveOffset(chainPositions[index]),
      // valeur soustraite à 50% pour obtenir le `top` réel du grain
      // (voir plus bas) ; positif = grain plus haut à l'écran.
      downPx: chainPositions[index] - chainPositions[clampedIndex]
    });
  }

  const threads: { key: string; top: string; left: string; length: number; angle: number; opacity: number }[] = [];
  // Les étapes sans grain (Gloire au Père, Salve Regina) ne coupent pas le
  // fil : il va droit du grain précédent au suivant, sans jonction visible.
  const threadSlots = beadSlots.filter((slot) => !slot || slot.bead.bead !== null);
  for (let i = 0; i < threadSlots.length - 1; i += 1) {
    const a = threadSlots[i];
    const b = threadSlots[i + 1];
    if (!a || !b) continue;
    const dx = ((b.leftPercent - a.leftPercent) / 100) * RAIL_WIDTH;
    const dy = a.downPx - b.downPx;
    threads.push({
      key: `${a.index}-${b.index}`,
      top: `calc(50% - ${(a.downPx + b.downPx) / 2}px)`,
      left: `${(a.leftPercent + b.leftPercent) / 2}%`,
      length: Math.sqrt(dx * dx + dy * dy),
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
      opacity: (a.opacity + b.opacity) / 2
    });
  }

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="rosaire-content"
        ref={contentRef}
        scrollEvents
        onIonScroll={updateRailTop}
      >
        <section className="rosaire-hero" ref={heroRef}>
          <div className="rosaire-hero-sky" aria-hidden="true">
            <span className="bible-rays rosaire-rays" />
          </div>
          <header className="rosaire-header">
            <button
              type="button"
              className="rosaire-reset"
              disabled={clampedIndex === 0}
              onClick={() => {
                tapHaptic();
                goTo(0);
              }}
              aria-label="Recommencer le chapelet"
            >
              <RefreshIcon size={14} />
              Recommencer
            </button>
            <button
              type="button"
              className="rosaire-settings"
              onClick={() => {
                tapHaptic();
                setIsPickerOpen(false);
                setIsConfigOpen(true);
              }}
              aria-label="Réglages du chapelet"
              aria-haspopup="dialog"
            >
              <SlidersIcon />
            </button>
          </header>

          <div className="rosaire-hero-text">
            <p className="rosaire-day">{todayLabel}</p>

            <div className="rosaire-sets">
              <button
                type="button"
                className="rosaire-mystery-set"
                onClick={() => setIsPickerOpen((open) => !open)}
                aria-expanded={isPickerOpen}
                aria-haspopup="listbox"
              >
                {mysteryLabel.label}
                <ChevronDownIcon
                  size={14}
                  className={`rosaire-mystery-set-chevron${isPickerOpen ? ' is-open' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isPickerOpen && (
                  <>
                    <div className="rosaire-sets-dismiss" onClick={() => setIsPickerOpen(false)} aria-hidden="true" />
                    <motion.div
                      className="rosaire-sets-menu"
                      role="listbox"
                      aria-label="Choisir la série de mystères"
                      initial={settings.reduceMotion ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={settings.reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: TEXT_EASE }}
                    >
                      {MYSTERY_ORDER.map((key) => (
                        <button
                          key={key}
                          type="button"
                          role="option"
                          aria-selected={key === mysterySet}
                          className={`rosaire-sets-row${key === mysterySet ? ' is-active' : ''}`}
                          onClick={() => {
                            tapHaptic();
                            if (key !== mysterySet) setMysterySet(key);
                            setIsPickerOpen(false);
                          }}
                        >
                          <span className="rosaire-sets-row-text">
                            <span className="rosaire-sets-row-name">{mysterySets[key].label}</span>
                            <span className="rosaire-sets-row-days">{mysterySets[key].days}</span>
                          </span>
                          {key === todaySet && <span className="rosaire-sets-row-today">Aujourd'hui</span>}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="rosaire-hero-progress">
              <span className="rosaire-hero-days">{mysteryLabel.days}</span>
              <span className="rosaire-hero-count">
                {clampedIndex + 1} / {total}
              </span>
            </div>
            <span className="rosaire-hero-track" aria-hidden="true">
              <span
                className="rosaire-hero-fill"
                style={{ transform: `scaleX(${(clampedIndex + 1) / total})` }}
              />
            </span>
          </div>
        </section>

        <div className="rosaire-layout">
          <div className="rosaire-text">
            <div key={`${mysterySet}-${clampedIndex}`}>
              <motion.p className="rosaire-eyebrow" {...reveal(0)}>
                {content.eyebrow}
              </motion.p>
              <motion.h1 className="rosaire-prayer-name" {...reveal(1)}>
                {content.title}
              </motion.h1>
              {content.mystery && (
                <motion.div className="rosaire-mystery-meta" {...reveal(2)}>
                  {content.mystery.ref && (
                    <button
                      type="button"
                      className="rosaire-mystery-ref"
                      onClick={() => content.mystery?.ref && openMeditation(content.mystery.ref)}
                      aria-label={`Méditer ${content.mystery.ref.display}`}
                    >
                      {content.mystery.ref.display}
                    </button>
                  )}
                  {content.mystery.fruit && (
                    <span className="rosaire-mystery-fruit">
                      <span className="rosaire-mystery-star" aria-hidden="true">{'✦︎'}</span>
                      {content.mystery.fruit}
                    </span>
                  )}
                </motion.div>
              )}
              <div className={`rosaire-paragraphs${content.source ? ' is-rappel' : ''}`}>
                {content.paragraphs.map((paragraph, i) => (
                  <motion.p className="rosaire-prayer-text" key={i} {...reveal(i + 3)}>
                    {paragraph}
                  </motion.p>
                ))}
              </div>
              {content.source && (
                <motion.a
                  className="rosaire-source"
                  href={content.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...reveal(content.paragraphs.length + 3)}
                >
                  {content.source.label}
                  <span aria-hidden="true"> ↗</span>
                </motion.a>
              )}
            </div>

            <p className="rosaire-progress">Glissez le long du chapelet</p>
          </div>
        </div>

        {/* Le masque est posé sur un calque plein écran : sur le rail
            lui-même, il rognerait aussi le crucifix et les halos qui
            débordent de ses 110 px de large. */}
        <div
          className="rosaire-rail-mask"
          style={{ clipPath: `inset(${railTop}px 0 0 0)`, WebkitMaskImage: railMask, maskImage: railMask }}
        >
          <motion.div className="rosaire-rail" onPanEnd={handlePanEnd}>
              {threads.map((thread) => (
                <div
                  key={`thread-${thread.key}`}
                  className="rosaire-thread"
                  style={{
                    top: thread.top,
                    left: thread.left,
                    width: thread.length,
                    opacity: thread.opacity,
                    transform: `translate(-50%, -50%) rotate(${thread.angle}deg)`
                  }}
                />
              ))}
              {beadSlots.map((slot) => {
                if (!slot || slot.bead.bead === null) return null;
                const isCrucifix = slot.bead.bead === 'crucifix';
                // Le crucifix pend un peu plus bas que sa place « logique »
                // dans la chaîne, comme sur un vrai chapelet.
                const verticalNudge = isCrucifix ? 50 : 0;
                const top = `calc(50% - ${slot.downPx - verticalNudge}px)`;
                const left = isCrucifix
                  ? `calc(${slot.leftPercent}% - 13px)`
                  : `${slot.leftPercent}%`;
                return (
                  // Un <button> natif imbriqué dans la zone de pan empêchait
                  // Framer Motion de reconnaître le geste de glissement quand
                  // il démarrait sur un grain (aucun souci sur une <div>).
                  <motion.div
                    role="button"
                    tabIndex={0}
                    key={slot.index}
                    className={`rosaire-bead${slot.distance === 0 ? ' is-current' : ''}${
                      isCrucifix ? ' rosaire-bead--crucifix' : ''
                    }`}
                    style={{
                      top,
                      left,
                      opacity: slot.opacity,
                      zIndex: isCrucifix || slot.bead.bead === 'medaille' ? 1 : 0
                    }}
                    onClick={() => handleBeadClick(slot.index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleBeadClick(slot.index);
                      }
                    }}
                    aria-label={`Grain ${slot.index + 1} sur ${total}`}
                    aria-current={slot.distance === 0 ? 'step' : undefined}
                  >
                    <img
                      src={BEAD_IMAGES[slot.bead.bead]}
                      alt=""
                      style={{
                        width: slot.size,
                        height: slot.size,
                        transform: isCrucifix ? 'rotate(45deg)' : undefined
                      }}
                    />
                  </motion.div>
                );
              })}
          </motion.div>
        </div>

        <footer className="rosaire-pager">
          {/* Sur le rail, les grains suivants sont au-dessus : la flèche du
              haut avance, celle du bas recule. Après la dernière prière, on
              revient au début du chapelet. */}
          <button
            type="button"
            className="rosaire-pager-button"
            onClick={() => goTo(clampedIndex >= total - 1 ? 0 : clampedIndex + 1)}
            aria-label={clampedIndex >= total - 1 ? 'Revenir au début' : 'Grain suivant'}
          >
            <ChevronUpIcon size={18} />
          </button>
          <button
            type="button"
            className="rosaire-pager-button"
            disabled={clampedIndex <= 0}
            onClick={() => goTo(clampedIndex - 1)}
            aria-label="Grain précédent"
          >
            <ChevronDownIcon size={18} />
          </button>
        </footer>

        <AnimatePresence>
          {isConfigOpen && (
            <RosaryConfigSheet
              config={config}
              summary={configSummary}
              onChange={setConfig}
              onClose={() => setIsConfigOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {meditationRef && (
            <VersePreviewSheet refData={meditationRef} onClose={() => setMeditationRef(null)} />
          )}
        </AnimatePresence>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default Rosaire;
