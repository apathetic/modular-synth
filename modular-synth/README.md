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

- General post-vue 2.0 things
  - ~~new parent / child events~~
    - ~~.native on components~~
  - ~~dragging / sorting is messed up~~
  - ~~connectors are messed up, dont have x,y coords~~
  - ~~convert vuex commit payloads to objects~~
  - ~~remove module does not work~~
  - clicking on outlet (not drag) errors out
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
  - ***Delete removes wrong module***
    - **removing connections also throw errors**
  - masterOut's in/out labels are bounded by module canvas area (ie. overflow causes visual errors)
  - ~~cannot select from dropdown; dragging intercedes~~
  - *dial doesn't do floats*
  - ~~cannot dynamically add new modules~~
  - ~~2 modes: play / edit.~~
    - ~~play: grid (packery, gridlist)~~
    - ~~edit: draggables (dragabilly, vanillaJS)~~
  - dotted line while creating a connection
    - when a node is selected, all connected connections become highlighted
  - delete module causes odd grid reshuffle
  - must press shift to sort in play mode


- LOADING
  - ~~update masterOut position on load~~
  - ~~connection reactivity on load~~
  - ~~route audio on load (use store plugin / store mutation observer)~~ solved with a nextTick wtf. Import Vue for this. Dont understand why.
  - ~~FIX modules: dont gridify properly after 1st load, adding new module~~
  - fallback for bad data, etc.
  - glitchy
    - connections do not load on pageload; only load event


- NODES
  - ~~base node mixin...~~
    - ~~tuck away: draggable, newConnection, (vuex) col/row, (computd) left/right~~ solved w/ vue2.0
  - ~~DELETE node~~
    - ~~and associated audio connections~~


- Audio
  - ~~lives in the actual components (not in the store.modules)~~
    - ~~(same problem for Connector)~~
  - global "get (actual) component by id" method?
  - ~~master out volume control~~
  - ~~hook up master out mute~~ eh, removed Mute
  - **power-off no longer kills CPU (as meters are connected)**
    - LEVEL is ...broken? Crazy inefficient. Check meter.js where output is connected to audioContext


- Connections
  - ~~have startConnection: just draw an open-ended connection~~
    - ~~addConnection will take src, dest and "replace" the user-drawn connection~~
  - ~~updated connection object. See store.js line ~142 for details~~
  - ~~delete connection~~
  - rename "data" to "audio" or "signal" or '~'
  - ~~reconcile "connector" name and "connection"~~



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


**ROUTING**
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
