// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

/**
 * Test that user can login and see dashboard.
 */
module.exports = {
  'Sortable tests': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#modules', 1000)

      // Assert that App can sort modules in play mode

      // Assert that sortable works after load

      // Assert that sortable works after adding a module

      // Assert that sortable works after removing a module


      .pause(2000)
      .end()
  }
}
