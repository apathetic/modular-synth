import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { provideModuleId, useModuleId } from '../moduleId';

beforeEach(() => {
  // `mount` funnels thrown errors from setup() through Vue's warn channel;
  // silence it so the "throws" test doesn't pollute the test output.
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderWithProvider(id: number) {
  let captured: number | undefined;

  const Child = defineComponent({
    setup() {
      captured = useModuleId();
      return () => h('div');
    },
  });

  const Parent = defineComponent({
    props: { moduleId: { type: Number, required: true } },
    setup(props) {
      provideModuleId(props.moduleId);
      return () => h(Child);
    },
  });

  const wrapper = mount(Parent, { props: { moduleId: id } });
  return { captured: () => captured, wrapper };
}

describe('useModuleId', () => {
  it('returns the id provided by an ancestor via provideModuleId', () => {
    const { captured } = renderWithProvider(7);
    expect(captured()).toBe(7);
  });

  it('supports 0 as a valid module id (MasterOut)', () => {
    // Using `=== undefined` rather than a truthy check is load-bearing here:
    // MasterOut has `id: 0`, which would be lost by a naive falsy guard.
    const { captured } = renderWithProvider(0);
    expect(captured()).toBe(0);
  });

  it('throws when no provider is in scope', () => {
    // Orphan mount is a programmer error (control rendered outside a Unit
    // or Unit forgot to provide) — surface it loudly instead of silently
    // degrading to an `undefined-*` parameter key.
    const Orphan = defineComponent({
      setup() {
        useModuleId();
        return () => h('div');
      },
    });

    expect(() => mount(Orphan)).toThrow(
      /\[useModuleId\] no module id in scope/,
    );
  });

  it('nearest ancestor wins when providers are nested', () => {
    let captured: number | undefined;

    const Leaf = defineComponent({
      setup() {
        captured = useModuleId();
        return () => h('div');
      },
    });

    const Inner = defineComponent({
      setup() {
        provideModuleId(99);
        return () => h(Leaf);
      },
    });

    const Outer = defineComponent({
      setup() {
        provideModuleId(1);
        return () => h(Inner);
      },
    });

    mount(Outer);
    expect(captured).toBe(99);
  });
});
