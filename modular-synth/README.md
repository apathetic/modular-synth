# modular-synth

Experiments in WebAudio

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


## TODO

- INPUT TYPES
  - in
  - out
  - mod (A, B, FM?)
  - pitch (freq?)
  - triggers or bangs:
    - gate
    - reset (more for sequencing)
    - sync (ie. phase)

- VUEX
  - ~~store state of app~~
  - ~~persist to localstorage and recall~~
  - common getters / setters (ie. active module, connection, etc)
  - stop importing ES6 reference to store. Isn't it on the $root?


- UI
  - ~~cannot select from dropdown; dragging intercedes~~
  - dial doesn't do floats **
  - cannot dynamically add new modules
  - 2 modes: play / edit.
    - ~~play: grid (packery, gridlist)~~
    - ~~edit: draggables (dragabilly, vanillaJS)~~
    - dotted line while creating a connection
    - when a node is selected, all connected connections become highlighted


- LOADING
  - ~~update masterOut position on load~~
  - ~~connection reactivity on load~~
  - ~~route audio on load *** (use store plugin / store mutatin observer)~~
  - FIX modules: dont gridify properly after 1st load, adding new module ***


- NODES
  - base node mixin...
    - tuck away: draggable, newConnection, (vuex) col/row, (computd) left/right
  - DELETE node ***
    - and associated audio connections ***


- Audio
  - ~~lives in the actual components (not in the store.modules)~~
    - ~~(same problem for Connector)~~
  - global "get (actual) component by id" method?
  - master out volume control


- Connections
  - have startConnection: just draw an open-ended connection
    - addConnection will take src, dest and "replace" the user-drawn connection
  - ~~updated connection object. See store.js line ~142 for details~~
  - ~~delete connection~~
  - rename "data" to "audio" or "signal" or '~'
  - reconcile "connector" name and "connection"


- MIDI
  - pitch
  - gate
  - note
  - bend
  - velocity
  - mod-wheel
  - aftertouch
  - MIDI learn




----------------------------------------------------------------


- NODES:
  - ~~MULT~~

  - ENV
  - ~~OSC~~
  - LFO
  - FILT


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
