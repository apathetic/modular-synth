import { defineConfig } from 'cypress'

export default defineConfig({
  component: {

    // supportFile: 'tests/component/index.js',
    // indexHtmlFile: 'tests/component/index.html',
    // specPattern: 'src/components/**/*.test.{js,jsx,ts,tsx}',

    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
})