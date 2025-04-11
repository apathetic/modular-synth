import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, within, fireEvent, cleanup } from '@testing-library/vue';
import { setActivePinia, createPinia } from 'pinia';
import { createAppStore, useAppStore } from '@/stores/app';
import PatchManager from './PatchManager.vue';
import { state as blank } from '@/stores/patch';


vi.mock('@/stores/app', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAppStore: vi.fn()
  };
});


const createTestStore = (initialPatches = [blank()]) => {
  const store = createAppStore({ patches: initialPatches })();

  store.patchId = 0;
  store.loadPatch = vi.fn((id) => {
    store.patchId = id;
    store.presetId = 0;
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
        presets: [{ name: 'original-preset', parameters: {} }]
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
      expect(mockStore.preset.name).to.equal('paramtasatic');
    });
  });

  describe('Parameters', () => {
    it.skip('can load a set of parameters', async () => {
      mockStore.patches[0].presets = [
        {'name':'wheee', 'parameters': {}},
        {'name':'huzzah','parameters': {}}
      ];

      render(PatchManager);

      const params = screen.getByTestId('params');
      const paramsInput = within(params).getByRole('textbox');

      // Input text should match the first preset's name
      expect(paramsInput.value).to.equal('wheee');

      // Select the second preset from the dropdown
      const dropdown = within(params).getByRole('combobox');
      fireEvent.update(dropdown, { target: { value: '1' } });

      // Verify the input text was updated to the new preset name
      expect(paramsInput.value).to.equal('huzzah');
    });

    it('in edit mode, can add a new parameter preset', () => {
      mockStore.isEditing = true;
      const addPresetSpy = vi.spyOn(mockStore, 'addPreset');

      render(PatchManager);

      const add = within(screen.getByTestId('params')).getByTitle('add preset');
      fireEvent.click(add);

      expect(addPresetSpy).toHaveBeenCalledTimes(1);
    });

    it('in edit mode, can remove a parameter preset', () => {
      mockStore.patches[0].presets = [
        {'name':'preset1', 'parameters': {}},
        {'name':'preset2', 'parameters': {}}
      ];
      mockStore.isEditing = true;

      render(PatchManager);

      const removePresetSpy = vi.spyOn(mockStore, 'removePreset');
      const remove = within(screen.getByTestId('params')).getByTitle('remove preset');
      fireEvent.click(remove);

      expect(removePresetSpy).toHaveBeenCalledTimes(1);
      expect(removePresetSpy).toHaveBeenCalledWith(mockStore.presetId);
    });

    it('in edit mode, can edit the parameters name', () => {
      mockStore.isEditing = true;

      render(PatchManager);

      const params = screen.getByTestId('params');
      const paramsname = within(params).getByRole('textbox');
      fireEvent.update(paramsname, 'paramtasatic');
      expect(mockStore.preset.name).to.equal('paramtasatic');
    });

    it('cannot remove last parameter preset', () => {
      mockStore.isEditing = true;

      const removePresetSpy = vi.spyOn(mockStore, 'removePreset');

      render(PatchManager);

      const remove = within(screen.getByTestId('params')).getByTitle('remove preset');
      fireEvent.click(remove);

      expect(removePresetSpy).not.toHaveBeenCalled();
    });
  });

  describe('UI', () => {
    it('renders the correct content', () => {
      mockStore.patches[0].name = 'test-o';
      mockStore.patches[0].presets[0].name = 'supasynth';

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
        { ...blank(), name: 'first-patch', presets: [{ name: 'setting1' }] },
        { ...blank(), name: 'second-patch', presets: [{ name: 'setting2' }] }
      ];
      const loadPatchSpy = vi.spyOn(mockStore, 'loadPatch');

      render(PatchManager);

      // Initially shows first patch
      const patch = screen.getByTestId('patch');
      const patchInput = within(patch).getByRole('textbox');
      expect(patchInput.value).to.equal('first-patch');

      // Update patch selection - use an actual Number here, not a string
      const dropdown = within(patch).getByRole('combobox');
      fireEvent.update(dropdown, { target: { value: 1 } });

      // Verify loadPatch was called with the right argument
      expect(loadPatchSpy).toHaveBeenCalledWith(1);

      // Verify patchId was updated
      expect(mockStore.patchId).to.equal(1);

      // shows second patch
      expect(patchInput.value).to.equal('second-patch');
    });
  });
});
