import { useNavigate } from 'react-router-dom';
import { EPOQUES, EPOQUE_RANGES, type Figure } from '../../data/figures';
import './FigureFriseView.css';

interface FigureFriseViewProps {
  figures: Figure[];
}

const FigureFriseView: React.FC<FigureFriseViewProps> = ({ figures }) => {
  const navigate = useNavigate();

  return (
    <div className="figure-frise">
      {EPOQUES.map((epoque) => {
        const items = figures.filter((figure) => figure.epoque === epoque);
        if (!items.length) return null;

        return (
          <div className="figure-frise-group" key={epoque}>
            <h3 className="figure-frise-title">{epoque}</h3>
            <p className="figure-frise-range">{EPOQUE_RANGES[epoque]}</p>
            <div className="figure-frise-chips">
              {items.map((figure) => (
                <button
                  type="button"
                  className="figure-frise-chip"
                  key={figure.id}
                  onClick={() => navigate(`/figures/${figure.id}`)}
                >
                  {figure.name}
                  <span className="figure-frise-chip-role">{figure.role}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FigureFriseView;
