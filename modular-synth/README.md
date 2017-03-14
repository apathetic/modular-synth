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

# TEMP: you'll need to fire up the /api server:
node server
# This will be integrated into the main app at one point
```


## TODO

- General
  - saving patches
    - add firebase
    - **saving settings**
  - service workers
    - store samples, waveforms
  - ~~new parent / child events~~
    - ~~.native on components~~
  - ~~dragging / sorting is messed up~~
  - ~~connectors are messed up, dont have x,y coords~~
  - ~~convert vuex commit payloads to objects~~
  - ~~remove module does not work~~
  - ~~clicking on outlet (not drag) errors out~~
  - ~~audio no longer connecting~~


- VUEX
  - ~~store state of app~~
  - ~~persist to localstorage and recall~~
  - ~~update to 2.0~~
    - ~~common getters / setters (ie. active module, connection, etc)~~
  - ~~stop importing ES6 reference to store. Isn't it on the $root?~~
  - remove FOCUS from vuex --> move to BUS
    - ~~drag, too?~~

- UI
  - ~~Delete removes wrong module~~
  - **removing connections sometimes throw errors**
    - ~~delete module causes odd grid reshuffle~~
      - ~~update rack positions on delete~~
  - ugh, regression: modules don't retain position after dragging / switching states. Cannot reliably reproduce...
  - masterOut's in/out labels are bounded by module canvas area (ie. overflow causes visual errors)
  - ~~dial doesn't do floats~~
  - when a node is selected, all connected connections become highlighted
  - must press shift to sort in play mode
  - ~~multiple module sizes~~
  - ~~can no longer click on a connection to delete it~~
  - ~~cannot select from dropdown; dragging intercedes~~
  - ~~cannot dynamically add new modules~~
  - ~~2 modes: play / edit.~~
    - ~~play: grid (packery, gridlist)~~
    - ~~edit: draggables (dragabilly, vanillaJS)~~
  - ~~dotted line while creating a connection~~


- LOADING
  - ~~update masterOut position on load~~
  - ~~connection reactivity on load~~
  - ~~route audio on load (use store plugin / store mutation observer)~~ _solved with a nextTick. Dont love need to import Vue for this_
  - ~~FIX modules: dont gridify properly after 1st load, adding new module~~
  - fallback for bad data, etc.
  - glitchy
    - ~~connections do not load on pageload; only load event~~


- NODES
  - ~~base node mixin...~~
    - ~~tuck away: draggable, newConnection, (vuex) col/row, (computd) left/right~~ _solved w/ vue2.0_
  - ~~DELETE node~~
    - ~~and associated audio connections~~


- AUDIO
  - use audioParam to automate parameters
  - ~~lives in the actual components (not in the store.modules)~~
    - ~~(same problem for Connector)~~
  - global "get (actual) component by id" method?
  - ~~master out volume control~~
  - ~~hook up master out mute~~ eh, removed Mute
  - **power-off no longer kills CPU (as meters are connected)**
    - LEVEL is ...broken? Crazy inefficient. Check meter.js where output is connected to audioContext


- Connections
  - removing certain (last?) connection causes webaudio error
  - ~~have startConnection: just draw an open-ended connection~~
    - ~~addConnection will take src, dest and "replace" the user-drawn connection~~
  - ~~updated connection object. See store.js line ~142 for details~~
  - ~~delete connection~~
  - rename "data" to "audio" or "signal" or '~'
  - ~~reconcile "connector" name and "connection"~~
  - connecting to an outlet, connects to the inlet (ie. app doesn't distinguish between these -- just ID and port)


---------------

NOTES:

**EVENTS**
- App
  - app:load
- module
  - module:add
  - module:remove
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
- inputs
  - in
  - out
- data types
  - mod (A, B, FM?)
  - pitch (freq?)
  - triggers or bangs:
    - gate
    - reset (more for sequencing)
    - sync (ie. phase)


**NODE ROADMAP**

- GEN
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


- MIDI
  - ~~pitch~~
  - gate
  - bend
  - velocity
  - mod-wheel
  - aftertouch
  - MIDI learn
