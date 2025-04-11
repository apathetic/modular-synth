import { watch } from 'vue';
import { createPinia } from 'pinia';
import { useAppStore } from './app';
import { validateData } from '@/utils/validatePatch';
import type { App as Application } from 'vue';


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
const persistState = debounce((state: any) => {
  localStorage.setItem('patches', JSON.stringify(state.app.patches));

  if (!validateData(state.app.patches)) {
    console.error('Invalid patch:', state.app.patches);
  }

	console.log('saving...');
}, 2000);


const createStore = (app: Application) => {
  const pinia = createPinia();

  watch(pinia.state, persistState, { deep: true });
  app.use(pinia);
};


export {
  createStore,
  useAppStore
};
