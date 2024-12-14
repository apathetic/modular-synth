import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, getByTestId, getAllByRole, userEvent, selectOptions, fireEvent } from '@testing-library/vue';
import { useAppStore } from '@/stores/app';
import Connection from './Connection.vue';
import type { Connection as ConnectionType } from '@/types';


// connection
// - gets correct inlet: id, port
// - gets correct outlet: id, port
// - find src, dest nodes
// - finds src, dest modules
// - destroys if cannot make a connection
//////// - binds to x1,x2x,y1,y2 / gets module coords
// - can remove a connection
// - handles audio / data types + mix thereof

// xmas 2024:
// when one connection fails they _all_ seem to get deleted
// connecting from the _in_ port, back to something.





const mockModule = defineComponent({
  setup (props, { expose }) {
    const outlets = [
      { label: 'in-1', data: context.createGain() }
      { label: 'in-2', data: vi.fn() }
    ];

    // onMounted(() => storeToRefs.addToRegistry({ id, node: { outlets } }));
    expose({ outlets });

    return { outlets };
  }
});

const mockDestinationModule = defineComponent({
  setup (props, { expose }) {
    return expose({
      inlets: [
        { label: 'in-1', data: context.createGain() }
        { label: 'in-2', data: vi.fn() }
      ]
    });
  }
});

// const src = {
//   node: store.getNode(from.id),
//   module: store.getModule(from.id)
// };

// const dest = {
//   node: store.getNode(to.id),
//   module: store.getModule(to.id)
// };


const mockConnection: ConnectionType = {
  id: 1,
  to: { id: 1, port: 0 },
  from: { id: 2, port: 0 },
};

const mockStore = {
  patchId: 0,
  patches: [{
    modules: [
      { id: 1, type: 'mock' },
      { id: 2, type: 'mock' }
    ],
  }],
  registry: {
    1: mockModule,
    2: mockModule,
  }
};

vi.mock('@/stores/app', async () => {
  return {
    useAppStore: () => mockStore
  };
});


app.component('mock', mockModule);






describe.skip('Connection', () => {

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


});
