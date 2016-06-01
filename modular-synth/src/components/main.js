var µ = (function() {

	var context = window.AudioContext && (new window.AudioContext()),
		patch,
		masterOut;

	if (!context) {
		alert('Your crappy browser does not support webAudio');
		return false;
	}

	patch = angular.module("audio", []);
	masterOut = context.createGain();
	masterOut.connect(context.destination);


	// create a masterOut slider
	// $(document.body).append(
	// 	$compile(
	// 		'<input type="range"....>'
	// 	)(scope)
	// );

	// document.querySelector('#masterOut').addEventListener('change', function(){
	// 	masterOut.gain.value = this.value;
	// });

	return {
		context: context,
		masterOut: masterOut,
		patch: patch
	}

})();









