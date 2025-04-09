export default function(payload) {


  navigator.serviceWorker.ready.then((registry) => {
    console.log('sw activ')
    registry.active.postMessage({
      broadcast: payload
    });

		registry.active.onmessage = (_event) => {
				console.log('data receie xdxxsddddd');
		};
	});

  navigator.serviceWorker.onmessage = (event) => {
    if (event.data) {
      //process response
			console.log('data receie in app');
    }
  };

}