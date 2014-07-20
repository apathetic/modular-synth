//------------------------------------------------
//	CONTROL
// -----------------------------------------------
/**
 * Provides access to a property of a node
 * @return {[type]} [description]
 */
// µ.patch.directive("control", function(){
// });



//------------------------------------------------
//	KNOB
// -----------------------------------------------
µ.patch.directive("knob", function(){
	return {
		'restrict': 'E',
		'controller': function($scope, $element, $attrs){
			var param = $attrs.param;
			if (!param) {
				console.log('Knob: nothing to control', $elem);
				return;
			}

			$scope.param = '';
		},
		'link': function(scope, elem, attrs, controller) {

			// angular vars
			var value = attrs.default || 0,			// default value of the parameter the knob is controlling
				param = attrs.param;				// name of the parameter the knob is controlling

			// knob UI vars
			var notch = elem[0].querySelector('.notch'),
				minValue = attrs.min || 0,
				maxValue = attrs.max || 100,
				range = maxValue - minValue,
				tempValue,
				clientYDown = 0,
				degrees,
				mouseDown = false;

			// watch for changes the knob's value and update the value on the parent scope accordingly
			scope.$watch('value', function(x){
				scope[param] = x;		// scope is shared with the parent, here
			});

			// is this the best way to bind events...?
			elem.bind('mousedown', function(e) {
				mouseDown = true;
				clientYDown = e.clientY;
				tempValue = value;
			});

			window.addEventListener('mouseup', function(e) {
				mouseDown = false;
			});

			window.addEventListener('mousemove', function(e) {

				if (mouseDown) {

					// subtract delta = difference between startingY and currentY
					value = tempValue - (e.clientY - clientYDown);

					// bound knob's value 0 <-> 100
					value = Math.min(100, Math.max(0, value));

					// For every 1px moved by mouse, we move a 3.2 degrees (for a total of 320 degrees of rotation)
					degrees = (value / 0.3125) - 160;		// the -160 because it's the rotation offset

					// update knob view
					// self.setRotationDegrees(degrees);
					notch.style['-webkit-transform'] = 'rotate(' + degrees + 'deg)';
					notch.style['-moz-transform'] = '.';
					notch.style['-ms-transform'] = '';
					notch.style['-o-transform'] = '';
					notch.style['transform'] = '';

					// update the scope value using the knob's
					scope.$apply(function(){
						scope.value = (value/100 * range) + minValue;
						// scope.value = value;
					});

				}
			});
		},
		'templateUrl': 'partials/knob.html'
		// // 'templateUrl': '<div class="knob"><div class="notch"></div></div>'
	}
});
