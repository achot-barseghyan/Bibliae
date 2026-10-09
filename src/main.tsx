import React from 'react';
import { createRoot } from 'react-dom/client';
import { initAppDataStore } from './services/appDataStore';
import { warmUpBibleDatabase } from './db/versesRepository';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

initAppDataStore().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // La base biblique s'ouvre une fois l'interface affichée, pour ne pas
  // retarder le premier rendu mais être prête avant le premier verset demandé.
  setTimeout(warmUpBibleDatabase, 1500);
});