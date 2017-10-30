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

describe('connection.vue', () => {
  let connection;

  beforeEach(() => {
    connection = shallow(Connection, { });
  });

  it('can be created from an options object', () => {
    connection.setProps({
      to: {
        id: 1,
        port: 1
      },
      from: {
        id: 2,
        port: 2
      }
    });
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

  it('data is disconnected after removing a connection', () => {
  });

  it('sets its coordinates correction', () => {
    const toModule = {
      x: 123, y: 45
    };
    const fromModule = {
      x: 67, y: 89
    };

    connection.vm.toModule = toModule;
    connection.vm.fromModule = fromModule;

    expect(connection.vm.x1).toBe(70 + cellWidth);
    expect(connection.vm.y1).toBe(xxx);
    expect(connection.vm.x2).toBe(xxx);
    expect(connection.vm.y2).toBe(xxx);
  })


});
