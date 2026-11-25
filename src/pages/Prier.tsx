import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import PrierHome from './prier/PrierHome';
import PrayerList from './prier/PrayerList';
import PrayerDetail from './prier/PrayerDetail';
import SaintsList from './prier/SaintsList';
import SaintDetail from './prier/SaintDetail';
import MassList from './prier/MassList';
import MassMoment from './prier/MassMoment';

const Prier: React.FC = () => (
  <IonRouterOutlet>
    <Route path="" element={<PrierHome />} />
    <Route path="prieres" element={<PrayerList />} />
    <Route path="prieres/:prayerId" element={<PrayerDetail />} />
    <Route path="saints" element={<SaintsList />} />
    <Route path="saints/:situationId" element={<SaintDetail />} />
    <Route path="messe" element={<MassList />} />
    <Route path="messe/:momentId" element={<MassMoment />} />
  </IonRouterOutlet>
);

export default Prier;
