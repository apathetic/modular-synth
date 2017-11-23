# modular-synth

## TODO

** DONT BOTHER trying to manage `patches` in the store; rather, keep them in
   Firebase, and cache them using a SW so that loading time is snappy

** Service worker: manage `patches` between different tabs, enabling a
   polyphonic synth where the SW intercepts the midi notes and assigns each
   to a free voice (ie tab). Similarly, different patches to be run in
   parallel, where each tab could be likened to a track in a DAW.

** Machine learning: auto-generate patches based on common or popular ones.

** create server that spits out OSC notes, 24/7. Different styles / genres
   depending on time of day (like a radio station). Then, modify Note-In to
   stream from it.
   ... or, every port is a different thing: disco inferno (on :8000),
   aleatoric wackiness (on :8001), etc



- General
  - Some sort of Module base (ie node). Currently so much duplication atm
  - load patch
    - turn off power. Problematic now that Meters plug directly into MasterOut due to Chrome bug.
  - web workers
    - offload heavy calcs, etc.
  - service workers
    - store samples, waveforms, and... stuff
    - FFT stuffs, offload to GPU a la gpu.js ...?
  - Deleting Debuggers leaves ScriptNode behind


- TESTING


- MODULES


- VUEX
  - remove FOCUS from vuex --> move to BUS


- UI
  - #connections is only 100% of viewport; doesnt extend if parent has overflow-x
  - when a node is selected, all connected connections become highlighted
  - must press shift to sort in play mode
  - single click on Module fires sortable; should only be onDrag


- LOADING
  - general usability; switching between patches kills audio / app
  - glitchy
    - fallback for bad data, etc.


- AUDIO
  - use audioParam to automate parameters
  - LEVEL is ...broken? Crazy inefficient. Check meter.js where output is connected to audioContext


- Connections
  - connecting to an outlet, connects to the inlet (ie. app doesn't distinguish between these -- just ID and port)
    - also, don't add cnx if already there (ie. non-duplicated)


- RANDOM
  - webworker (audiolet?) for Meter, etc.



---------------



  ## FIXED


  - General
    - ~~loading patches~~
      - ~~*connections load at same time as modules (which are not yet in the DOM), meaning the svg computes props fail.* This is not an issue on page load, however. Audio routing also fails as a result~~
    - ~~saving patches~~
      - ~~add firebase~~
    - ~~loading patches~~
      - ~~need to destroy nodes / webAudio connections first...?~~
      - ~~patch loads in store, but app does not update UI~~
      - ~~**loading settings**~~
    - ~~don't require 2U / 1U classes -- make a default~~
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
      - ~~drag, too?~~


  - UI
    - ~~masterOut's in/out labels are bounded by module canvas area (ie. overflow causes visual errors)~~
    - ~~Grid is wonky, doesn't get component dimensions~~
    - ~~removing connections sometimes throw errors~~
      - ~~delete module causes odd grid reshuffle~~
        - ~~update rack positions on delete~~
    - ~~delete removes wrong module~~
    - ~~dial doesn't do floats~~
    - ~~multiple module sizes~~
    - ~~can no longer click on a connection to delete it~~
    - ~~cannot select from dropdown; dragging intercedes~~
    - ~~cannot dynamically add new modules~~
    - ~~2 modes: play / edit.~~
      - ~~play: grid (packery, gridlist)~~
      - ~~edit: draggables (dragabilly, vanillaJS)~~
    - ~~dotted line while creating a connection~~
    - ~~Knobs with tiny "min" render backwards~~
    - ~~ugh, regression: modules don't retain position after dragging / switching states. Cannot reliably reproduce...~~
    - ~~removing connections: disconnects audio, but data connects throw errors~~
    - ~~knob: linear OR log~~
    - ~~saving patches~~
      - ~~saving settings~~


  - LOADING
    - ~~grid doesn't gridify after loading new patch~~
    - ~~route audio on load (use store plugin / store mutation observer)~~
      - ~~_solved with a nextTick. Dont love need to import Vue for this_~~ _update: solved more better-er by consecutively loading pieces via the load action_
    - ~~update masterOut position on load~~
    - ~~connection reactivity on load~~
    - ~~FIX modules: dont gridify properly after 1st load, adding new module~~
    - glitchy
      - ~~connections do not load on pageload; only load event~~
    - ~~load everything via firebase~~
    - ~~can have ONE patch in localstorage~~
    - ~~route audio on load (use store plugin / store mutation observer)~~
      - ~~_solved with a nextTick. Dont love need to import Vue for this_~~ _update: solved more better-er by consecutively loading pieces via the load action_
      - ~~**this doesn't work when loading new patches**~~


  - MODULES
    - ~~base node mixin...~~
      - ~~tuck away: draggable, newConnection, (vuex) col/row, (computd) left/right~~ _solved w/ vue2.0_
    - ~~DELETE node~~
      - ~~and associated audio connections~~
    - ~~VCA: WTF. Order of inputs matters? Don't understand. Gain not seeming to multiply input signal. ie. gain of 0 (from env) results in no attenuation. Solved!~~
    - ~~ENV: breaks unless each ADSR value have been set~~


  - AUDIO
    - ~~**power-off no longer kills CPU (as meters are connected)**~~
    - ~~lives in the actual components (not in the store.modules)~~
      - ~~(same problem for Connector)~~
    - ~~master out volume control~~
    - ~~hook up master out mute~~ eh, removed Mute
    - ~~click sound on ADSR~~
    - ~~**REGRESSION** visualizer not working~~
    - ~~**REGRESSION** VCO / FM not working as modulators~~


  - CONNECTIONS
    - ~~have startConnection: just draw an open-ended connection~~
      - ~~addConnection will take src, dest and "replace" the user-drawn connection~~
    - ~~updated connection object. See store.js line ~142 for details~~
    - ~~delete connection~~
    - ~~rename "data" to "audio" or "signal" or '~'~~
    - ~~reconcile "connector" name and "connection"~~
    - ~~non-audio connections
      - ~~eg: noteIn -> Env -> OSC -> out~~
    - ~~removing certain (last?) connection causes webaudio error~~


  ---------------
