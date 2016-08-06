// Holds dragging info for the currently dragging node.
const dragObj = {
  zIndex: 0,
  cursorStartX: null,
  cursorStartY: null,
  startX: null,
  startY: null
};


export const dragStart = ({ dispatch }, event, node) => {
  console.log('drag start');

  if (!event.target.classList.contains('module-interface')) {
    return;
  }

  // this.dragging = true;

  // Save starting positions of cursor and element.
  dragObj.cursorStartX = event.clientX; // + window.scrollX;
  dragObj.cursorStartY = event.clientY; // + window.scrollY;

  // is this not already stored on the node? ie x, y?
  // dragObj.startX = node.offsetLeft || 0; // el.getBoundingClientRect().left; //
  // dragObj.startY = node.offsetTop || 0; // el.getBoundingClientRect().top;  //
  dragObj.startX = node.x || 0;
  dragObj.startX = node.y || 0;

  // Update element's z-index.
  node.$el.style.zIndex = ++dragObj.zIndex;

  // Capture mousemove and mouseup events on the page.
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
};

export const dragMove = ({ dispatch }, event) => {
  console.log('drag move');
  const x = dragObj.startX + event.clientX - dragObj.cursorStartX;
  const y = dragObj.startY + event.clientY - dragObj.cursorStartY;
  dispatch('UPDATE_POSITION', this, x, y);
};

export const dragEnd = ({ dispatch }) => {
  console.log('drag end');
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', dragEnd);
  // this.dragging = false;
};
