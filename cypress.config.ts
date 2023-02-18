import { defineConfig } from 'cypress';

export default defineConfig({

  // "fileServerFolder": "tests",
  // "fixturesFolder": " tests/fixtures",
  // "integrationFolder": "tests/specs",
  // "pluginsFile": "tests/plugins/index.js",
  // 'screenshotsFolder': 'tests/screenshots',
  // "videosFolder": "tests/videos",
  // "projectId": "zt64m4",

  // "numTestsKeptInMemory": 0

  component: {
    specPattern: 'src/components/**/*.test.{js,jsx,ts,tsx}',
    supportFile: 'tests/component/index.ts',
    indexHtmlFile: 'tests/component/index.html',
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
});
