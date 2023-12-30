import { watch, watchEffect, ref, onUnmounted } from 'vue';
import { mapState } from 'pinia';
import { useAppStore } from '@/stores/app';
import { log } from '@/utils/logger';
import { EVENT } from '../events';


export function useParameter(props) {
  const { id, type, min, max, mode } = Object.assign({
    mode: 'linear',
		min: 0,
		max: 1
	}, props);

  const store = useAppStore();
  const normalized = ref(0); // 0 -> 1 internally
  const mapped = ref(props.default || min);
  const range = max - min;
  let active = false;
  let startValue = 0;
  let startY = null;

  const str = `${type} (${id})`;
  log({ type:'parameter', action:'creating', data: str });


  store.setParameter({ id, value: mapped.value });


  // TODO: avoid dupl w/ every knob? ie. one mouseup listener in the App, or: just add / remove dynamically as needed?
  const mouseup = (e) => {
    window.mouseDown = false;
    active = false;

    document.body.style.webkitUserSelect = 'auto';
    document.body.style.userSelect = 'auto';
  };

  const mousemove = (e) => {
    if (window.mouseDown && active) {
      update(e);
    }
  };

  window.addEventListener(EVENT.MOUSE_UP, mouseup);
  window.addEventListener(EVENT.MOUSE_MOVE, mousemove);


  onUnmounted(() => {
    // this called when the component is explicity removed
    // and also when it's just cleaned up due to patch change
		store.removeParameter(id);
    window.removeEventListener(EVENT.MOUSE_UP, mouseup);
    window.removeEventListener(EVENT.MOUSE_MOVE, mousemove);

    log({ type:'parameter', action:'destroying', data:str });
  });


  watchEffect(() => {
    const value = store.parameters[id];

    if (value !== undefined) {
      mapped.value = value;
      normalized.value = extractValue(value);
      log({ type:'parameter', action:'setting', data:`${str} to ${value}` });
    }
  });


  /**
   * Set up calculations for updating new knob values.
   * @param {MouseEvent} e The mouse down Event.
   */
  function start(e) {
    window.mouseDown = true;
    active = true;
    startValue = normalized.value;
    startY = e.clientY;
  }

  /**
   * Updates new knob values on mouse move.
   * @param {MouseEvent} e The mouse move Event.
   */
  function update(e) {
    const delta = (startY - e.clientY) / 100.0; // drag distance, 1/100th pixels
    const value = Math.min(1, Math.max(0, startValue + delta));

    if (normalized.value === value) return;

    normalized.value = value;
    store.setParameter({ id, value: computeValue(value) });
  }

  /**
   * Maps the normalized value to the desired range.
   * Linear or exponential.
   * @param {number} n The value to map.
   */
  function computeValue(n) {
    return parseFloat(mode === 'log'
      ? range * Math.pow(2, n) - range + min
      : n * range + min
    );
  }

  /**
   * Normalizes the actual value to between 0 and 1.
   * This performs the opposite function as above.
   * @param {number} n The value to normalize
   */
  function extractValue(n) {
    return parseFloat(mode === 'log'
      ? Math.log2((n + range - min) / range)
      : (n - min) / range
    );
  }

  return {
    start,
    mapped,
    normalized
  }
}
