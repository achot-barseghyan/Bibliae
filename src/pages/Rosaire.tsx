import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { buildSequence, type BeadImageKey } from '../data/rosary';
import { useRemoteRosary } from '../hooks/content/useRemoteRosary';
import { useRosaryProgress } from '../hooks/useRosaryProgress';
import { useAccessibility } from '../hooks/useAccessibility';
import { CrossIcon, ChevronUpIcon, ChevronDownIcon, RefreshIcon, InfoIcon } from '../components/nav/icons';
import WorldSheet from '../components/nav/WorldSheet';
import { tapHaptic } from '../utils/haptics';
import { BEAD_IMAGES } from './rosaire/beadImages';
import MysteryPickerSheet from './rosaire/MysteryPickerSheet';
import VersePreviewSheet from './figures/VersePreviewSheet';
import type { ScriptureRef } from '../data/figureDetails';
import './Rosaire.css';

// Assez de grains pour couvrir toute la hauteur de l'écran : le rail est
// fixe (position: fixed), centré sur l'écran, et ne bouge donc jamais avec
// la hauteur variable du texte de prière au-dessus.
const RAIL_RADIUS = 9;
const SLOT_SPACING = 46;
// Longueur de chaîne ajoutée là où la séquence marque un espace (gapBefore).
const GAP_SPACING = 30;
const RAIL_WIDTH = 110; // doit correspondre à la largeur de .rosaire-rail
// Décalage horizontal doux et continu (basé sur l'index global, pas sur la
// position dans la fenêtre visible) pour que le chapelet garde une allure de
// vrai collier qui ondule légèrement, sans que la courbe ne « saute » quand
// on avance d'un grain.
const curveOffset = (index: number) => Math.sin(index * 0.5) * 18;

// Le crucifix et le médaillon sont de vraies pièces du chapelet, nettement
// plus grandes que les grains courants, comme sur un chapelet réel.
function beadSize(bead: BeadImageKey | null, distance: number): number {
  if (bead === null) return 0;
  if (bead === 'crucifix') return Math.max(32, 130 - distance * 7);
  if (bead === 'medaille') return Math.max(18, 50 - distance * 3);
  return Math.max(14, 32 - distance * 2);
}

const Rosaire: React.FC = () => {
  const { mysterySet, stepIndex, setStepIndex, setMysterySet } = useRosaryProgress();
  const { settings } = useAccessibility();
  const { mysterySets, prayers } = useRemoteRosary();
  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isWorldSheetOpen, setIsWorldSheetOpen] = useState(false);
  const [meditationRef, setMeditationRef] = useState<ScriptureRef | null>(null);

  const sequence = useMemo(() => buildSequence(), []);
  // Position de chaque grain le long de la chaîne, espaces compris.
  const chainPositions = useMemo(() => {
    const positions: number[] = [];
    sequence.forEach((bead, i) => {
      if (i === 0) {
        positions.push(0);
        return;
      }
      // Une étape sans grain se place au milieu d'un espace de chaîne.
      const onBareChain = bead.bead === null || sequence[i - 1].bead === null;
      const step = onBareChain
        ? (SLOT_SPACING + GAP_SPACING) / 2
        : SLOT_SPACING + (bead.gapBefore ? GAP_SPACING : 0);
      positions.push(positions[i - 1] + step);
    });
    return positions;
  }, [sequence]);
  const total = sequence.length;
  const clampedIndex = Math.min(stepIndex, total - 1);
  const current = sequence[clampedIndex];
  const mysteryLabel = mysterySets[mysterySet];
  const prayer = prayers[current.prayerKey];
  const mysteryTitle =
    current.mysteryIndex !== null ? mysteryLabel.mysteries[current.mysteryIndex] : null;
  const mysteryRef =
    current.mysteryIndex !== null ? mysteryLabel.refs?.[current.mysteryIndex] ?? null : null;
  const openMeditation = () => {
    if (!mysteryRef) return;
    tapHaptic();
    setMeditationRef(mysteryRef);
  };

  const goTo = (index: number) => {
    setStepIndex(Math.max(0, Math.min(total - 1, index)));
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
      leftPercent: 50 + curveOffset(index),
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

  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <IonPage>
      <IonContent fullscreen className="rosaire-content">
        <header className="rosaire-header">
          <button
            type="button"
            className="rosaire-close"
            onClick={() => {
              tapHaptic();
              setIsWorldSheetOpen(true);
            }}
            aria-label="Changer de monde"
          >
            <CrossIcon size={17} />
          </button>
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
            <RefreshIcon size={16} />
            Recommencer
          </button>
        </header>

        <div className="rosaire-layout">
          <div className="rosaire-text">
            <p className="rosaire-day">{todayLabel}</p>

            <button
              type="button"
              className="rosaire-mystery-set"
              onClick={() => setIsPickerOpen(true)}
            >
              {mysteryLabel.label}
              <ChevronDownIcon size={14} className="rosaire-mystery-set-chevron" />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={clampedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
              >
                {mysteryTitle && (
                  <div className="rosaire-mystery-row">
                    {mysteryRef ? (
                      <button
                        type="button"
                        className="rosaire-mystery-title"
                        onClick={openMeditation}
                        aria-label={`${mysteryTitle} : méditer ${mysteryRef.display}`}
                      >
                        {(current.mysteryIndex as number) + 1}. {mysteryTitle}
                        <InfoIcon size={14} className="rosaire-mystery-info" />
                      </button>
                    ) : (
                      <span className="rosaire-mystery-title">
                        {(current.mysteryIndex as number) + 1}. {mysteryTitle}
                      </span>
                    )}
                  </div>
                )}
                {mysteryTitle && <hr className="rosaire-divider" />}
                <h1 className="rosaire-prayer-name">{prayer.name}</h1>
                {prayer.text &&
                  prayer.text.split('\n\n').map((paragraph, i) => (
                    <p className="rosaire-prayer-text" key={i}>
                      {paragraph}
                    </p>
                  ))}
              </motion.div>
            </AnimatePresence>

            <p className="rosaire-progress">
              {clampedIndex + 1} / {total} · glissez
            </p>
          </div>
        </div>

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

        <footer className="rosaire-pager">
          <button
            type="button"
            className="rosaire-pager-button"
            disabled={clampedIndex >= total - 1}
            onClick={() => goTo(clampedIndex + 1)}
            aria-label="Grain suivant"
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
          {isPickerOpen && (
            <MysteryPickerSheet
              active={mysterySet}
              onSelect={setMysterySet}
              onClose={() => setIsPickerOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {meditationRef && (
            <VersePreviewSheet refData={meditationRef} onClose={() => setMeditationRef(null)} />
          )}
        </AnimatePresence>

        <WorldSheet isOpen={isWorldSheetOpen} onClose={() => setIsWorldSheetOpen(false)} />
      </IonContent>
    </IonPage>
  );
};

export default Rosaire;
