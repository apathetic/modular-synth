var context = window.webkitAudioContext && (new window.webkitAudioContext());
var masterOut = context.destination;

var audio = {};

	audio.ui = {};
	audio.fx = {};
	audio.gen = {};


if (!context) {
	alert('Your crappy browser does not support webAudio');
	return;
}

if (! 'registerElement' in document) {
	alert('Your browser does not support the fancy new Web Component API');
}



//------------------------------------------------
//   KNOB
// -----------------------------------------------

audio.ui.knob = document.registerElement('audio-knob', { prototype: Object.create (

	HTMLElement.prototype, {

		createdCallback: {
			value: function() {
				// "this" is the actual <audio-knob> element
				// -------------------------------

				var notch = document.createElement('div');		// the 'notch'
				var val   = document.createElement('span');		// the int 'val'

				// var minRotation = -70,
				// 		maxRotation = 250,

				var rotation = -70,
						min = parseInt(this.attributes.min.nodeValue || 0),
						max = parseInt(this.attributes.max.nodeValue || 100),
						startY,
						startVal,
						value = 0,
						mouseDown = false;


				this.appendChild(notch);
				this.appendChild(val);

				this.addEventListener('mousedown', function(e) {
					mouseDown = true;
					startY = e.clientY;
					startVal = value;
				});
				document.addEventListener('mouseup', function(e) {
					mouseDown = false;
				});
				document.addEventListener('mousemove', function(e) {
					if (mouseDown) {

						value = parseInt(startVal + (startY - e.clientY));

						if (value < min) { value = min; }
						else if (value > max) { value = max; }

						rotation = 320 * (value / max) - 70;		// 320 is 250 - (-70)

						setRotationDegrees(rotation);
						val.innerHTML = value;

					}
				});

				function setRotationDegrees (degree) {
					notch.style.webkitTransform = 'rotate('+degree+'deg)';
				}
			}
			// writable: false,
			// enumerable: true
		}

	})

});

audio.ui.slider = {};


//------------------------------------------------
//   OSCILLATOR
// -----------------------------------------------

audio.gen.osc = document.registerElement('audio-oscillator', { prototype: Object.create (

	HTMLElement.prototype, {

		osc: (function() {
			var x =	context.createOscillator();
					x.type = 'sine';
					x.frequency.value = 440;
			return x;
		})(),

		freq: function(f) {
			this.osc.frequency.value = f;
		},

		type: function(t) {
			this.osc.type = t;
		}

	})

});

/*
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

*/

//------------------------------------------------
//   FILTER
// -----------------------------------------------

audio.filter = document.registerElement('audio-filter', { prototype: Object.create (

	HTMLElement.prototype, {
		/*
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

			// -------------------------------

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

		*/
	})

});



//------------------------------------------------
//   DELAY
// -----------------------------------------------

audio.delay = document.registerElement('audio-delay', { prototype: Object.create (

	HTMLElement.prototype, {
		/*
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

			// ---------------------------------

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
		*/
	})

});



//------------------------------------------------
//   COMPRESSOR
// -----------------------------------------------
audio.compressor = document.registerElement('audio-compressor', { prototype: Object.create (

	HTMLElement.prototype, {
		/*
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


			// ---------------------------------------------

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
		*/
	})

});



