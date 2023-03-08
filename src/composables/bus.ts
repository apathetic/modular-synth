/*
import { ref } from 'vue';
const bus = ref(new Map());
export default function useEventsBus(){
	function emit(event, ...args) {
		bus.value.set(event, args);
	}
	return {nemit, bus }
}
*/
/**
 * @see https://github.com/vueuse/vueuse/blob/main/packages/core/useEventBus/index.ts
 */

import { getCurrentScope } from 'vue';

const events = new Map();

export type EventBusListener<T = unknown, P = any> = (event: T, payload?: P) => void;
export type EventBusEvents<T, P = any> = EventBusListener<T, P>[];
export type EventBusIdentifier<T = unknown> = EventBusKey<T> | string | number;

export interface EventBusKey<T> extends Symbol { }

export interface UseEventBusReturn<T, P> {
  /**
   * Subscribe to an event. When calling emit, the listeners will execute.
   * @param listener watch listener.
   * @returns a stop function to remove the current callback.
   */
  on: (listener: EventBusListener<T, P>) => Fn
  /**
   * Emit an event, the corresponding event listeners will execute.
   * @param event data sent.
   */
  emit: (event?: T, payload?: P) => void
  /**
   * Remove the corresponding listener.
   * @param listener watch listener.
   */
  off: (listener: EventBusListener<T>) => void

}


export function useEventBus<T = unknown, P = any>(key: EventBusIdentifier<T>): UseEventBusReturn<T, P> {
  const scope = getCurrentScope();

  function on(listener: EventBusListener<T, P>) {
    const listeners = events.get(key) || [];
    const _off = () => off(listener);

    listeners.push(listener);
    events.set(key, listeners);
    scope?.cleanups?.push(_off);
    return _off;
  }

  function off(listener: EventBusListener<T>): void {
    const listeners = events.get(key);
    if (!listeners) {
      return;
    }

    const index = listeners.indexOf(listener);
    if (index > -1)
      listeners.splice(index, 1)
    if (!listeners.length)
      events.delete(key)
  }

  function emit(event?: T, payload?: P) {
    events.get(key)?.forEach(v => v(event, payload));
  }

  return { on, off, emit }
}

