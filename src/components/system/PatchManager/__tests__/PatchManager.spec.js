import PatchManager from '@/components/system/PatchManager';
import { blank } from '@/stores/app';
// import * as composables from '@/composables';


describe('PatchManager.vue', () => {

  beforeEach(() => {
    // cy.stub(composables, 'useSortable');
    // cy.stub(useSortable, 'initSorting');
    // cy.stub(useSortable, 'resetSorting');
  });

  // it('Authenticates', () => {
  //   it('if not logged in, cannot interact with patch dropdown', () => {});
  //   it('if not logged in, cannot interact with parameter set dropdown', () => {});
  // });

  context('Patches: ', () => {
    it('loads a default patch', () => {
      cy.mount(PatchManager);
      cy.contains('.patch option', '<blank>');
      cy.contains('.params option', '<blank>');
    });

    it('can load a patch', () => {
      const store = {
        loadPatch: cy.spy().as('loadPatchSpy')
      };

      cy.mount(PatchManager, { store });
      cy.get('.patch select').select('<blank>');
      cy.get('@loadPatchSpy').should('have.been.called');
    });

    it('in play mode, cannot add nor remove', () => {
      const store = {
        isEditing: false
      };

      cy.mount(PatchManager, { store });
      cy.get('.patch .add').should('not.be.visible');
      cy.get('.patch .remove').should('not.be.visible');
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

  context('Parameters', () => {
    it('can load a parameter config', () => {});
    it('in edit mode, can add a new parameter config', () => { });
    it('in edit mode, can remove a parameter config', () => { });
    it('in edit mode, can edit the parameter config name', () => { });

    it('connections are connected upon loading a patch', () => {});
    it('parameters are applied upon loading a patch', () => {});
  });

  context('UI', () => {
    it('renders the correct content', () => {
      let patchmanager = Cypress.vue;
    });

    it('updates display when new patch is selected', () => {
      let patchmanager = Cypress.vue;

      // patchmanager

    });
  });
});
