export default {
  functional: true,
  props: { ports: Array },
  // template: `
  // <div v-once class="outlets">
  //   <span v-for="(outlet, index) in ports"
  //     @mousedown.stop="newConnection(outlet)"
  //     :data-label="outlet.label"
  //     :data-port="index"
  //     class="outlet">
  //   </span>
  // </div>
  // `
  render: function(createElement, context) {
    const ports = context.props.ports;

    return createElement('div',
      {
        class: { 'outlets': true }
      },
      ports.map((port, i) => {
        return createElement('span',
          {
            on: {
              mousedown: (e) => {
                e.stopPropagation();
                context.parent.$root.$bus.$emit('connection:start', i, context.parent.id);
              }
            },
            class: { 'outlet': true },
            attrs: {
              'data-label': port.label,
              'data-port': i
            }
          }
        );
      })
    );
  }
};

