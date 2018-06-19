## Cypress
Note, not using it for E2E tests (although, could easily add in the future). Rather, using it for integration / CI testing. 

The reason it's Cypress (and not Jest, JSDOM, etc) is that we need this to run in an actual browser -- JSDOM does not have support for WebAudio.

## Config
As such, we need to load components into the Cypress environment. For this, we use
a custom webpack config in order to load/compile `.vue` components. Check the `plugins/index.js` file for details. `VuePluginLoader` is used to process `.vue` files, and there are loaders _for any other items_ in the Vue SFC i.e. `ts` and `sass` as well.

## Testing utils 
The application also makes use of `cypress-vue-unit-test` in preference to the vue-test-utils. The two are similar, but the former runs tests in the actual browser which, again, is necessary to leverage the Webaudio API.

