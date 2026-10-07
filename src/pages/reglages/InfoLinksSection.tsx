import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './InfoLinksSection.css';

const LINKS = [
  { label: 'À propos', path: '/a-propos' },
  { label: 'Sources', path: '/sources' },
  { label: 'Contact', path: '/contact' }
];

const InfoLinksSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="info-links-section">
      {LINKS.map((link) => (
        <button
          key={link.path}
          type="button"
          className="info-links-row"
          onClick={() => {
            tapHaptic();
            navigate(link.path);
          }}
        >
          <span className="info-links-row-label">{link.label}</span>
          <ChevronRightIcon size={16} className="info-links-row-chevron" />
        </button>
      ))}
    </section>
  );
};

export default InfoLinksSection;
