// DUMMY FILE FOR EXAMPLE USAGE ONLY. NOT RELEVANT TO THE APP!


module.exports = {
  'App tests': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('.message', 1000)
      .pause(1000) // wait for whatever

      // Assert that App loads default patches

      // Assert that user can load a patch

      // Assert that user can save a patch

      // Assert that audio is routed correctly after load

      // Assert that user can drag module in edit mode



      .end()
  }
}
