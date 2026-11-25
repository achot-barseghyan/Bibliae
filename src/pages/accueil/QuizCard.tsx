import './QuizCard.css';

interface Props {
  onOpen: () => void;
}

/** Carte « Quiz du jour » de l'Accueil (aucun appel réseau : le quiz charge à l'ouverture). */
const QuizCard: React.FC<Props> = ({ onOpen }) => (
  <button type="button" className="quiz-card" data-rv="1" onClick={onOpen}>
    <span className="quiz-card-text">
      <span className="quiz-card-eyebrow">Bibliae · Quiz</span>
      <span className="quiz-card-title">
        Le quiz <em>du jour</em>
      </span>
      <span className="quiz-card-line">20 questions sur la Bible, les mêmes pour tous · classement</span>
    </span>
    <span className="quiz-card-rose" aria-hidden="true">
      <span className="quiz-card-rose-glass" />
      <span className="quiz-card-rose-heart">?</span>
    </span>
  </button>
);

export default QuizCard;
