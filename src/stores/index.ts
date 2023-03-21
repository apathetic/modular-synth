import { createPinia } from 'pinia';
import { watch } from 'vue';


const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
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


export { useAppStore } from './app';
export function createStore(app) {
  const pinia = createPinia();

  watch(pinia.state, persistState, { deep: true });

  app.use(pinia);
}
