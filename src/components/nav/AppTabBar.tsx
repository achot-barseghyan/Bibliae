import { useLocation, useNavigate } from 'react-router-dom';
import FiguresIcon from '../../assets/icons/fluent_people-community-20-regular.svg?react';
import LieuxIcon from '../../assets/icons/hugeicons_maps-location-01.svg?react';
import FriseIcon from '../../assets/icons/fluent_timeline-20-regular.svg?react';
import EgliseIcon from '../../assets/icons/healthicons_church-outline.svg?react';
import { CrossIcon } from './icons';
import { tapHaptic } from '../../utils/haptics';
import './AppTabBar.css';

interface CompendiumTab {
  path: string;
  label: string;
  Icon: React.FC<{ width?: number; height?: number; className?: string }>;
}

const tabs: CompendiumTab[] = [
  { path: '/compendium/figures', label: 'Figures', Icon: FiguresIcon },
  { path: '/compendium/lieux', label: 'Lieux', Icon: LieuxIcon }
];

const tabsRight: CompendiumTab[] = [
  { path: '/compendium/frise', label: 'Frise', Icon: FriseIcon },
  { path: '/compendium/eglise', label: 'Église', Icon: EgliseIcon }
];

interface AppTabBarProps {
  isSheetOpen: boolean;
  onOpenSheet: () => void;
}

const AppTabBar: React.FC<AppTabBarProps> = ({ isSheetOpen, onOpenSheet }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const renderTab = (tab: CompendiumTab) => {
    const isActive = location.pathname.startsWith(tab.path);
    return (
      <button
        key={tab.path}
        type="button"
        className={`app-tab-bar-button${isActive ? ' is-active' : ''}`}
        onClick={() => {
          tapHaptic();
          navigate(tab.path);
        }}
        aria-label={tab.label}
        aria-current={isActive ? 'page' : undefined}
      >
        <tab.Icon width={22} height={22} className="app-tab-bar-icon" />
        <span className="app-tab-bar-label">{tab.label}</span>
      </button>
    );
  };

  return (
    <div className="app-tab-bar" slot="bottom">
      {tabs.map(renderTab)}

      <div className="app-tab-bar-center-slot">
        <button
          type="button"
          className="app-tab-bar-cross"
          onClick={() => {
            tapHaptic();
            onOpenSheet();
          }}
          aria-label="Passer à un autre monde"
          aria-haspopup="dialog"
          aria-expanded={isSheetOpen}
        >
          <CrossIcon size={24} />
        </button>
      </div>

      {tabsRight.map(renderTab)}
    </div>
  );
};

export default AppTabBar;
