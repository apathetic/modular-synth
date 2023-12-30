import { render, screen, getByTestId, getAllByRole, userEvent, selectOptions, fireEvent } from '@testing-library/vue';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '@/stores/app';
import { state as blank } from '@/stores/patch';
import PatchManager from './PatchManager.vue';
// import * as composables from '@/composables';


const mockPatch = blank();
// const mockLoadPatch = vi.fn();
// const mockAddPatch = vi.fn();
// const mockRemovePatch = vi.fn();
const mockStore = {
  loadPatch: vi.fn(),   // loadPatch: cy.spy().as('loadPatchSpy')
  addPatch: vi.fn(),
  removePatch: vi.fn(),
  patchId: 0,
  patches: [mockPatch],
  patch: {},

  addConfig: vi.fn(),
  removeConfig: vi.fn(),
  configId: 0,
  configs: [],
  config: {},

  isEditing: false,
};

vi.mock('@/stores/app', async (origStore) => {
  // const store = await origStore();
  return {
    // ...store,
    // replace some exports
    // namedExport: vi.fn(),
    // default: { myDefaultKey: vi.fn() },
    useAppStore: () => mockStore,
    // useAppStore: vi.fn(() => ({
    //   loadPatch: mockLoadPatch, // vi.fn(),   // loadPatch: cy.spy().as('loadPatchSpy')
    //   addPatch: mockAddPatch, // vi.fn(),
    //   removePatch: mockRemovePatch, // vi.fn(),
    //   patchId: 0,
    //   patches: [mockPatch],
    //   patch: {},

    //   addConfig: vi.fn(),
    //   removeConfig: vi.fn(),
    //   configId: 0,
    //   configs: [],
    //   config: {},

    //   isEditing: false,
    // }))
  };
});



describe('PatchManager.vue', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Patches: ', () => {
    it('loads a default patch', () => {
      render(PatchManager);

      // const selects = getAllByRole('option', { name: '<blank>' });
      // expect(selects[0].selected).toBe(true);

      // cy.contains('.patch option', '<blank>');
      expect(screen.getByRole('option', { name: '<blank>' }).selected).toBe(true);

      // cy.contains('.params option', '<blank>');
      expect(screen.getByRole('option', { name: '<blank>' }).selected).toBe(true);
    });

    it.only('can load a patch', async () => {
      render(PatchManager);

      const patches = screen.getByTestId('patch');

      await fireEvent.update(patches, { target: { value: 0 } })
      expect(mockStore.loadPatch).toBeCalled();
    });

    it.only('in play mode, cannot add nor remove', () => {
      mockStore.isEditing = false;
      render(PatchManager);

      const buttons = screen.queryAllByRole('button');

      buttons.forEach((button) => {
        expect(button).toHaveProperty('disabled', true);
      });
    });

    it('in edit mode, can add a new patch', () => {
      const store = {
        isEditing: true,
        addPatch: cy.spy().as('addPatchSpy')
      };

      cy.mount(PatchManager, { store });
      cy.get('.patch .add').click();
      cy.get('@addPatchSpy').should('have.been.called');
    });

    it('in edit mode, can remove a patch', () => {
      const store = {
        isEditing: true,
        patchId: 1,
        patches: [blank(), blank()],
        removePatch: cy.spy().as('removePatchSpy')
      };

      cy.mount(PatchManager, { store });
      cy.get('.patch .remove').click();
      cy.on('window:confirm', () => true);
      cy.get('@removePatchSpy').should('have.been.calledWith', 1);

      // cannot remove if it's the last patch
      cy.get('.patch .remove').click();
      cy.on('window:confirm', () => true);
      cy.get('@removePatchSpy').should('not.have.been.called');
      // cy.get('@removePatchSpy').should('have.callCount', 1); // from above
    });

    it('in edit mode, can edit the patch name', () => {

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
    it('renders the correct content', () => {
      let patchmanager = Cypress.vue;
    });

    it('updates display when new patch is selected', () => {
      let patchmanager = Cypress.vue;

      // patchmanager

    });
  });
});
