interface LogProps {
  type: string;
  action: string;
  data?: any;
}


export function log({ type, action, data = '' }: LogProps) {

  const style = (
    action == 'destroying' ? 'color: grey' :
    action == 'setting' ? 'color: orange' :
    type == 'parameter' ? 'color: lightblue' :
    type == 'component' ? 'color: green' :
    'color: grey'
  );

	switch (type) {
		case 'error':
			break;

    case 'system': // black background
      console.log('%c ◌ Synth: %s ', 'background:black;color:white;font-weight:bold', action);
      break;

    case 'patch': // grey background
      console.log('%c Patch: %s %s ', 'background:#666;color:white;font-weight:bold;', action, data);
      break;

    // case 'component':
    //   console.log('%c[component] %s %s', style, action, data);
    //   break;

    // case 'parameter':
    //   console.log('%c[parameter] %s %s', style, action, data);
    //   break;

    // case 'params':
		// case 'destroy':
			// console.log('Destroying %s ', data);
      // console.log('%c[parameter] Destroying %s %s', 'color: grey', type);

    default:
      console.log('%c[%s] %s %s', style, type, action, data);
      break;
	}
}
