import { useAccessibility, type TextScale } from '../hooks/useAccessibility';
import './AccessibilityPanel.css';

const textScales: TextScale[] = [1, 2, 3, 4];

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  title,
  description,
  checked,
  onChange
}) => (
  <div className="a11y-toggle-row">
    <div>
      <p className="a11y-toggle-title">{title}</p>
      <p className="a11y-toggle-description">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={title}
      className={`a11y-switch${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="a11y-switch-thumb" />
    </button>
  </div>
);

const AccessibilityPanel: React.FC = () => {
  const { settings, update, reset, isDefault } = useAccessibility();

  return (
    <div className="a11y-panel">
      <div className="a11y-panel-header">
        <h2 className="a11y-panel-title">Accessibilité</h2>
        <button
          type="button"
          className="a11y-panel-reset"
          onClick={reset}
          disabled={isDefault}
        >
          {isDefault ? 'Par défaut' : 'Réinitialiser'}
        </button>
      </div>

      <p className="a11y-panel-label">Taille du texte</p>
      <div className="a11y-scale-row">
        {textScales.map((scale, index) => (
          <button
            key={scale}
            type="button"
            className={`a11y-scale-button${
              settings.textScale === scale ? ' is-active' : ''
            }`}
            style={{ fontSize: `${14 + index * 4}px` }}
            onClick={() => update('textScale', scale)}
            aria-pressed={settings.textScale === scale}
            aria-label={`Taille du texte ${index + 1} sur 4`}
          >
            A
          </button>
        ))}
      </div>

      <ToggleRow
        title="Interlignage large"
        description="Plus d'air entre les lignes"
        checked={settings.lineSpacing}
        onChange={(value) => update('lineSpacing', value)}
      />
      <ToggleRow
        title="Contraste renforcé"
        description="Encre plus sombre sur le crème"
        checked={settings.contrast}
        onChange={(value) => update('contrast', value)}
      />
      <ToggleRow
        title="Réduire les animations"
        description="Supprime transitions et fondus"
        checked={settings.reduceMotion}
        onChange={(value) => update('reduceMotion', value)}
      />
    </div>
  );
};

export default AccessibilityPanel;
