import React from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements as defineJeepSqlite } from 'jeep-sqlite/loader';
import { initAppDataStore } from './services/appDataStore';
import App from './App';

if (Capacitor.getPlatform() === 'web') {
  defineJeepSqlite(window);
}

const container = document.getElementById('root');
const root = createRoot(container!);

initAppDataStore().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});