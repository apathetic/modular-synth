import { shallow, createLocalVue } from 'vue-test-utils';
import Synth from '@/Synth.vue';
import Node from '@/components/Node';

describe('sortable', () => {
  // --------

  function movePiece(number, x, y) {
    cy.get(`.piece-${number}`)
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', { clientX: x, clientY: y })
      .trigger('mouseup', {force: true});
  }

  beforeEach(function() {
    cy.viewport(550, 350);
    cy.visit('http://localhost:8080/');
  });

  // --------

  it('the App can sort modules in play mode', () => {
    const App = shallow(Synth, {
      stubs: {
        Node
      }
    });

    movePiece(1, 340, 130);
    cy.get('.pieces li').eq(3).find('span').should('not.exist');

    // ...
  });

  it('works after loading and reloading a patch', () => {
  });

  it('works after adding a module', () => {
  });

  it('works after removing a module', () => {
  });
});
