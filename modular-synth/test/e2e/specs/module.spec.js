// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

/**
 * Test that user can login and see dashboard.
 */
module.exports = {
  'module e2e tests': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#modules', 1000)
      .assert.elementPresent('#controls')


      // Assert that user can add a new module (and store is updated)
      .click('#controls .button:nth-child(2)')    // add OSC ...
      .pause(1000)
      .assert.count('.module', 1)                 // ... there should be 1 module

      // assert that user can remove a module
      .click('.module')                           // select it
      .keys(46)                                   // 'Delete'
      .assert.count('.module', 0)                 // ... there should be 1 module

      // assert that connections are cleaned up after removing a module


      .pause(2000)
      .end()
  }
}
