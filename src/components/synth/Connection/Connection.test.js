import Connection from './Connection.vue';
// import Connecting from '@/components/synth/Connecting.vue';

import Unit from '@/components/synth/Unit.vue';  // Connection expects the audio node to be wrapped in this guy
// import Node from '@/components/test/Node.vue';


// connection
// - gets correct inlet: id, port
// - gets correct outlet: id, port
// - find src, dest nodes
// - finds src, dest modules
// - destroys if cannot make a connection
// - binds to x1,x2x,y1,y2 / gets module coords
// - can remove a connection
// - handles audio / data types + mix thereof


describe.skip('Connection', () => {


  const template = `
    <div>
      <Connection
        :id="10"
        :to="to"
        :from="from">
      </Connection>

      <Module :module="node1"></Module>
      <Module :module="node2"></Module>
    </div>`;

  const data = {
    to: { id: 1, port: 0 },         // connection data
    from: { id: 2, port: 1 },       // connection data

    node1: { id: 1, type: 'Node' }, // Test data
    node2: { id: 2, type: 'Node' }  // Test data
  };

  const components = {
    Connection,
    Module,
    Node
  };

  beforeEach(mountVue({ template, data, components }, {
    extensions
  }));


  context('Base', () => {
    it('can be created', () => {
      connection = Cypress.vue; // the ref to the APP
                                // HOW do get the component (which was set up in "mountVue") ?
      connection = connection.$children[0];
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
