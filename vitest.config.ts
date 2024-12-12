// import { resolve } from 'node:path';
// import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';


export default defineConfig({
  // resolve: {
  //   alias: [
  //     { find: '@', replacement: resolve(__dirname, './src') }
  //   ]
  // },
  test: {
    // options for test in a browser environment
    // browser?: BrowserConfigOptions; //// FOR WEB AUDIO THINGS?


      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),


    // setupFiles: [],
    // globalSetup: [],
    // globals
    // typecheck:
    // include: [],
    // exclude: ['**/dist/**', '**/node_modules/**', '**/e2e/**'],
    // ...
  },
})