import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, './src') }
    ]
  },
  test: {
    /**
     * options for test in a browser environment
     * @experimental
     * @default false
     */
    // browser?: BrowserConfigOptions; //// FOR WEB AUDIO THINGS?


    // setupFiles: [],
    // globalSetup: [],
    // globals
    // typecheck:
    // include: [],
    exclude: ['**/dist/**', '**/node_modules/**', '**/e2e/**'],
    // ...
  },
})