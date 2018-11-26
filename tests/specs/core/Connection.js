import Connection from '@/components/system/Connection.vue';
import Module from '@/components/system/Module.vue';
import Node from '@/components/test/Node.vue';
import { cellWidth } from '@/constants';

import mountVue from 'cypress-vue-unit-test';
import { extensions } from '../../support/extensions';
import { wasDisposed } from '../../support/utils';


describe('Connection.vue', () => {
  let connection;

  const template = `
    <div>
      <Connection
        :to="to"
        :from="from">
      </Connection>
      <Node :id="1"></Node>
      <Node :id="2"></Node>
    </div>`;

  const data = {
    to: { id: 1, port: 1 },
    from: { id: 2, port: 2 }
  };

  const components = {
    Connection,
    Node
  };

  beforeEach(mountVue({ template, data, components }, {
    extensions
  }));


  context('Base', () => {
    it('can be created', () => {
      connection = Cypress.vue; // the ref to the component (which was set up in "mountVue")
    });

    it('can be destroyed', () => {
      connection = Cypress.vue;

      cy.spy(connection, 'removeConnection');

      // do thing.

      expect(connection.removeConnection).to.be.called;
      // expect $store mutation to have been called.
    });


    it('resolves references to "to" and "from" nodes', () => {
      connection = Cypress.vue; // the ref to the component (which was set up in "mountVue")

      // connection.setProps(CONNECTION_DATA);
      expect(connection.toModule).to.equal(200);
      expect(connection.fromModule).to.equal(-20);
      connection.destroy();
    });

    it('can connect to MasterOut', () => {

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
    it('should render correct (SVG) contents', () => {
      cy.get('line').snapshot();

      // throw Error('need content snapshot'); // TODO
    });

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
