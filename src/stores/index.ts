import { watch } from 'vue';
import { createPinia } from 'pinia';
import { useAppStore } from '@/stores/app';
import { validateData } from '@/utils/validatePatch';
import { STORAGE_KEY, serializePatches } from '@/utils/persistence';
import type { App as Application } from 'vue';


const debounce = <Args extends unknown[]>(fn: (...args: Args) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Persist the patches slice to localStorage. Validates BEFORE writing so we
 * never overwrite a good blob with a corrupted one — if validation fails the
 * previous disk state is left untouched and the error is surfaced. The next
 * settled state will get its own write.
 */
const persistState = debounce((patches: Patch[]) => {
  try {
    if (!validateData(patches)) {
      console.warn('[persistState] patches failed schema validation; skipping write');
      return;
    }
  } catch (err) {
    console.warn('[persistState] validateData threw; skipping write:', err);
    return;
  }

  let body: string;
  try {
    body = serializePatches(patches);
  } catch (err) {
    console.error('[persistState] serialize failed:', err);
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, body);
  } catch (err) {
    console.error('[persistState] write failed:', err);
  }
}, 2000);


const createStore = (app: Application) => {
  const pinia = createPinia();
  app.use(pinia);

  // Narrow watcher: only the patches slice triggers persistence. Transient UI
  // state (activeId, hoveredId, patch alias, session, etc.) and the runtime
  // audio registry are intentionally excluded — they change constantly during
  // normal interaction and never need to hit disk.
  const store = useAppStore();
  watch(() => store.patches, (patches) => persistState(patches), { deep: true });
};


export {
  createStore,
  useAppStore
};
