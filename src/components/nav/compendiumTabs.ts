import FiguresIcon from '../../assets/icons/fluent_people-community-20-regular.svg?react';
import LieuxIcon from '../../assets/icons/hugeicons_maps-location-01.svg?react';
import FriseIcon from '../../assets/icons/fluent_timeline-20-regular.svg?react';
import EgliseIcon from '../../assets/icons/healthicons_church-outline.svg?react';

export interface NavTab {
  path: string;
  label: string;
  Icon: React.FC<{ width?: number; height?: number; className?: string }>;
  /** Préfixes de route (onglet et sous-écrans) qui rendent l'onglet actif. */
  routes: string[];
}

/** Les 4 onglets du Compendium, dans l'ordre de la barre. */
export const COMPENDIUM_TABS: NavTab[] = [
  { path: '/compendium/figures', label: 'Figures', Icon: FiguresIcon, routes: ['/compendium/figures', '/figures'] },
  { path: '/compendium/lieux', label: 'Lieux', Icon: LieuxIcon, routes: ['/compendium/lieux'] },
  { path: '/compendium/frise', label: 'Frise', Icon: FriseIcon, routes: ['/compendium/frise'] },
  {
    path: '/compendium/eglise',
    label: 'Église',
    Icon: EgliseIcon,
    routes: ['/compendium/eglise', '/parcours', '/paroisses', '/credo', '/catechisme']
  }
];

const matches = (pathname: string, route: string) => pathname === route || pathname.startsWith(`${route}/`);

export function activeTabIndex(pathname: string, tabs: NavTab[]): number {
  return tabs.findIndex((tab) => tab.routes.some((route) => matches(pathname, route)));
}

/** Écrans du Compendium : ses onglets (et l'accueil) et leurs sous-écrans. */
export function isCompendiumRoute(pathname: string): boolean {
  return matches(pathname, '/compendium') || activeTabIndex(pathname, COMPENDIUM_TABS) >= 0;
}
