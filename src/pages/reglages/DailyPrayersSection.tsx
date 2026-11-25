import { mod24, type DailyPrayerSettings } from '../../data/dailyPrayers';
import { useDailyPrayers } from '../../hooks/useDailyPrayers';
import './DailyPrayersSection.css';

type HourKey = 'morningStart' | 'morningEnd' | 'eveningStart' | 'eveningEnd';

const RANGES: { label: string; color: string; rows: [HourKey, HourKey] }[] = [
  { label: 'Prière du matin', color: '#B5892E', rows: ['morningStart', 'morningEnd'] },
  { label: 'Prière du soir', color: '#24406B', rows: ['eveningStart', 'eveningEnd'] }
];

/**
 * Réglages · Prières du jour : plages horaires pendant lesquelles l'Accueil
 * propose la prière du matin ou du soir, et encart des étapes de la prière.
 * La toggle reprend le style des interrupteurs d'AccessibilityPanel.
 */
const DailyPrayersSection: React.FC = () => {
  const { settings, updateSettings } = useDailyPrayers();

  const step = (key: HourKey, delta: number) =>
    updateSettings({ [key]: mod24(settings[key] + delta) } as Partial<DailyPrayerSettings>);

  return (
    <section className="daily-prayers-section">
      <h2 className="daily-prayers-title">Prières du jour</h2>
      <p className="daily-prayers-intro">L'accueil affiche la prière du matin ou du soir pendant ces heures.</p>

      <div className="daily-prayers-cards">
        {RANGES.map((range) => (
          <div key={range.label} className="daily-prayers-card">
            <p className="daily-prayers-card-head">
              <span className="daily-prayers-dot" style={{ background: range.color }} aria-hidden="true" />
              {range.label}
            </p>
            {range.rows.map((key, i) => {
              const label = i === 0 ? 'À partir de' : 'Jusqu’à';
              return (
                <div key={key} className="daily-prayers-row">
                  <span className="daily-prayers-row-label">{label}</span>
                  <div className="daily-prayers-stepper">
                    <button
                      type="button"
                      onClick={() => step(key, -1)}
                      aria-label={`${range.label}, ${label.toLowerCase()} : une heure plus tôt`}
                    >
                      −
                    </button>
                    <span className="daily-prayers-value" aria-live="polite">
                      {settings[key]} h
                    </span>
                    <button
                      type="button"
                      onClick={() => step(key, 1)}
                      aria-label={`${range.label}, ${label.toLowerCase()} : une heure plus tard`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div className="daily-prayers-card daily-prayers-card--toggle">
          <div className="a11y-toggle-row" onClick={() => updateSettings({ showSteps: !settings.showSteps })}>
            <div className="a11y-toggle-text">
              <p className="a11y-toggle-title">Étapes de la prière</p>
              <p className="a11y-toggle-description">Remercier, demander pardon, demander des grâces</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.showSteps}
              aria-label="Étapes de la prière"
              className={`a11y-switch${settings.showSteps ? ' is-on' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                updateSettings({ showSteps: !settings.showSteps });
              }}
            >
              <span className="a11y-switch-thumb" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyPrayersSection;
