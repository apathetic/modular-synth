import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, getByTestId, getAllByRole, userEvent, selectOptions, fireEvent } from '@testing-library/vue';
import { useAppStore } from '@/stores/app';
import { state as blank } from '@/stores/patch';
import PatchManager from './PatchManager.vue';


let mockStore;
const mockPatch = blank();

vi.mock('@/stores/app', async () => {
  return {
    useAppStore: () => ({
      // state
      isEditing: false,
      patches: [mockPatch],
      patchId: 0, // UGH this should be index not id
      configId: 0, // UGH this should be index not id

      // getters
      patch: mockPatch,
      configs: mockPatch.configs,
      config: mockPatch.configs[0],

      // actions
      loadPatch: vi.fn(),
      savePatch: vi.fn(),
      addPatch: vi.fn(),
      removePatch: vi.fn(),
      addConfig: vi.fn(),
      removeConfig: vi.fn(),
    })
  };
});



describe('PatchManager.vue', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe.only('Patches: ', () => {
    it.skip('loads a default patch', () => {
      render(PatchManager);

      // const selects = getAllByRole('option', { name: '<blank>' });
      // expect(selects[0].selected).toBe(true);

      // cy.contains('.patch option', '<blank>');
      expect(screen.getByRole('option', { name: '<blank>' }).selected).toBe(true);

      // cy.contains('.params option', '<blank>');
      expect(screen.getByRole('option', { name: '<blank>' }).selected).toBe(true);
    });

    it('can load a patch', async () => {
      render(PatchManager);
      const patches = screen.getByTestId('patch');
      await fireEvent.update(patches, { target: { value: 0 } })

      expect(mockStore.loadPatch).toBeCalled();
    });

    it('in play mode, cannot add nor remove', () => {
      mockStore.isEditing = false;

      render(PatchManager);
      const buttons = screen.queryAllByRole('button');

      buttons.forEach((button) => {
        expect(button).toHaveProperty('disabled', true);
      });
    });

    it('in edit mode, can add a new patch', async () => {
      mockStore.isEditing = true;

      render(PatchManager);
      const add = screen.getByTitle('add patch');
      await fireEvent.click(add);

      expect(mockStore.addPatch).toBeCalled();
    });

    it('in edit mode, can remove a patch', async () => {
      window.confirm = vi.fn(() => true);
      mockStore.isEditing = true;
      mockStore.patches = [blank(), blank()];

      render(PatchManager);
      const remove = screen.getByTitle('remove patch');
      await fireEvent.click(remove);

      expect(mockStore.removePatch).toHaveBeenCalledTimes(1);
      expect(mockStore.removePatch).toHaveBeenCalledWith(mockStore.patchId);
    });

    it('in edit mode, can not remove last patch', async () => {
      window.confirm = vi.fn(() => true);
      mockStore.isEditing = true;
      mockStore.patches = [blank()]; // only 1 patch

      render(PatchManager);
      const remove = screen.getByTitle('remove patch');
      await fireEvent.click(remove);

      expect(mockStore.removePatch).toHaveBeenCalledTimes(0);
    });

    it.skip('in edit mode, can edit the patch name', () => {

    });
  });

  describe('Parameters', () => {
    it('can load a parameter config', () => {});
    it('in edit mode, can add a new parameter config', () => { });
    it('in edit mode, can remove a parameter config', () => { });
    it('in edit mode, can edit the parameter config name', () => { });

    it('connections are connected upon loading a patch', () => {});
    it('parameters are applied upon loading a patch', () => {});
  });

  describe('UI', () => {
    it.only('renders the correct content', async () => {
      mockStore.patches = [{
        ...blank(),
        name: 'test-o',
        configs: [{ name: 'supasynth' }]
      }];

      render(PatchManager);

      // const patches = screen.getByTestId('patch');
      // await fireEvent.select(patches, { target: { value: 0 } }); // select first patch

      expect(screen.getByText('test-o')).toBeTruthy();
      expect(screen.getByText('supasynth')).toBe////InTheDocument();



    });

    it('updates display when new patch is selected', () => {
      render(PatchManager);

      // patchmanager

    });
  });
});
