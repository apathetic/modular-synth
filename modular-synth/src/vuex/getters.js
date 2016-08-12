export function modules(state) {
  return state.modules;
}

export function connections(state) {
  return state.connections;
}

export function position(state) {
  const current = state.modules.filter(module => {
    return module.id === state.current;
  });

  return {
    x: current.x,
    y: current.y
  };
  // return {
  //   top: x + 'px',
  //   left: y + 'px'
  // };
}
