export const increment = ({ dispatch }) => dispatch('INCREMENT');
export const decrement = ({ dispatch }) => dispatch('DECREMENT');

export const incrementIfOdd = ({ dispatch, state }) => {
  if ((state.count + 1) % 2 === 0) {
    dispatch('INCREMENT');
  }
};

export const incrementAsync = ({ dispatch }) => {
  setTimeout(() => {
    dispatch('INCREMENT');
  }, 1000);
};


export const newModule = ({ dispatch }, type) => {
  dispatch('NEW_MODULE', type);
};
