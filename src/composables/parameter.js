import { watch, ref, onUnmounted } from 'vue';
import { useAppStore } from '@/stores/app';
import { mapState } from 'pinia';
import { EVENT } from '../events';


export function useParameter(props) {
  const { id, param, min, max, mode } = Object.assign({
    mode: 'linear',
		min: 0,
		max: 1
	}, props);

  const store = useAppStore();
  const normalized = ref(0); // 0 -> 1 internally
  const mapped = ref(0);
  const range = max - min;
  let active = false;
  let startValue = 0;
  let startY = null;

	console.log('TODO add watch eager (or whatever itscalled)');
  watch(() => store.configId, () => { // fetchValue
    /**
     * Update values when the `parameterKey` changes.
     * Fetches the value from the store (if it exists) or uses the default value.
     * NOTE: this is only necessary when the parameterSet does *not* contain values for
     * all parameters.
     */
    mapped.value = store.parameters[id] || props.default || 0;
    normalized.value = extractValue(mapped.value);
    console.log('%c[parameter] %s %s set to %f', 'color: orange', id, param, mapped.value);
  });

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


  /**
   * Set up calculations for updating new knob values.
   * @param {Event} e The mouse down Event.
   */
  function start(e) {
    window.mouseDown = true;
    active = true;
    startValue = normalized.value;
    startY = e.clientY;
  }

  /**
   * Updates new knob values on mouse move.
   * @param {Event} e The mouse move Event.
   */
  function update(e) {
    const delta = (startY - e.clientY) / 100.0; // drag distance, 1/100th pixels
    const value = Math.min(1, Math.max(0, startValue + delta));

    if (normalized.value === value) return;

    normalized.value = value;
    mapped.value = computeValue(value);
		store.setParameter({ id, value: mapped.value }); // or watch. or computed.
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




  onUnmounted(() => {
    // this.$store.commit('REMOVE_PARAMETER', this.id);
		store.removeParameter(id);
    // // this.$bus.$off(EVENT.PARAMETERS_LOAD, this.fetchValue);
    window.removeEventListener(EVENT.MOUSE_UP, mouseup);
    window.removeEventListener(EVENT.MOUSE_MOVE, mousemove);

    console.log('%c[parameter] Destroying %s %s', 'color: grey', id, param);
  });


  // // this.$store.commit('REGISTER_PARAMETER', this.id);

  //  // this.$bus.$on(EVENT.PARAMETERS_LOAD, this.fetchValue);

  console.log('%c[parameter] Creating %s %s', 'color: lightblue', param); // , type);


  return {
    start,
    mapped,
    normalized
  }
}
