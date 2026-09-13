import type { ScriptureRef } from '../../data/figureDetails';
import './ScriptureRefChip.css';

interface ScriptureRefChipProps {
  refData: ScriptureRef;
  onOpen: (ref: ScriptureRef) => void;
}

const ScriptureRefChip: React.FC<ScriptureRefChipProps> = ({ refData, onOpen }) => (
  <button type="button" className="scripture-ref-chip" onClick={() => onOpen(refData)}>
    {refData.display}
  </button>
);

export default ScriptureRefChip;
