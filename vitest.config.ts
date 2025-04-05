import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // options for test in a browser environment
      // browser?: BrowserConfigOptions; //// FOR WEB AUDIO THINGS?

      silent : true,
      environment: 'jsdom',
      setupFiles: ['tests/setup.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      // include: [],

      // UNIT TESTS are *.test.js
      // COMPONENT TESTS are *.spec.ts
      exclude: [...configDefaults.exclude, '**/*.spec.{js,jsx,ts,tsx}'],
    }
  }),
);
