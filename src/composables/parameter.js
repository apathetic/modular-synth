import { watchEffect, ref, onUnmounted } from 'vue';
import { useAppStore } from '@/stores/app';
import { log } from '@/utils/logger';


/**
 * Bind a UI control (knob/slider/…) to a parameter leaf on the active preset.
 * Parameters are stored as `preset.parameters[moduleId][param]`.
 *
 * @param {Object}  props
 * @param {number}  props.moduleId  owning module id (from `useModuleId()`)
 * @param {string}  props.param     parameter name (e.g. 'freq', 'attack')
 * @param {string}  props.type      UI type label, used only for logging
 * @param {number} [props.min=0]
 * @param {number} [props.max=1]
 * @param {string} [props.mode='linear']   'linear' | 'log'
 * @param {number} [props.default]
 */
export function useParameter(props) {
  const { moduleId, param, type, min, max, mode } = Object.assign({
    mode: 'linear',
    min: 0,
    max: 1,
  }, props);

  const store = useAppStore();
  const normalized = ref(0); // 0 -> 1 internally
  const mapped = ref(props.default ?? min);
  const range = max - min;
  let active = false;
  let startValue = 0;
  let startY = null;

  const str = `${type} ${moduleId}.${param}`;
  log({ type:'parameter', action:'creating', data: str });

  // No default seeding: the preset holds values the user has overridden.
  // Until someone writes, `mapped.value` stays at `props.default ?? min`
  // and the watchEffect below is a no-op.

  // TODO: avoid dupl w/ every knob? ie. one mouseup listener in the App, or: just add / remove dynamically as needed?
  const mouseup = () => {
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

  window.addEventListener('mouseup', mouseup);
  window.addEventListener('mousemove', mousemove);


  onUnmounted(() => {
    window.removeEventListener('mouseup', mouseup);
    window.removeEventListener('mousemove', mousemove);

    log({ type:'parameter', action:'destroying', data: str });
  });


  watchEffect(() => {
    const value = store.getParameter(moduleId, param);

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
    store.setParameter({ moduleId, param, value: computeValue(value) });
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
