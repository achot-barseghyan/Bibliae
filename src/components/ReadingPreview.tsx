import { READING_FONTS, READING_THEMES } from './readingPrefsOptions';
import { useAccessibility } from '../hooks/useAccessibility';
import { useBibleReadingPrefs } from '../hooks/useBibleReadingPrefs';
import './ReadingPreview.css';

// Lignes visibles dans l'aperçu selon la taille (1 à 4) : assez pour que
// le changement de taille se voie sans faire grandir l'aperçu à l'excès.
const PREVIEW_LINES = [3, 4, 4, 5];

interface ReadingPreviewProps {
  className?: string;
}

// Aperçu du texte de lecture (police, taille, thème, contraste), partagé par
// la feuille « Réglages · Lecture » et la page /reglages. Ses couleurs viennent
// de READING_THEMES/READING_FONTS plutôt que des jetons CSS (redéfinis par le
// thème choisi) afin de rester correctes quel que soit l'écran parent.
const ReadingPreview: React.FC<ReadingPreviewProps> = ({ className }) => {
  const { settings } = useAccessibility();
  const { prefs } = useBibleReadingPrefs();

  const activeFont = READING_FONTS.find((font) => font.key === prefs.font) ?? READING_FONTS[0];
  const activeTheme = READING_THEMES.find((theme) => theme.key === prefs.theme) ?? READING_THEMES[0];

  const scaleIndex = Math.min(Math.max(settings.textScale - 1, 0), 3);
  const previewLines =
    PREVIEW_LINES[scaleIndex] + (prefs.font === 'inter' && scaleIndex > 0 ? 1 : 0);

  return (
    <div
      className={`reading-preview${className ? ` ${className}` : ''}`}
      style={{ background: activeTheme.bg }}
    >
      <span className="reading-preview-shine" aria-hidden="true" />
      <div className="reading-preview-top">
        <span className="reading-preview-kicker" style={{ color: activeTheme.accent }}>
          Aperçu
        </span>
        <span className="reading-preview-meta" style={{ color: activeTheme.muted }}>
          {activeFont.label} · {activeTheme.label}
        </span>
      </div>
      <p
        className="reading-preview-text"
        style={
          {
            fontFamily: activeFont.family,
            color: settings.contrast ? activeTheme.hi : activeTheme.text,
            '--pv-lines': previewLines
          } as React.CSSProperties
        }
      >
        <sup className="reading-preview-verse-number" style={{ color: activeTheme.accent }}>
          1
        </sup>
        Voici à quoi ressemblera le texte pendant la lecture, avec la police, la taille et le
        thème choisis ci-dessous.
      </p>
    </div>
  );
};

export default ReadingPreview;
