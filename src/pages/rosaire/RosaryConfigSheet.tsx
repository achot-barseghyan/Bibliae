import { useRef } from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_ROSARY_CONFIG, ROSARY_CONFIG_GROUPS, ROSARY_SOURCE, type RosaryConfig } from '../../data/rosary';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import { CloseIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './RosaryConfigSheet.css';

const EASE = [0.2, 0.7, 0.2, 1] as const;

interface RosaryConfigSheetProps {
  config: RosaryConfig;
  /** « 78 étapes · 24 min » */
  summary: string;
  onChange: (config: RosaryConfig) => void;
  onClose: () => void;
}

/** Réglages du déroulé du chapelet : chaque prière facultative s'active ou
 * se retire, la séquence de grains suit. */
const RosaryConfigSheet: React.FC<RosaryConfigSheetProps> = ({ config, summary, onChange, onClose }) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  useSheetDrag(sheetRef, onClose);
  const { settings } = useAccessibility();
  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.52, ease: EASE };

  return (
    <motion.div
      className="rosary-config-backdrop"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={settings.reduceMotion ? { duration: 0 } : { duration: 0.4 }}
    >
      <motion.div
        className="rosary-config"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rosary-config-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '102%' }}
        animate={{ y: 0 }}
        exit={{ y: '102%' }}
        transition={transition}
        ref={sheetRef}
      >
        <header className="rosary-config-header">
          <div className="rosary-config-handle" aria-hidden="true" />
          <div className="rosary-config-title-row">
            <h2 id="rosary-config-title" className="rosary-config-title">
              Réglages du chapelet
            </h2>
            <button type="button" className="rosary-config-close" onClick={onClose} aria-label="Fermer">
              <CloseIcon size={14} />
            </button>
          </div>
          <div className="rosary-config-meta">
            <span className="rosary-config-source">
              Mystères d'après{' '}
              <a href={ROSARY_SOURCE.url} target="_blank" rel="noopener noreferrer">
                Rosarium Virginis Mariae
              </a>
              {' · '}déroulé d'après prierlechapelet.com
            </span>
            <span className="rosary-config-summary">{summary}</span>
          </div>
        </header>

        <div className="rosary-config-body">
          {ROSARY_CONFIG_GROUPS.map((group) => (
            <section key={group.title} className="rosary-config-group">
              <h3 className="rosary-config-group-title">{group.title}</h3>
              <div className="rosary-config-card">
                {group.options.map((option) => {
                  const isOn = config[option.key];
                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="switch"
                      aria-checked={isOn}
                      className={`rosary-config-row${isOn ? ' is-on' : ''}`}
                      onClick={() => {
                        tapHaptic();
                        onChange({ ...config, [option.key]: !isOn });
                      }}
                    >
                      <span className="rosary-config-row-text">
                        <span className="rosary-config-row-name">{option.name}</span>
                        <span className="rosary-config-row-hint">{option.hint}</span>
                      </span>
                      <span className="rosary-config-switch" aria-hidden="true">
                        <span className="rosary-config-knob" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          <button
            type="button"
            className="rosary-config-reset"
            onClick={() => {
              tapHaptic();
              onChange({ ...DEFAULT_ROSARY_CONFIG });
            }}
          >
            <span className="rosary-config-reset-star" aria-hidden="true">✦</span>
            Revenir au déroulé habituel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RosaryConfigSheet;
