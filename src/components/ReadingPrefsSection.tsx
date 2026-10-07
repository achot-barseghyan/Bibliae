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
            style={{ fontFamily: font.family }}
            onClick={() => update('font', font.key)}
            aria-pressed={prefs.font === font.key}
            aria-label={font.label}
          >
            Aa
          </button>
        ))}
      </div>

      <p className="reading-prefs-label">Thème de lecture</p>
      <div className="reading-prefs-theme-row">
        {READING_THEMES.map((theme) => (
          <button
            key={theme.key}
            type="button"
            className={`reading-prefs-theme-button${prefs.theme === theme.key ? ' is-active' : ''}`}
            style={{ background: theme.bg, color: theme.text }}
            onClick={() => update('theme', theme.key)}
            aria-pressed={prefs.theme === theme.key}
            aria-label={theme.label}
          >
            Aa
          </button>
        ))}
      </div>
    </section>
  );
};

export default ReadingPrefsSection;
