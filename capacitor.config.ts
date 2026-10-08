import type { CapacitorConfig } from '@capacitor/cli';

const liveReload = process.env.CAP_LIVE_RELOAD === 'true';
// 10.0.2.2 is the Android emulator's alias for the host machine's localhost.
// For a physical device connected over USB, use CAP_LIVE_RELOAD_HOST=localhost
// together with `adb reverse tcp:5173 tcp:5173` (see npm run android:device:live).
const liveReloadHost = process.env.CAP_LIVE_RELOAD_HOST || '10.0.2.2';

const config: CapacitorConfig = {
  appId: 'com.bibliae.app',
  appName: 'Bibliae',
  webDir: 'dist',
  ...(liveReload && {
    server: {
      url: `http://${liveReloadHost}:5173`,
      cleartext: true
    }
  })
};

export default config;
