import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
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
  const [version, setVersion] = useState<string>(__APP_VERSION__);

  useEffect(() => {
    // Version du binaire installé (versionName/versionCode sur Android,
    // MARKETING_VERSION/CURRENT_PROJECT_VERSION sur iOS). Sur le web,
    // getInfo() échoue et on garde la version lue au build.
    App.getInfo()
      .then(({ version: name, build }) => {
        if (name) setVersion(build ? `${name} (${build})` : name);
      })
      .catch(() => {});
  }, []);

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
      {version && <p className="info-links-version">Version {version}</p>}
    </section>
  );
};

export default InfoLinksSection;
