import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import { useBibleReadingPrefs } from '../hooks/useBibleReadingPrefs';
import BibleIndex from './bible/BibleIndex';
import BibleBook from './bible/BibleBook';
import BibleChapter from './bible/BibleChapter';
import MesLectures from './bible/MesLectures';
import './bible/bibleTheme.css';

// BibleReadingPrefsProvider est monté globalement dans App.tsx : la feuille
// d'accessibilité partagée (AccessibilityQuickSheet) doit pouvoir modifier
// ces préférences depuis n'importe quel monde (Figures, Réglages...), pas
// seulement depuis celui-ci.
const Bible: React.FC = () => {
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

export default Bible;
