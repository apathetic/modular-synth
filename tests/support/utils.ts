import { context } from '@/audio/';

// const d = context.createGain();

// export const dummy = {
//   set: (g) => {
//     d.gain.value = g;
//   },
//   connect: (node) => {
//     d.connect(node);
//   },
//   disconnect: () => {
//     d.disconnect();
//   }
// };
export const dummy = context.createGain();

export const wasDisposed = (obj) => {
  for (const prop in obj) {
      if (!obj.hasOwnProperty(prop)) { continue; }

      const member = obj[prop];

      if (typeof member !== 'function' &&
        typeof member !== 'string' &&
        typeof member !== 'number' &&
        typeof member !== 'boolean' &&
        typeof member !== 'undefined' &&
        prop !== 'preset' &&
        !(member instanceof AudioContext) &&
        !obj.constructor.prototype[prop]) {
        if (member !== null) {
          throw Error('property was not completely disposed: ' + prop);
        }
      }
    }
};

export const getStore = () => {
  // const getStore = () => cy.window().its('app.$store')
};
// getStore().its('state').should('have.keys', ['loading', 'newTodo', 'todos'])
