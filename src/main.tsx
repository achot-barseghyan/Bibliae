import React from 'react';
import { createRoot } from 'react-dom/client';
import { getAppData, initAppDataStore } from './services/appDataStore';
import { setReducedMotion } from './services/reducedMotion';
import { warmUpBibleDatabase } from './db/versesRepository';
import App from './App';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { playBibliaeSplash } from './splash/bibliaeSplash';

// Réglages lus avant tout : l'animation de lancement et le premier rendu
// doivent déjà respecter « Réduire les animations ».
const storeReady = initAppDataStore().finally(() => {
  const systemReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  setReducedMotion(getAppData().settings.accessibility.reduceMotion || systemReduced);
});

// Animation de lancement, dans l'app native seulement. Elle masque l'écran
// natif (gardé affiché, voir capacitor.config.ts) à sa première image ;
// l'app se charge en dessous pendant ce temps.
if (Capacitor.isNativePlatform()) {
  const hideNative = () => SplashScreen.hide({ fadeOutDuration: 0 }).catch(() => undefined);
  // Secours : quoi qu'il arrive, l'écran natif ne reste pas plus de 3 s.
  const fallback = window.setTimeout(hideNative, 3000);
  playBibliaeSplash({
    settingsReady: storeReady,
    onReady: () => {
      window.clearTimeout(fallback);
      hideNative();
    }
  }).catch((error) => {
    console.error("Échec de l'animation de lancement", error);
    hideNative();
  });
}

const container = document.getElementById('root');
const root = createRoot(container!);

storeReady.finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // La base biblique s'ouvre une fois l'interface affichée, pour ne pas
  // retarder le premier rendu mais être prête avant le premier verset demandé.
  setTimeout(warmUpBibleDatabase, 1500);
});