import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, getByTestId, within, fireEvent, cleanup } from '@testing-library/vue';
import { useAppStore } from '@/stores/app';
import { state as blank } from '@/stores/patch';
import PatchManager from './PatchManager.vue';

// import { setActivePinia, createPinia } from 'pinia'



const mockPatch = blank();
const mockStore = {
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
};


vi.mock('@/stores/app', async () => {
  return {
    useAppStore: () => mockStore
  };
});



describe('PatchManager.vue', () => {

  beforeEach(() => {
    vi.clearAllMocks();

    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    // without having to pass it to it: `useStore(pinia)`
    // setActivePinia(createPinia())

  });

  afterEach(() => {
    cleanup(); // Clean up the DOM after each test
  });

  describe('Patches: ', () => {
    it('loads a default patch', () => {
      mockStore.patch = { ...blank(), name: 'untitled' };
      mockStore.config = { name: '<blank>' };

      render(PatchManager);

      const patch = screen.getByTestId('patch');
      const patchInput = within(patch).getByRole('textbox');
      expect(patchInput.value).to.equal('untitled');

      const params = screen.getByTestId('params');
      const paramsInput = within(params).getByRole('textbox');
      expect(paramsInput.value).to.equal('<blank>');
    });

    it('can load a patch', () => {
      // const mockStore = useAppStore();
      render(PatchManager);
      expect(mockStore.loadPatch.mock.calls.length).to.equal(1); // by default

      const patch = screen.getByTestId('patch');
      const dropdown = within(patch).getByRole('combobox');

      fireEvent.update(dropdown, { target: { value: 0 } });
      expect(mockStore.loadPatch.mock.calls.length).to.equal(2);
    });

    it('in play mode, cannot add nor remove', () => {
      mockStore.isEditing = false;

      render(PatchManager);
      const buttons = screen.getAllByRole('button');
      const patchInput = within(screen.getByTestId('patch')).getByRole('textbox');
      const paramsInput = within(screen.getByTestId('params')).getByRole('textbox');

      buttons.forEach((button) => {
        expect(button.disabled).to.be.true;
      });

      // Check pointer-events
      // const patchStyle = window.getComputedStyle(patchInput);
      // const paramsStyle = window.getComputedStyle(paramsInput);
      // expect(patchStyle.pointerEvents === 'none' || patchInput.disabled).to.be.true;
      // expect(paramsStyle.pointerEvents === 'none' || paramsInput.disabled).to.be.true;
    });

    it('in edit mode, can add a new patch', () => {
      mockStore.isEditing = true;

      render(PatchManager);
      const add = screen.getByTitle('add patch');
      fireEvent.click(add);

      expect(mockStore.addPatch.mock.calls.length).to.be.above(0);
    });

    it('in edit mode, can remove a patch', () => {
      window.confirm = vi.fn(() => true);
      mockStore.isEditing = true;
      mockStore.patches = [blank(), blank()];

      render(PatchManager);
      const remove = screen.getByTitle('remove patch');
      fireEvent.click(remove);

      expect(mockStore.removePatch.mock.calls.length).to.equal(1);
      expect(mockStore.removePatch.mock.calls[0][0]).to.equal(mockStore.patchId);
    });

    it('in edit mode, can not remove last patch', () => {
      window.confirm = vi.fn(() => true);
      mockStore.isEditing = true;
      mockStore.patches = [blank()]; // only 1 patch

      render(PatchManager);
      const remove = screen.getByTitle('remove patch');
      fireEvent.click(remove);

      expect(mockStore.removePatch.mock.calls.length).to.equal(0);
    });

    it('in edit mode, can edit the patch name and parameters name', () => {
      mockStore.isEditing = true;

      render(PatchManager);

      const patch = screen.getByTestId('patch');
      const patchname = within(patch).getByRole('textbox');
      fireEvent.update(patchname, 'rando');
      expect(mockStore.patch).to.have.property('name', 'rando');

      const params = screen.getByTestId('params');
      const paramsname = within(params).getByRole('textbox');
      fireEvent.update(paramsname, 'paramtasatic');
      expect(mockStore.config).to.have.property('name', 'paramtasatic');
    });
  });

  describe('Parameters', () => {
    it('can load a set of parameters', () => {
      // Set up configs
      const mockConfigs = [
        {'name':'wheee', 'parameters': {}},
        {'name':'huzzah','parameters': {}},
      ];
      mockStore.patches[0].configs = mockConfigs;
      mockStore.patch = mockStore.patches[0];
      mockStore.configs = mockConfigs;
      mockStore.config = mockConfigs[0];

      render(PatchManager);

      const params = screen.getByTestId('params');
      const paramsInput = within(params).getByRole('textbox');

      // Input text should match the first config's name
      expect(paramsInput.value).to.equal('wheee');

      // Using spy to check the correct argument is passed
      const originalSetMethod = Object.getOwnPropertyDescriptor(mockStore, 'configId').set;
      const spy = vi.fn();

      // *************** re: spy... don't need to override / retain a ref to configId *****************

      Object.defineProperty(mockStore, 'configId', {
        get: () => 0,
        set: spy
      });

      const dropdown = within(params).getByRole('combobox');
      fireEvent.update(dropdown, { target: { value: '1' } });

      // Verify the spy was called with the right value
      expect(spy.mock.calls.length).to.be.above(0);

      // Restore original setter
      Object.defineProperty(mockStore, 'configId', {
        get: () => 0,
        set: originalSetMethod
      });
    });

    it('in edit mode, can add a new parameter config', () => {
      mockStore.isEditing = true;

      render(PatchManager);
      const add = within(screen.getByTestId('params')).getByTitle('add config');
      fireEvent.click(add);

      expect(mockStore.addConfig.mock.calls.length).to.be.above(0);
    });

    it('in edit mode, can remove a parameter config', () => {
      window.confirm = vi.fn(() => true);
      mockStore.isEditing = true;
      mockStore.patches[0].configs = [
        {'name':'config1', 'parameters': {}},
        {'name':'config2', 'parameters': {}},
      ];
      mockStore.configs = mockStore.patches[0].configs;

      render(PatchManager);
      const remove = within(screen.getByTestId('params')).getByTitle('remove config');
      fireEvent.click(remove);

      expect(mockStore.removeConfig.mock.calls.length).to.equal(1);
      expect(mockStore.removeConfig.mock.calls[0][0]).to.equal(mockStore.configId);
    });

    it('in edit mode, can edit the parameters name', () => {
      mockStore.isEditing = true;

      render(PatchManager);

      const params = screen.getByTestId('params');
      const paramsname = within(params).getByRole('textbox');
      fireEvent.update(paramsname, 'paramtasatic');
      expect(mockStore.config).to.have.property('name', 'paramtasatic');
    });

    it('cannot remove last parameter config', () => {
      window.confirm = vi.fn(() => true);
      mockStore.isEditing = true;
      mockStore.patches[0].configs = [{'name':'only-config', 'parameters': {}}];
      mockStore.configs = mockStore.patches[0].configs;

      render(PatchManager);
      const remove = within(screen.getByTestId('params')).getByTitle('remove config');
      fireEvent.click(remove);

      expect(mockStore.removeConfig.mock.calls.length).to.equal(0);
    });
  });

  describe('UI', () => {
    it('renders the correct content', async () => {
      mockStore.patch = {
        ...blank(),
        name: 'test-o',
      };
      mockStore.config = { name: 'supasynth' };

      render(PatchManager);

      const patch = screen.getByTestId('patch');
      const patchInput = within(patch).getByRole('textbox');
      expect(patchInput.value).to.equal('test-o');

      const params = screen.getByTestId('params');
      const paramsInput = within(params).getByRole('textbox');
      expect(paramsInput.value).to.equal('supasynth');
    });

    it('updates display when new patch is selected', () => {
      mockStore.patches = [
        { ...blank(), name: 'first-patch', configs: [{ name: 'config1' }] },
        { ...blank(), name: 'second-patch', configs: [{ name: 'config2' }] }
      ];

      // Mock initial state
      mockStore.patch = mockStore.patches[0];
      mockStore.config = mockStore.patches[0].configs[0];

      render(PatchManager);

      // Initially shows first patch
      const patch = screen.getByTestId('patch');
      const patchInput = within(patch).getByRole('textbox');
      expect(patchInput.value).to.equal('first-patch');

      // Update patch selection
      const dropdown = within(patch).getByRole('combobox');
      fireEvent.update(dropdown, { target: { value: '1' } });

      // shows second patch
      expect(patchInput.value).to.equal('second-patch');

    });
  });
});
