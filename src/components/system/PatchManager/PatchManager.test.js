import PatchManager from '@/components/system/PatchManager';


describe('PatchManager.vue', () => {

  // beforeEach(mountVue(PatchManager, {
  //   extensions
  // }));

  it('Authenticates', () => {
    it('if not logged in, cannot interact with patch dropdown', () => {});
    it('if not logged in, cannot interact with parameter set dropdown', () => {});
  });

  context('Patches: ', () => {
    it('loads a default patch', () => {
      cy.mount(PatchManager, {
        props: {
          username: 'Test User',
          onLogout: cy.spy().as('onLogout'),
        },
      });
      cy.contains('Welcome Test User!');

      // ...
    });

    it('can load a patch', () => {
      let patchmanager = Cypress.vue; // the ref to the component (which was set up in "mountVue")

      // ...
    });

    it('can save a patch', () => {
      let patchmanager = Cypress.vue;

      // ...
    });

    it('when in edit mode, can add a new patch', () => {

    });

    it('when in edit mode, can remove a patch', () => {

    });

    it('when in edit mode, can edit the patch name', () => {

    });
  });

  context('Parameters', () => {
    it('in play mode, can select a new parameter set', () => {});
    it('in play mode, can save parameters', () => {});
    it('in edit mode, can add a new parameter set', () => { });
    it('in edit mode, can remove a parameter set', () => { });
    it('in edit mode, can edit the parameter set name', () => { });
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
