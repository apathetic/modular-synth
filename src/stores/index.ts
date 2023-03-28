import { watch, type App } from 'vue';
import { createPinia } from 'pinia';
import { useAppStore } from './app';
import type { AppState } from '@/types';


const debounce = (fn: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

// persist the whole state to the local storage whenever it changes
const persistState = debounce((state) => {
  // ideally this woul be a watchi inside the appStore
  localStorage.setItem('patches', JSON.stringify(state.app.patches));
	console.log('saving...');
}, 2000);


const createStore = (app) => {
  const pinia = createPinia();

  watch(pinia.state, persistState, { deep: true });
  app.use(pinia);
}

export {
  createStore,
  useAppStore
};
