import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import { BibleReadingPrefsProvider, useBibleReadingPrefs } from '../hooks/useBibleReadingPrefs';
import BibleIndex from './bible/BibleIndex';
import BibleBook from './bible/BibleBook';
import BibleChapter from './bible/BibleChapter';
import MesLectures from './bible/MesLectures';
import './bible/bibleTheme.css';

const BibleWorld: React.FC = () => {
  const { prefs } = useBibleReadingPrefs();

  return (
    <div className="bible-world" data-bible-font={prefs.font} data-bible-theme={prefs.theme}>
      <IonRouterOutlet>
        <Route path="" element={<BibleIndex />} />
        <Route path="mes-lectures" element={<MesLectures />} />
        <Route path=":bookId" element={<BibleBook />} />
        <Route path=":bookId/:chapter" element={<BibleChapter />} />
      </IonRouterOutlet>
    </div>
  );
};

const Bible: React.FC = () => (
  <BibleReadingPrefsProvider>
    <BibleWorld />
  </BibleReadingPrefsProvider>
);

export default Bible;
