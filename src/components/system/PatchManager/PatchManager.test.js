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
    it('can load a patch', () => {
      let patchmanager = Cypress.vue; // the ref to the component (which was set up in "mountVue")

      // ...
    });

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

    it('connections are connected upon loading a patch', () => {});

    it('parameters are applied upon loading a patch', () => {});

    it('in edit mode, can add a new patch', () => {

    });

    it('in edit mode, can remove a patch', () => {

    });

    it('in edit mode, can edit the patch name', () => {

    });
  });

  context('Parameters', () => {
    it('can load a parameter config', () => {});
    it('in edit mode, can add a new parameter config', () => { });
    it('in edit mode, can remove a parameter config', () => { });
    it('in edit mode, can edit the parameter config name', () => { });
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
