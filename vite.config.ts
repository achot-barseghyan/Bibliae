/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

// Version affichée dans les Réglages quand App.getInfo() est indisponible
// (web) : la même que celle publiée sur Android.
function readAppVersion(): string {
  try {
    const gradle = readFileSync('android/app/build.gradle', 'utf-8')
    const name = gradle.match(/versionName\s+"([^"]+)"/)?.[1]
    const code = gradle.match(/versionCode\s+(\d+)/)?.[1]
    if (!name) return ''
    return code ? `${name} (${code})` : name
  } catch {
    return ''
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(readAppVersion())
  },
  plugins: [
    react(),
    legacy(),
    svgr({
      svgrOptions: {
        // hardcoded colors from the exported icons become recolorable via currentColor
        replaceAttrValues: {
          '#9C3A26': 'currentColor',
          '#B0A68F': 'currentColor'
        }
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
