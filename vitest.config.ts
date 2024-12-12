// import { resolve } from 'node:path';
// import { defineConfig } from 'vitest/config'
import { resolve, fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';


export default mergeConfig(
  viteConfig,
  defineConfig({
    // resolve: {
    //   alias: [
    //     { find: '@/', replacement: resolve(__dirname, './src') }
    //   ]
    // },
    test: {
      // options for test in a browser environment
      // browser?: BrowserConfigOptions; //// FOR WEB AUDIO THINGS?

      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['tests/setup.ts'],
      environment: 'jsdom',
      // include: [],

      // UNIT TESTS are *.test.js
      // COMPONENT TESTS are *.spec.ts
      exclude: [...configDefaults.exclude, '**/*.spec.{js,jsx,ts,tsx}'],

      // globalSetup: [],
      // globals
      // typecheck:
      // exclude: ['**/dist/**', '**/node_modules/**', '**/e2e/**'],
      // ...
    },
  }),
);
