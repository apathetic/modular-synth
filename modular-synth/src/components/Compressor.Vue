
	<compressor id="comp1" output="masterOut">
		<knob data="gain">
	</compressor>

<script>


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
