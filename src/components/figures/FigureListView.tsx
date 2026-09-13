import { useNavigate } from 'react-router-dom';
import type { Figure } from '../../data/figures';
import './FigureListView.css';

interface FigureListViewProps {
  figures: Figure[];
}

const FigureListView: React.FC<FigureListViewProps> = ({ figures }) => {
  const navigate = useNavigate();

  return (
    <div className="figure-list">
      {figures.map((figure) => (
        <button
          type="button"
          className="figure-list-row"
          key={figure.id}
          onClick={() => navigate(`/figures/${figure.id}`)}
        >
          <div className="figure-list-top">
            <h3 className="figure-list-name">{figure.name}</h3>
            <span className="figure-list-original">{figure.originalName}</span>
          </div>
          <p className="figure-list-meta">
            {figure.role} · {figure.date}
          </p>
        </button>
      ))}
    </div>
  );
};

export default FigureListView;
