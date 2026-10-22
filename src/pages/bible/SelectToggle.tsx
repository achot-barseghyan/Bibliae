/** Bouton « Sélectionner / Terminer » des en-têtes de grille (écran Livre, psautier). */
const SelectToggle: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <button
    type="button"
    className={`bible-book-select-toggle${active ? ' is-active' : ''}`}
    aria-pressed={active}
    onClick={onClick}
  >
    <span>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <rect x="0.75" y="0.75" width="10.5" height="10.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M3.4 6.1l1.8 1.8 3.5-3.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {active ? 'Terminer' : 'Sélectionner'}
    </span>
  </button>
);

export default SelectToggle;
