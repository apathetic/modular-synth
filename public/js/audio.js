(function(µ) {

	// local refs
	var patch = µ.patch;
	var context = µ.context;
	var masterOut = µ.masterOut;


	//------------------------------------------------
	//	OSCILLATOR
	// -----------------------------------------------
	patch.directive('oscillator', function(){
		return {
			'restrict': 'E',
			'controller': function($scope, $element, $attrs){

				/*
				// create an input (if we wish to modulate the frequency)
				// this.input = context.createGainNode();
				*/

				// Our lovely webAudio Oscillator.
				$scope.osc = context.createOscillator();

				// TODO extend for defaults...
				var type = $scope.type || 'sine';
				var freq = $scope.freq || '440';

				$scope.osc.type = type;
				$scope.osc.frequency.value = freq;


				// Here are the interfaces available to control the oscillator:
				// Update Frequency (@ control rate)
				$scope.$watch('freq', function(f) {
					console.log('f', f);
					$scope.osc.frequency.value = f;
				});

			},
			'link': function(scope, elem, attrs) {



				// NOTE ---------------------
				// this method for hooking up nodes is used throughout
				// abstract out of here and generalize FTW
				// *****************************************

				// we hook up everything in the link function -- ie. after all
				// webAudio audio nodes have been successfully instantiated
				scope.$watch('output', function(output){
					if (output) {
						if (output == 'masterOut') {
							console.log('Routing %s to MasterOut', elem);
							scope.osc.connect(masterOut);
						} else {
							var destination = document.querySelector('#'+output);
							if (destination.input) {
								// connect the osc's output to the referenced input
								console.log('Routing %s to %s', elem, destination.input);
								scope.osc.connect(destination.input);
							} else {
								console.log('"%s" not found or is not an audio node', output);
							}
						}
					} else {
						// hook up the node to its parent
						var parent = elem.parent();
						console.log('Routing %s to its parent: %s', elem[0].nodeName, parent[0].nodeName);

						// console.log(parent);

						// access parent scope somehow to connect this?
						// 	a) through a directive?
						// 	b) via the elem reference?
						// scope.osc.connect(parent.input);
					}

				// *****************************************




					// ENGAGE OSCILLATOR
					scope.osc.start();


				});

			 },
			'scope': {
				'type': '@',
				'freq': '@',
				'output': '@'
			}
		}
	});



	//------------------------------------------------
	//	FILTER
	// -----------------------------------------------
	patch.directive("filter", function(){
		return {
			'restrict': 'E',
			'controller': function($scope, $element, $attrs){
				var type = $scope.type || 'lowpass';
				var freq = $scope.freq || '440';
				var Q = $scope.Q || '1';
				var output = $scope.output || 'masterOut';
				/*
				// create an input
				this.input = context.createGain();

				// create the filter
				this.filt = context.createBiquadFilter();
				this.filt.type = type;
				this.filt.frequency.value = freq;
				this.filt.Q.value = Q;

				// our input is now connected to our filter
				this.input.connect(this.filt);

				// call it vars(?). Maybe makes more sense, in this context
				this.vars = $scope;
				*/
				// store a reference to the audioNode on the element itself
				// $element.audioNode = this;

				// $element[0].input = this.input;






				// create an input
				$scope.input = context.createGain();

				// create the filter
				$scope.filter = context.createBiquadFilter();
				$scope.filter.type = type;
				$scope.filter.frequency.value = freq;
				$scope.filter.Q.value = Q;

				// our input is now connected to our filter
				$scope.input.connect($scope.filter);









			 },
			'link': function(scope, elem, attrs, controller) {

				console.log('********', scope, elem);

				scope.$watch('output', function(output){

					if (output == 'masterOut') {
						scope.filter.connect(masterOut);
					} else {
						var destination = document.querySelector('#'+output);
						if (destination.input) {
							scope.filter.connect(destination.input);
						} else {
							console.log('"%s" not found or is not an audio node', output);
						}
					}

				});

			},
			'scope': {
				'type': '@',
				'freq': '@',
				'Q': '@',
				'output': '@'
			}
		}
	});



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



	//------------------------------------------------
	//	COMPRESSOR
	// -----------------------------------------------
	patch.directive("compressor", function(){
	  return {
		 'restrict': 'E',
		 'controller': function($scope, $element, $attrs){
			var threshold = $scope.threshold || '-24';
			var knee		= $scope.threshold || '30';
			var ratio	  = $scope.threshold || '12';
			var reduction = $scope.threshold || '0';
			var attack	 = $scope.threshold || '0.003';
			var release	= $scope.threshold || '0.25';
			// var output = $scope.output || 'masterOut';

			// create an input
			this.input = context.createGainNode();

			// create the filter
			this.comp = context.createDynamicsCompressor();
			this.comp.threshold = threshold;
			this.comp.knee		= knee;
			this.comp.ratio	  = ratio;
			this.comp.reduction = reduction;
			this.comp.attack	 = attack;
			this.comp.release	= release;

			// our input is now connected to our filter
			this.input.connect(this.comp);

			// store a reference to the input on the element itself
			$element[0].input = this.input;

		 },
		 'link': function(scope, elem, attrs, controller) {
			scope.$watch('output', function(output){

		// console.log('No output for audio node "%s". Routing to masterOut', elem[0].id);

			  if (output == 'masterOut') {
				 controller.comp.connect(masterOut);
			  } else {
				var destination = document.querySelector('#'+output);
				if (destination.input) {
				 controller.comp.connect(destination.input);
				 } else {
					console.log('"%s" not found or is not an audio node', output);
				 }
			  }

			});

		 },
		 'scope': {
			'threshold': '@',
			'knee': '@',
			'ratio': '@',
			'reduction': '@',
			'attack': '@',
			'release': '@',
			'output': '@'
		 }
	  }
	});









})(window.µ)