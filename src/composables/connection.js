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
    resetConnector(); // needed to trigger the `watch` on the activeConnector (in instances where user drags from same port multiple times but doesn't make a connection)
    activeConnector.from = { id, port };
  }

  function stopConnecting(id, port) {
    console.log('stop', id, port);
		activeConnector.to = { id, port };

		// if this.to.id !== this.from.id &&            // if not circular connection
		//    this.isUnique()                           // is not a duplicated connection
		store.addConnection(activeConnector);
  }

  function resetConnector() {
    // activeConnector.port = undefined;
    // activeConnector.id = undefined;
    Object.assign(activeConnector, emptyConnector());
  }

  return {
    startConnecting,
    stopConnecting,
    resetConnector,
    activeConnector
  };
}
