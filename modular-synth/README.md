# modular-synth

Experiments in WebAudio

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# run all tests
npm test
```


## TODO

- VUEX
  - ~~store state of app~~
  - ~~persist to localstorage and recall~~


- LOADING
  - FIX connection reactivity on load
  - audio chain
    - FIX audio connections on load
  - FIX modules dont gridify properly


- NODES
  - base node mixin... or?
  - DELETE node


- Connections
  - have startConnection: just draw an open-ended connection
    - addConnection will take src, dest and "replace" the user-drawn connection
  - updated connection object. See store.js line ~142 for details


- MIDI input
  - pitch
  - gate
  - note
  - bend
  - velocity
  - modwheel
  - aftertouch
- MIDI learn


- UI -- 2 modes: play / edit.
  - ~~play is grid (packery, gridlist)~~
  - ~~edit is draggables (dragabilly, vanillaJS)~~
  - dotted line while creating a connection
  - when a node is selected, all connected connections become highlighted




- NODES:
  - ENV
  - OSC
  - FILT
  - ADSR


- FX
  - reverb
  - delay
  - vca
  - lfo


- clock
  - click divider
  - quant


- routing
  - mixer (mini)
  - ~~audio out~~
