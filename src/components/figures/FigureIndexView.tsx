import { useNavigate } from 'react-router-dom';
import { normalizeLetter, type Figure } from '../../data/figures';
import './FigureIndexView.css';

interface FigureIndexViewProps {
  figures: Figure[];
}

const FigureIndexView: React.FC<FigureIndexViewProps> = ({ figures }) => {
  const navigate = useNavigate();

  const groups: [string, Figure[]][] = [];
  figures.forEach((figure) => {
    const letter = normalizeLetter(figure.name);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup[0] === letter) {
      lastGroup[1].push(figure);
    } else {
      groups.push([letter, [figure]]);
    }
  });

  return (
    <div className="figure-index">
      {groups.map(([letter, items]) => (
        <div className="figure-index-group" key={letter}>
          <div className="figure-index-heading">
            <span className="figure-index-letter">{letter}</span>
            <span className="figure-index-count">{items.length}</span>
          </div>
          {items.map((figure) => (
            <button
              type="button"
              className="figure-index-row"
              key={figure.id}
              onClick={() => navigate(`/figures/${figure.id}`)}
            >
              <span className="figure-index-name">{figure.name}</span>
              <span className="figure-index-role">{figure.role}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FigureIndexView;
