
export default {
  functional: true,
  props: { ports: Array },
  // template: `
  //   <div class="inlets">
  //     <span v-for="(inlet, index) in ports"
  //       :data-label="inlet.label"
  //       :data-port="index"
  //       class="inlet">
  //     </span>
  //   </div>
  // `

  render: function(createElement, context) {
    const ports = context.props.ports;

    return createElement('div',
      {
        class: { 'inlets': true }
      },
      ports.map((port, i) => {
        return createElement('span',
          {
            class: { 'inlet': true },
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
