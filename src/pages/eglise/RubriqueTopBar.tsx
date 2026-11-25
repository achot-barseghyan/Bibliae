const RubriqueTopBar: React.FC<{ backLabel: string; count: string; onBack: () => void }> = ({
  backLabel,
  count,
  onBack
}) => (
  <div className="rubrique-topbar">
    <button type="button" className="rubrique-back" onClick={onBack}>
      <span className="rubrique-back-arrow" aria-hidden="true">
        ←
      </span>
      <span className="rubrique-back-label">{backLabel}</span>
    </button>
    <span className="rubrique-count">{count}</span>
  </div>
);

export default RubriqueTopBar;
