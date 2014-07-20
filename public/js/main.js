var µ = (function() {

	var context = window.webkitAudioContext && (new window.webkitAudioContext());
	var masterOut = context.destination;
	var patch = angular.module("audio", []);

	if (!context) {
		alert('Your crappy browser does not support webAudio');
		return false;
	}

	return {
		context: context,
		masterOut: masterOut,
		patch: patch
	}

})();









