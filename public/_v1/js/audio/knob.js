

    (function ($) {

      var defaults = {
        dialOffsetLow: -70,
        dialOffsetHigh: 250,
        maxDegreeShift: 320,
        dialSpeed: 0.5,
        onAdjust: function (percentage) {}
      };

      // The actual plugin constructor
      var dial = function (element, options) {

        this.element = element;

        this.selectors = {
          notch: $(this.element).find('.notch')
        };

        this.options = $.extend({}, defaults, options);

        this.init();

        this.options.onInit();

      }

      dial.prototype = {

        percentage: 0,

        init: function () {

          var self = this;

          // Get the correct degree shift based on dial speed
          self.options.maxDegreeShift = self.options.maxDegreeShift * self.options.dialSpeed;

          var rotationValue = self.options.dialOffsetLow;

          var value = 0,
            startValue;

          // Vars
          var clientY = 0, clientYDown = 0, clientYUp = 0, rotationValue, percentage = 0;

          // Switch
          var mouseDown = false;

          // Event to update degree
          $(self.element).mousedown(function (e) {
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
              else if (value > self.options.maxDegreeShift) {
                value = self.options.maxDegreeShift;
              }

              // For every dialSpeed moved by mouse, we move a degree
              rotationValue = ((value / self.options.dialSpeed) + self.options.dialOffsetLow);

              // Only rotate within our boundaries
              if (rotationValue > self.options.dialOffsetLow && rotationValue < self.options.dialOffsetHigh) {

                self.setRotationDegrees(rotationValue);

              }

              self.percentage = (value / self.options.maxDegreeShift) * 100;

              self.options.onAdjust(self.percentage);

            }

          });

        },

        getRotationDegrees: function () {

          var matrix =  this.selectors.notch.css("-webkit-transform") ||
                  this.selectors.notch.css("-moz-transform")    ||
                  this.selectors.notch.css("-ms-transform")     ||
                  this.selectors.notch.css("-o-transform")      ||
                  this.selectors.notch.css("transform");

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

      }

      // Bind into jQuery.
      $.fn.dial = function (options) {

        // For each instance of the selector, create the plugin
        return this.each(function () {

          if (!$.data(this, 'plugin_dial')) {
            $.data(this, 'plugin_dial', new dial(this, options));
          }

        });
      }

    })(jQuery);


    var context = new webkitAudioContext();

    $('#osc .dial').dial({
      node: context.createOscillator(),
      onInit: function () {
        this.node.connect(context.destination);
        this.node.noteOn(0);
      },
      onAdjust: function (percentage) {
        this.node.frequency.value = percentage * 300;
      }
    });


