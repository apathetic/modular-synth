var context = window.webkitAudioContext && (new window.webkitAudioContext());
var masterOut = context.destination;
var patch = angular.module("audio", []);

if (!context) {
	alert('Your crappy browser does not support webAudio');
	return;
}

//--------------------------------------------------------------//




/*

patch.directive("knob", function(){
	return {
		'restrict': 'E',
		'controller': function($scope, $elem, $attrs){
			var data = $attrs.data;
			if (!data) {
				console.log('Knob: nothing to control', $elem);
				return;
			}

			$scope.data = '';

		},
    'link': function(scope, elem, attrs, controller) {

	    var dial = elem.find('.dial');
      var notch = elem.find('.notch');

      // options. TODO overwrite these on init(), or move to Controller
      var dialOffsetLow = -70,
        	dialOffsetHigh = 250,
        	maxDegreeShift = 320,
        	dialSpeed = 0.5;
      //   onAdjust: function (percentage) {}
      //   //==>this.node.frequency.value = percentage * 300


	    //  this.node.connect(context.destination);
	    //  this.node.noteOn(0);


      // Get the correct degree shift based on dial speed
      maxDegreeShift = maxDegreeShift * dialSpeed;

      var rotationValue = dialOffsetLow;
      var value = 0,
          startValue;

      // Vars
      var clientY = 0,
      		clientYDown = 0,
      		clientYUp = 0,
      		rotationValue,
      		percentage = 0;

      // Switch
      var mouseDown = false;

      // Event to update degree
      elem.mousedown(function (e) {
        mouseDown = true;
        rotationValue = self.getRotationDegrees();
        clientYDown = e.clientY;
        startValue = value;
      });

      $(window).mouseup(function (e) {
        mouseDown = false;
        clientYUp = e.clientY;
      });

      $(window).mousemove(function (e) {

        if (mouseDown) {

          // Difference between starting Y and current Y
          clientYDiff = e.clientY - clientYDown;

          // Set value of dial based on the position of it previous to this mousedown/move event
          value = startValue - clientYDiff;

          // Min
          if (value <= 0) {
            value = 0;
          }
          // Max
          else if (value > maxDegreeShift) {
            value = maxDegreeShift;
          }

          // For every dialSpeed moved by mouse, we move a degree
          rotationValue = ((value / dialSpeed) + dialOffsetLow);

          // Only rotate within our boundaries
          if (rotationValue > dialOffsetLow && rotationValue < dialOffsetHigh) {
            self.setRotationDegrees(rotationValue);
          }

          self.percentage = (value / maxDegreeShift) * 100;

          // self.options.onAdjust(self.percentage);
          scope.data = self.percentage;

        }

      });



        /*
        getRotationDegrees: function () {

          var matrix =
          	  this.notch.css("-webkit-transform") ||
              this.notch.css("-moz-transform")    ||
              this.notch.css("-ms-transform")     ||
              this.notch.css("-o-transform")      ||
              this.notch.css("transform");

          if (matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            var a = values[0];
            var b = values[1];
            var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
          }
          else {
            var angle = 0;
          }

          return angle;

        },

        setRotationDegrees: function (degree) {

          this.selectors.notch.css('-webkit-transform', 'rotate(' + degree + 'deg)');

        }
        /* * /




      scope.knob = new dial(this, options);





		},
		'scope': {},
		'templateUrl': 'partials/knob.html'
	}
});

*/



//------------------------------------------------
//   OSCILLATOR
// -----------------------------------------------
patch.directive("oscillator", function(){
	return {
		'restrict': 'E',
		'controller': function($scope, $element, $attrs){
      var type = $scope.type || 'sine';
      var freq = $scope.freq || '440';
      var output = $scope.output || 'masterOut';

			this.osc = context.createOscillator();
      this.osc.type = type;
      this.osc.frequency.value = freq;

      // create an input
      // this.input = context.createGainNode();

      // call it vars(?). Maybe makes more sense, in this context
      this.vars = $scope;

		},
    'link': function(scope, elem, attrs, controller) {
      scope.$watch('output', function(output){
        if (output == 'masterOut') {
          controller.comp.connect(masterOut);
        } else {
         var destination = document.querySelector('#'+output);
         if (destination.input) {
          // we hook up everything in the link function -- ie. after all
          // audio nodes have been instantiated
          controller.osc.connect(destination.input);
          } else {
            console.log('"%s" not found or is not an audio node', output);
          }
        }

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
//   FILTER
// -----------------------------------------------
patch.directive("filter", function(){
  return {
    'restrict': 'E',
    'controller': function($scope, $element, $attrs){
      var type = $scope.type || 'lowpass';
      var freq = $scope.freq || '440';
      var Q = $scope.Q || '1';
      var output = $scope.output || 'masterOut';

      // create an input
      this.input = context.createGainNode();

      // create the filter
      this.filt = context.createBiquadFilter();
      this.filt.type = type;
      this.filt.frequency.value = freq;
      this.filt.Q.value = Q;

      // our input is now connected to our filter
      this.input.connect(this.filt);

      // call it vars(?). Maybe makes more sense, in this context
      this.vars = $scope;

      // store a reference to the audioNode on the element itself
      // $element.audioNode = this;

      $element[0].input = this.input;

    },
    'link': function(scope, elem, attrs, controller) {
      scope.$watch('output', function(output){

        if (output == 'masterOut') {
          controller.comp.connect(masterOut);
        } else {
         var destination = document.querySelector('#'+output);
         if (destination.input) {
          controller.filt.connect(destination.input);
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
//   DELAY
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
//   COMPRESSOR
// -----------------------------------------------
patch.directive("compressor", function(){
  return {
    'restrict': 'E',
    'controller': function($scope, $element, $attrs){
      var threshold = $scope.threshold || '-24';
      var knee      = $scope.threshold || '30';
      var ratio     = $scope.threshold || '12';
      var reduction = $scope.threshold || '0';
      var attack    = $scope.threshold || '0.003';
      var release   = $scope.threshold || '0.25';
      // var output = $scope.output || 'masterOut';

      // create an input
      this.input = context.createGainNode();

      // create the filter
      this.comp = context.createDynamicsCompressor();
      this.comp.threshold = threshold;
      this.comp.knee      = knee;
      this.comp.ratio     = ratio;
      this.comp.reduction = reduction;
      this.comp.attack    = attack;
      this.comp.release   = release;

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









