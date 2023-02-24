import { defineConfig } from 'cypress';

export default defineConfig({

  // "projectId": "zt64m4",

  component: {
    indexHtmlFile: 'tests/component/index.html',
    specPattern: 'src/components/**/*.test.{js,jsx,ts,tsx}',
    supportFile: 'tests/component/index.js',
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
});
