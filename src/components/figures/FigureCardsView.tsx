import { useNavigate } from 'react-router-dom';
import type { Figure } from '../../data/figures';
import './FigureCardsView.css';

interface FigureCardsViewProps {
  figures: Figure[];
}

const FigureCardsView: React.FC<FigureCardsViewProps> = ({ figures }) => {
  const navigate = useNavigate();

  return (
    <div className="figure-cards">
      {figures.map((figure) => (
        <button
          type="button"
          className="figure-row"
          key={figure.id}
          onClick={() => navigate(`/figures/${figure.id}`)}
        >
          <div className="figure-row-thumb">
            <img src={figure.image} alt={figure.name} />
          </div>
          <div className="figure-row-body">
            <div className="figure-row-top">
              <span className="figure-row-testament">
                {figure.testament === 'ancien' ? 'Ancien T.' : 'Nouveau T.'}
              </span>
              <span className="figure-row-mentions">
                {figure.mentions} mentions
              </span>
            </div>
            <div className="figure-row-name-line">
              <h3 className="figure-row-name">{figure.name}</h3>
              <span className="figure-row-original">{figure.originalName}</span>
            </div>
            <div className="figure-row-meta">
              <span className="figure-row-role">
                {figure.role} · {figure.date}
              </span>
              <span className="figure-row-books">
                {figure.books.join(' · ')}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default FigureCardsView;
