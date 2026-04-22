import { watch } from 'vue';
import { createPinia } from 'pinia';
import { useAppStore } from '@/stores/app';
import { validateData } from '@/utils/validatePatch';
import { STORAGE_KEY, serializePatches } from '@/utils/persistence';
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

// persist patches to localStorage whenever the store state changes.
const persistState = debounce((state: any) => {
  try {
    const body = serializePatches(state.app.patches);
    localStorage.setItem(STORAGE_KEY, body);
  } catch (err) {
    console.error('[persistState] write failed:', err);
    return;
  }

  try {
    if (!validateData(state.app.patches)) {
      console.error('Invalid patch:', state.app.patches);
    }
  } catch (err) {
    console.warn('[persistState] validateData threw:', err);
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
