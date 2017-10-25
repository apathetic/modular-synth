import { shallow, createLocalVue } from 'vue-test-utils'
import { createRenderer } from 'vue-server-renderer'
import { cellWidth } from '../../src/dimensions';
import { Util, Node } from '../utils';
import Synth from '@/Synth.vue';
import _Node from '@/components/Node.vue';
import Connection from '@/components/UI/Connection.vue';

const dummyVue = createLocalVue();

const App = shallow(Synth, {
  stubs: {
    Node,
    Connection
  }
})

describe('connector.vue', () => {
  let connector;

  beforeEach(() => {
    connector = shallow(Connection, { });
  });

  it('can be created from an options object', () => {
    connector.setProps({
      to: {
        id: 1
        port: 1
      },
      from: {
        id: 2,
        port: 2
      }
    });
    expect(connector.toModule).to.equal(200);
    expect(connector.fromModule).to.equal(-20);
    connector.destroy();
  });

  // it('can remove a connection', () => {
  // });

  // it('contains references to the "to" and "from" IDs', () => {
  // });

  it('contains references to the "to" and "from" vue modules', () => {
  });

  it('it removes itself if a connection cannot be made', () => {
  });

  it('a connection must be made between different nodes', () => {
  });

  it('routes audio correctly between two AudioNodes', () => {
  });

  it('routes data correctly between a data inlet/outlet', () => {
  });

  it('audio outlets cannot connect to data inlets', () => {
  });

  it('audio is disconnected after removing a connection', () => {
  });

  it('sets its coordinates correction', () => {
    const toModule = {
      x: 123, y: 45
    };
    const fromModule = {
      x: 67, y: 89
    };

    connector.vm.toModule = toModule;
    connector.vm.fromModule = fromModule;

    expect(connector.vm.x1).toBe(70 + cellWidth);
    expect(connector.vm.y1).toBe(xxx);
    expect(connector.vm.x2).toBe(xxx);
    expect(connector.vm.y2).toBe(xxx);
  })


});
