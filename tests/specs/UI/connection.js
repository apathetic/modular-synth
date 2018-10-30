import Connection from '@/components/system/Connection.vue';
// import VCO from '@/components/VCO.vue';
import { cellWidth } from '@/constants';

import mountVue from 'cypress-vue-unit-test';
import { extensions } from '../../support/extensions';
import { wasDisposed, dummy } from '../../support/utils';

// const components = { VCO };
const CONNECTION_DATA = {
  to: { id: 1, port: 1 },
  from: { id: 2, port: 2 }
};

describe('Connection.vue', () => {
  let connection;

  beforeEach(mountVue(Connection, {
    extensions,
    data: CONNECTION_DATA
    // ...components
    // html: '<VCO><Connection><VCO>'
  }));

  context('Base', () => {
    it('can be created from an options object', () => {
      connection = Cypress.vue; // the ref to the component (which was set up in "mountVue")

      // connection.setProps(CONNECTION_DATA);
      expect(connection.toModule).to.equal(200);
      expect(connection.fromModule).to.equal(-20);
      connection.destroy();
    });

    // it('can remove a connection', () => {
    // });

    // it('contains references to the "to" and "from" IDs', () => {
    // });

    it('contains references to the "to" and "from" vue modules', () => {
    });

    it('it removes itself if a connection cannot be made', () => {
    });
  });

  context('Audio', () => {
    it('must be made between different nodes', () => {
    });

    it('routes audio correctly between two AudioNodes', () => {
    });

    it('routes data correctly between data inlet/outlets', () => {
    });

    it('audio outlets cannot connect to data inlets', () => {
    });

    it('audio is disconnected after removing a connection', () => {
    });
  });

  context('Data', () => {
    it('data is disconnected after removing a connection', () => {
    });
  });

  context('UI', () => {
    it('sets its coordinates correctly', () => {
      const toModule = {
        x: 123, y: 45
      };
      const fromModule = {
        x: 67, y: 89
      };

      connection.vm.toModule = toModule;
      connection.vm.fromModule = fromModule;

      expect(connection.vm.x1).toBe(70 + cellWidth);
      expect(connection.vm.y1).toBe(1);
      expect(connection.vm.x2).toBe(1);
      expect(connection.vm.y2).toBe(1);
    });
  });
});
