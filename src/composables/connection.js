import { reactive } from 'vue';
// import { getCurrentInstance } from 'vue';

const activeConnector = reactive({
	port: undefined,
	id: undefined
});

export function useConnection() {

  function startConnecting(port, id) {
    // const instance = getCurrentInstance();
    console.log(port, id); //, instance?.parent); //
    activeConnector.port = port;
    activeConnector.id = id;
	}

	return {
    startConnecting,
    activeConnector
	};
}
