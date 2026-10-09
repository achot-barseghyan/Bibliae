import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CompassRose from './CompassRose';
import { LIEUX_AVAILABLE } from '../config/features';
import { isLieuxNoticeDue, markLieuxNoticeShown } from '../services/lieuxNotice';
import { useAccessibility } from '../hooks/useAccessibility';
import { tapHaptic } from '../utils/haptics';
import './LieuxOpeningNotice.css';

const EASE = [0.22, 0.61, 0.36, 1] as const;

/**
 * Annonce de l'ouverture de la section Lieux, montrée une seule fois au
 * lancement aux utilisateurs qui avaient demandé « Me prévenir à
 * l'ouverture ». Remplace une notification push (sans serveur) : elle
 * n'apparaît qu'à l'ouverture de l'app, une fois la section livrée.
 */
const LieuxOpeningNotice: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!LIEUX_AVAILABLE) return;
    let cancelled = false;
    // Léger délai : laisser l'écran d'accueil s'afficher avant l'annonce.
    const timer = setTimeout(() => {
      isLieuxNoticeDue().then((due) => {
        if (!cancelled && due) setIsOpen(true);
      });
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const close = (discover: boolean) => {
    tapHaptic();
    markLieuxNoticeShown();
    setIsOpen(false);
    if (discover) navigate('/compendium/lieux');
  };

  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.32, ease: EASE };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="lieux-notice-backdrop"
          role="presentation"
          onClick={() => close(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <motion.div
            className="lieux-notice-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lieux-notice-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={transition}
          >
            <div className="lieux-notice-handle" aria-hidden="true" />
            <CompassRose className="lieux-notice-compass" />
            <p className="lieux-notice-kicker">Nouveau</p>
            <h2 id="lieux-notice-title" className="lieux-notice-title">
              Les lieux de la Bible sont ouverts
            </h2>
            <p className="lieux-notice-text">
              Vous nous aviez demandé de vous prévenir : la section Lieux est maintenant disponible
              dans le Compendium.
            </p>
            <button type="button" className="lieux-notice-discover" onClick={() => close(true)}>
              Découvrir les lieux
            </button>
            <button type="button" className="lieux-notice-later" onClick={() => close(false)}>
              Plus tard
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LieuxOpeningNotice;
