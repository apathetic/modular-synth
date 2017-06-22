# modular-synth

Experiments in WebAudio

Note: much of this code inspired by:
* https://tonejs.github.io
* https://github.com/Theodeus/tuna
* https://github.com/cwilso/WebAudio
* https://github.com/idflood/Threenodes.js


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm start

# build for production with minification
npm run build

# run all tests
npm test
```




## APPLICATION NOTES:

**EVENTS**
  - App
    - app:load
    - app:sort    // app:sorting:init
  - module
    - module:add
    - module:remove
  - parameters
    - parameters:load
  - audio
    - audio:start
    - audio:stop
  - drag
    - drag:start
    - drag:active
    - drag:end
  - midi
    - midi:noteOn
    - midi:noteOff
    - midi:controller
    - midi:pitchWheel
    - midi:polyPressure


**ROUTING / PORT TYPES**
  - inlets:
    - in
    - out
  - data types:
    - audioParam (a-rate)
      - pitch / freq
      - mod (A, B, FM?)
    - control data (k-rate)
      - triggers or bangs (events?):
        - gate
        - reset (more for sequencing)
        - sync (ie. phase)


**NODE ROADMAP**
  - BASE
    - ~~ENV~~
    - OSC
      - ~~simple~~
      - fat osc
      - pwm osc
      - fm osc
    - ~~LFO~~
    - FILT
      - ~~simple~~
      - resonant
      - moog
      - comb
    - ~~VCA~~
      - ~~MULT (deprecated)~~


  - FX
    - reverb
      - simple
    - delay
      - simple
      - ping pong
    - bitcrusher


  - timing
    - clock
    - stepper / arpeggiator
    - click divider(maybe?)
    - quant(maybe?)


  - routing
    - mixer (mini)
    - ~~audio out~~


  - MIDI
    - noteIn
      - ~~pitch~~
      - ~~gate~~
    - bend
    - velocity
    - mod-wheel
    - aftertouch
    - MIDI learn


  ---------------
