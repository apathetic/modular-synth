import { shallow, mount } from 'vue-test-utils';
import { createRenderer } from 'vue-server-renderer';
import Node from '@/components/Node.vue';

describe('Node.vue', () => {




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
