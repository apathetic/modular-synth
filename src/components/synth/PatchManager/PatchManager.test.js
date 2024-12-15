import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, getByTestId, within, fireEvent } from '@testing-library/vue';
import { useAppStore } from '@/stores/app';
import { state as blank } from '@/stores/patch';
import PatchManager from './PatchManager.vue';

import { setActivePinia, createPinia } from 'pinia'



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

  describe('Patches: ', () => {
    it('loads a default patch', () => {
      render(PatchManager);

      expect(screen.getByRole('option', { name: 'untitled' }).selected).toBe(true);
      expect(screen.getByRole('option', { name: '<blank>' }).selected).toBe(true);
    });

    it('can load a patch', () => {
      // const mockStore = useAppStore();
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
      const buttons = screen.queryAllByRole('button');
      const inputs = screen.queryAllByRole('input');

      buttons.forEach((button) => {
        expect(button).toHaveProperty('disabled', true);
      });

      inputs.forEach((input) => {
        expect(input).toHaveProperty('disabled', true);
      });
    });

    it('in edit mode, can add a new patch', () => {
      mockStore.isEditing = true;

      render(PatchManager);
      const add = screen.getByTitle('add patch');
      fireEvent.click(add);

      expect(mockStore.addPatch).toBeCalled();
    });

    it('in edit mode, can remove a patch', () => {
      window.confirm = vi.fn(() => true);
      mockStore.isEditing = true;
      mockStore.patches = [blank(), blank()];

      render(PatchManager);
      const remove = screen.getByTitle('remove patch');
      fireEvent.click(remove);

      expect(mockStore.removePatch).toHaveBeenCalledTimes(1);
      expect(mockStore.removePatch).toHaveBeenCalledWith(mockStore.patchId);
    });

    it('in edit mode, can not remove last patch', () => {
      window.confirm = vi.fn(() => true);
      mockStore.isEditing = true;
      mockStore.patches = [blank()]; // only 1 patch

      render(PatchManager);
      const remove = screen.getByTitle('remove patch');
      fireEvent.click(remove);

      expect(mockStore.removePatch).toHaveBeenCalledTimes(0);
    });

    it('in edit mode, can edit the patch name /* and parameters name */', () => {
      mockStore.isEditing = true;

      render(PatchManager);

      const patch = screen.getByTestId('patch');
      const patchname = within(patch).getByRole('textbox');
      fireEvent.update(patchname, 'rando');
      expect(mockStore.patch).toHaveProperty('name', 'rando');

      // const params = screen.getByTestId('params');
      // const paramsname = within(params).getByRole('textbox');
      // fireEvent.update(paramsname, 'optionsatic');
      // expect(mockStore.config).toHaveProperty('name', 'optionsatic');
    });
  });

  describe.skip('Parameters', () => {
    it.only('can load a set of parameters', () => {
      mockStore.patches[0].configs = [
        {'name':'wheee', 'parameters': {}},
        {'name':'huzzah','parameters': {}},
      ];

      console.log(mockStore.patch);

      render(PatchManager);

      screen.debug();


      const params = screen.getByTestId('params');
      const dropdown = within(params).getByRole('combobox');

      expect(within(params).getByRole('option', { name: 'wheee' }).selected).toBe(true);

      // userEvent.selectOptions(
      //   within(params).getByRole('combobox'),
      //   within(params).getByRole('option', { name: 'Ireland' }),
      // );


      // expect(screen.getByRole('option', { name: 'wheee' }).selected).toBe(true);
      // fireEvent.update(dropdown, { target: { value: 1 } });
      // expect(screen.getByRole('option', { name: 'huzzah' }).selected).toBe(true);

    });
    it('in edit mode, can add a new parameter config', () => { });
    it('in edit mode, can remove a parameter config', () => { });
    it('in edit mode, can edit the parameters name', () => {
      mockStore.isEditing = true;

      render(PatchManager);

      const params = screen.getByTestId('params');
      const paramsname = within(params).getByRole('textbox');
      fireEvent.update(paramsname, 'optionsatic');
      expect(mockStore.config).toHaveProperty('name', 'optionsatic');
    });

    it('connections are connected upon loading a patch', () => {});
    it('parameters are applied upon loading a patch', () => {});
  });

  describe('UI', () => {
    it('renders the correct content', async () => {
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
