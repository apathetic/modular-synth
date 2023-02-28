import { reactive } from 'vue';
import { useAppStore} from '@/stores/app';
// import { getCurrentInstance } from 'vue';

const emptyConnector = () => ({
  id: undefined,
  from: {
    id: undefined,
    port: undefined,
  },
  to: {
    id: undefined,
    port: undefined,
  }
});
const activeConnector = reactive(emptyConnector());

/**
 *
 */
export function useConnection() {
  const store = useAppStore();

  function startConnecting(id, port) {
    // const instance = getCurrentInstance(); // gets the current component so we dont need to even pass port, id

    // needed to trigger the `watch` on the activeConnector (in instances where
    // user drags from same port multiple times but doesn't make a connection):
    resetConnector();

    activeConnector.from = { id, port };
		activeConnector.id = store.patch.id;
		store.patch.id++;
  }

  function stopConnecting(id, port) {
    activeConnector.to = { id, port };

    // if this.to.id !== this.from.id &&      // if not circular connection
    //    this.isUnique()                     // is not a duplicated connection

		// else we'd be replacing the same connector in place, as we have this
		// consistent reference to it. Note that we "deep" clone `to` and `from`,
		// as they are Proxy objects
		const connector = Object.assign({}, activeConnector);

		store.addConnection(connector);
  }

  function resetConnector() {
    Object.assign(activeConnector, emptyConnector());
  }

  return {
    startConnecting,
    stopConnecting,
    resetConnector,
    activeConnector
  };
}
