// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

/**
 * Test that user can login and see dashboard.
 */
module.exports = {
  'Module tests': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#modules', 1000)
      .assert.elementPresent('#controls')


      // Assert that user can add a new module (and store is updated)
      .click('#controls .button:nth-of-type(3)')     // add OSC. Not sure why 3, though... (it's not 3rd)
      .pause(1000)
      .assert.elementCount('#modules .module', 1)    // ... there should be 1 module. (MasterOut is in #controls)


      // Assert that user can remove a module
      .click('.module')                              // select it
      .keys([browser.Keys.DELETE])
      .pause(1000)
      .assert.elementCount('#modules .module', 0)    // ...there should be 0 modules


      // Assert that connections are cleaned up after removing a module



      // .pause(2000)
      .end()
  }
}
