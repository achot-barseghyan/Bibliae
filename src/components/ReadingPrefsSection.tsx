import { useBibleReadingPrefs } from '../hooks/useBibleReadingPrefs';
import { READING_FONTS, READING_THEMES } from './readingPrefsOptions';
import './ReadingPrefsSection.css';

const ReadingPrefsSection: React.FC = () => {
  const { prefs, update, reset, isDefault } = useBibleReadingPrefs();

  return (
    <section className="reading-prefs-section">
      <div className="reading-prefs-header">
        <h2 className="reading-prefs-title">Lecture biblique</h2>
        <button
          type="button"
          className="reading-prefs-reset"
          onClick={reset}
          disabled={isDefault}
        >
          {isDefault ? 'Par défaut' : 'Réinitialiser'}
        </button>
      </div>

      <p className="reading-prefs-label">Police</p>
      <div className="reading-prefs-font-row">
        {READING_FONTS.map((font) => (
          <button
            key={font.key}
            type="button"
            className={`reading-prefs-font-button${prefs.font === font.key ? ' is-active' : ''}`}
            onClick={() => update('font', font.key)}
            aria-pressed={prefs.font === font.key}
          >
            <span className="reading-prefs-font-sample" style={{ fontFamily: font.family }}>
              Aa
            </span>
            <span className="reading-prefs-font-label">{font.label}</span>
          </button>
        ))}
      </div>

      <p className="reading-prefs-label reading-prefs-label--spaced">Thème de lecture</p>
      <div className="reading-prefs-theme-row">
        {READING_THEMES.map((theme) => (
          <button
            key={theme.key}
            type="button"
            className={`reading-prefs-theme-button${prefs.theme === theme.key ? ' is-active' : ''}`}
            onClick={() => update('theme', theme.key)}
            aria-pressed={prefs.theme === theme.key}
          >
            <span className="reading-prefs-theme-swatch" style={{ background: theme.bg }}>
              <span className="reading-prefs-theme-sample" style={{ color: theme.text }}>
                Aa
              </span>
              <span className="reading-prefs-theme-line" style={{ background: theme.muted, width: '90%' }} />
              <span className="reading-prefs-theme-line" style={{ background: theme.muted, width: '70%' }} />
              <span className="reading-prefs-theme-line" style={{ background: theme.muted, width: '80%' }} />
              <span className="reading-prefs-theme-check" aria-hidden="true">
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1.2 6.4l3.2 3.2 6.4-7.2"
                    stroke="#F4EDDC"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
            <span className="reading-prefs-theme-label">{theme.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ReadingPrefsSection;
