
	<filter type="bandpass" output="masterOut">

		<!-- Filter Controls -->
		<knob param="Q" default="0.8" min="0.1" max="2.0"></knob>
		<knob param="f" default="440" min="100" max="5000"></knob>
		<!-- <knob param="gain" default="0.8" max="1.0"></knob> -->

		<!-- Inputs -->
		<oscillator type="saw">
			<knob param="freq" default="440" max="2000"></knob>
		</oscillator>

		<oscillator type="sine">
			<knob param="freq" default="85" max="2000"></knob>
		</oscillator>

	</filter>






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
