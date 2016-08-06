export function modules(state) {
  return state.modules;
}

export function connections(state) {
  return state.connections;
}

export function position(state) {
  const x = state.modules.???.x;
  const y = state.modules.???.y;

  return {
    top: x + 'px',
    left: y + 'px'
  };

  // return state.messages.filter(message => {
  //   return message.threadID === state.currentThreadID
  // })
}
