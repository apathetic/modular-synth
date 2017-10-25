// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

/**
 * Test that user can login and see dashboard.
 */
module.exports = {
  'Connector tests': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#modules', 5000)

      // Assert that user can create a connection.

      // Assert that user can remove a connection.

      // Assert that audio is routed correctly after a new connection

      // Assert that audio is disconnected after removing a connection

      .pause(2000)
      .end()
  }
}
