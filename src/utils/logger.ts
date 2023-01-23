

export function log({ type, action, data }) {

	switch (type) {
		case 'error':
			break;

    case 'system': // black background
      console.log('%c ◌ Synth: %s ', 'background:black;color:white;font-weight:bold', action);
      break;

    case 'patch': // grey background
      console.log('%c Loading patch: %s ', 'background:#666;color:white;font-weight:bold;', data);
      break;

		case 'created':
    case 'component':
      // green text
      console.log('%c[component] Creating %s', 'color: green', props.module.type);
      break;
    case 'params':
		case 'destroy':
			console.log('Destroying %s ', this.module.type);

    default:
      break;
	}
}
