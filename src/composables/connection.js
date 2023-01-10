import { computed } from 'vue';

export function useConnection() {
  const activeConnector = computed(() => ({}) );

  function initSorting(container) {
	}

	return {
    activeConnector
	};
}
