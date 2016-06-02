	//------------------------------------------------
	//	DELAY
	// -----------------------------------------------
	patch.directive("delay", function(){
	  return {
		 'restrict': 'E',
		 'controller': function($scope, $element, $attrs){
			var time = $scope.time || '100';
			var feedback = $scope.freq || '0';
			var output = $scope.output || 'masterOut';

			// create an input
			this.input = context.createGainNode();

			// create the filter
			this.delay = context.createDelayNode();
			this.delay.delayTime.value = time;

			// this.delay.feedback.value = freq;

			// our input is now connected to our filter
			this.input.connect(this.delay);


			// feedback
			// var feedback = context.createGainNode();
			//
			// feedback.gain = feedback;
			// this.delay.connect(feedback);
			// feedback.connect(this.input);

			// call it vars(?). Maybe makes more sense, in this context
			// this.vars = $scope;

			// store a reference to the input on the element itself
			$element[0].input = this.input;

		 },
		 'link': function(scope, elem, attrs, controller) {
			scope.$watch('output', function(output){

			  if (output == 'masterOut') {
				 controller.comp.connect(masterOut);
			  } else {
				var destination = document.querySelector('#'+output);
				if (destination.input) {
				 controller.delay.connect(destination.input);
				 } else {
					console.log('"%s" not found or is not an audio node', output);
				 }
			  }

			});

		 },
		 'scope': {
			'time': '@',
			'feedback': '@',
			'output': '@'
		 }
	  }
	});
