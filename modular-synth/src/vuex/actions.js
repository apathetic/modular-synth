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

// //////////////////////////////////

export const newModule = ({ dispatch }, type) => {
  dispatch('ADD_MODULE', type);
};

export const removeModule = ({ dispatch }, id) => {
  dispatch('REMOVE_MODULE', id);
};

export const newConnection = ({ dispatch }, event, module, outlet) => {
  // this.$dispatch('connector:new', {
  //   module: this,
  //   outlet: outlet,
  //   el: event.target
  // });

  // keep this "end" of the line's source of truth in this
  // component. Then, this node can update itself and the
  // data shared in the Connector *should* update as well.
  const from = {
    module: module,
    label: outlet.label,
    data: outlet.data,
    port: event.target,
    connections: outlet.connections
  };

  console.log(from);
  return;
  /** /

  const to = {}; // for now?
  dispatch('ADD_CONNECTION', to, from);
  /**/
};



export const updatePosition = ({ dispatch }, id, x, y) => {
  dispatch('UPDATE_POSITION', id, x, y);

  /* * /
  if (module.inlets) {
    module.inlets.forEach(function(inlet, i) {
      inlet.connections.forEach(function(connector) {
        connector.line.x2 = module.x - 3;
        connector.line.y2 = module.y + (i * 20) + 17 + 80;  // if the inlets always maintain the same spacing...
      });
    });
  }

  if (module.outlets) {
    module.outlets.forEach(function(outlet, i) {
      outlet.connections.forEach(function(connector) {
        dispatch('UPDATE_CONNECTION', connector, module);
        // connector.line.x1 = module.x + module.width + 3;
        // connector.line.y1 = module.y + (i * 20) + 17 + 80;
      });
    });
  }
  /* */

  // dispatch('UPDATE_CONNECTIONS', module);
};
