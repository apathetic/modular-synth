import { inject, provide, type InjectionKey } from 'vue';

/**
 * Injection key for the active module's numeric id. Private to this module —
 * all reads/writes go through `provideModuleId` / `useModuleId` so the
 * "no provider in scope" failure can be detected in exactly one place.
 */
const MODULE_ID_KEY: InjectionKey<number> = Symbol('moduleId');

/**
 * Broadcast the owning module's id to every descendant parameter control.
 * Called once per rack unit by `Unit.vue`.
 */
export function provideModuleId(id: number): void {
  provide(MODULE_ID_KEY, id);
}

/**
 * Retrieve the enclosing module's id. Throws if no provider is in scope —
 * this is always a programmer error (a parameter control mounted outside a
 * `Unit`, or `Unit.vue` forgot to call `provideModuleId`), never a runtime
 * condition the UI should try to recover from.
 */
export function useModuleId(): number {
  const id = inject(MODULE_ID_KEY);
  if (id === undefined) {
    throw new Error(
      '[useModuleId] no module id in scope — parameter controls must be rendered inside a Unit that calls provideModuleId().',
    );
  }
  return id;
}
