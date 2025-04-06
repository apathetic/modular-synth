import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, getByTestId, within, fireEvent, cleanup } from '@testing-library/vue';
import { setActivePinia, createPinia } from 'pinia';
import { createAppStore, useAppStore } from '@/stores/app';
import PatchManager from './PatchManager.vue';
import { state as blank } from '@/stores/patch';


import { nextTick } from 'vue';



vi.mock('@/stores/app', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAppStore: vi.fn()
  };
});

// Create a custom store factory for tests
const createTestStore = (initialPatches = [blank()]) => {
  const store = createAppStore({ patches: initialPatches })();

  // Set initial patchId to 0 to ensure the patch is loaded
  store.patchId = 0;

  // Mock loadPatch to avoid audio node creation
  store.loadPatch = vi.fn((id) => {
    store.patchId = id;
    store.configId = 0;
  });

  return store;
};

describe('PatchManager.vue', () => {
  let mockStore;

  beforeEach(() => {
    setActivePinia(createPinia())

    // Create a fresh test store before each test
    // NOTE: This mockStore is used as the mockReturnValue, below.
    //       This means that you CANNOT reset the reference in a test (ie. mockStore = createTestStore())
    //       However, you can modify the reference (only).
    mockStore = createTestStore();

    // Update the useAppStore mock to return our test store
    useAppStore.mockReturnValue(mockStore);

    // Mock window.confirm for tests that involve confirmation dialogs
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('Patches: ', () => {
    it('loads a default patch', () => {
      render(PatchManager);

      const patch = screen.getByTestId('patch');
      const patchInput = within(patch).getByRole('textbox');
      expect(patchInput.value).to.equal('untitled');

      const params = screen.getByTestId('params');
      const paramsInput = within(params).getByRole('textbox');
      expect(paramsInput.value).to.equal('<blank>');
    });

    it('can load a patch', () => {
      render(PatchManager);

      expect(mockStore.loadPatch).toHaveBeenCalledTimes(1); // by default

      const patch = screen.getByTestId('patch');
      const dropdown = within(patch).getByRole('combobox');

      fireEvent.update(dropdown, { target: { value: 0 } });
      expect(mockStore.loadPatch).toHaveBeenCalledTimes(2);
    });

    it('in play mode, cannot add nor remove', () => {
      mockStore.isEditing = false;

      render(PatchManager);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        expect(button.disabled).to.be.true;
      });
    });

    it('in edit mode, can add a new patch', () => {
      mockStore.isEditing = true;
      const addPatchSpy = vi.spyOn(mockStore, 'addPatch');

      render(PatchManager);

      const add = screen.getByTitle('add patch');
      fireEvent.click(add);

      expect(addPatchSpy).toHaveBeenCalledTimes(1);
    });

    it('in edit mode, can remove a patch', () => {
      // Setup test with 2 patches and editing enabled
      mockStore.patches = [blank(), blank()];
      mockStore.isEditing = true;

      render(PatchManager);

      // spy on the removePatch function, then trigger it
      const removePatchSpy = vi.spyOn(mockStore, 'removePatch');
      const remove = screen.getByTitle('remove patch');
      fireEvent.click(remove);

      // Verify removePatch was called with correct arguments
      expect(removePatchSpy).toHaveBeenCalledTimes(1);
      expect(removePatchSpy).toHaveBeenCalledWith(0);
    });

    it('in edit mode, can not remove last patch', () => {
      mockStore.isEditing = true;

      render(PatchManager);

      const removePatchSpy = vi.spyOn(mockStore, 'removePatch');
      const remove = screen.getByTitle('remove patch');
      fireEvent.click(remove);

      expect(removePatchSpy).not.toHaveBeenCalled();
    });

    it('in edit mode, can edit the patch name and parameters name', () => {
      mockStore = createTestStore([{
        ...blank(),
        name: 'original',
        configs: [{ name: 'original-config', parameters: {} }]
      }]);
      mockStore.isEditing = true;

      render(PatchManager);

      const patch = screen.getByTestId('patch');
      const patchname = within(patch).getByRole('textbox');
      fireEvent.update(patchname, 'rando');
      expect(mockStore.patch.name).to.equal('rando');

      const params = screen.getByTestId('params');
      const paramsname = within(params).getByRole('textbox');
      fireEvent.update(paramsname, 'paramtasatic');
      expect(mockStore.config.name).to.equal('paramtasatic');
    });
  });

  describe('Parameters', () => {
    it.skip('can load a set of parameters', async () => {
      mockStore.patches[0].configs = [
        {'name':'wheee', 'parameters': {}},
        {'name':'huzzah','parameters': {}}
      ];

      render(PatchManager);

      const params = screen.getByTestId('params');
      const paramsInput = within(params).getByRole('textbox');

      // Input text should match the first config's name
      expect(paramsInput.value).to.equal('wheee');

      // Select the second config from the dropdown
      const dropdown = within(params).getByRole('combobox');
      fireEvent.update(dropdown, { target: { value: '1' } });

      // Verify the input text was updated to the new config name
      expect(paramsInput.value).to.equal('huzzah');
    });

    it('in edit mode, can add a new parameter config', () => {
      mockStore.isEditing = true;
      const addConfigSpy = vi.spyOn(mockStore, 'addConfig');

      render(PatchManager);

      const add = within(screen.getByTestId('params')).getByTitle('add config');
      fireEvent.click(add);

      expect(addConfigSpy).toHaveBeenCalledTimes(1);
    });

    it('in edit mode, can remove a parameter config', () => {
      mockStore.patches[0].configs = [
        {'name':'config1', 'parameters': {}},
        {'name':'config2', 'parameters': {}}
      ];
      mockStore.isEditing = true;

      render(PatchManager);

      const removeConfigSpy = vi.spyOn(mockStore, 'removeConfig');
      const remove = within(screen.getByTestId('params')).getByTitle('remove config');
      fireEvent.click(remove);

      expect(removeConfigSpy).toHaveBeenCalledTimes(1);
      expect(removeConfigSpy).toHaveBeenCalledWith(mockStore.configId);
    });

    it('in edit mode, can edit the parameters name', () => {
      mockStore.isEditing = true;

      render(PatchManager);

      const params = screen.getByTestId('params');
      const paramsname = within(params).getByRole('textbox');
      fireEvent.update(paramsname, 'paramtasatic');
      expect(mockStore.config.name).to.equal('paramtasatic');
    });

    it('cannot remove last parameter config', () => {
      mockStore.isEditing = true;

      const removeConfigSpy = vi.spyOn(mockStore, 'removeConfig');

      render(PatchManager);

      const remove = within(screen.getByTestId('params')).getByTitle('remove config');
      fireEvent.click(remove);

      expect(removeConfigSpy).not.toHaveBeenCalled();
    });
  });

  describe('UI', () => {
    it('renders the correct content', () => {
      mockStore.patches[0].name = 'test-o';
      mockStore.patches[0].configs[0].name = 'supasynth';

      render(PatchManager);

      const patch = screen.getByTestId('patch');
      const patchInput = within(patch).getByRole('textbox');
      expect(patchInput.value).to.equal('test-o');

      const params = screen.getByTestId('params');
      const paramsInput = within(params).getByRole('textbox');
      expect(paramsInput.value).to.equal('supasynth');
    });

    it('updates display when new patch is selected', async () => {
      mockStore.patches = [
        { ...blank(), name: 'first-patch', configs: [{ name: 'config1' }] },
        { ...blank(), name: 'second-patch', configs: [{ name: 'config2' }] }
      ];

      render(PatchManager);

      // Initially shows first patch
      const patch = screen.getByTestId('patch');
      const patchInput = within(patch).getByRole('textbox');
      expect(patchInput.value).to.equal('first-patch');

      // Update patch selection
      const dropdown = within(patch).getByRole('combobox');
      fireEvent.update(dropdown, { target: { value: '1' } });

      // Wait for Vue to update
      await nextTick();

      // shows second patch
      expect(patchInput.value).to.equal('second-patch');
    });
  });
});
