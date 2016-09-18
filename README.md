# modular-synth

Experiments in WebAudio


TODO

- VUEX
  - store state of app
  - persist to localstorage and recall

- Connections:
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
  - play is grid (packery, gridlist)
  - edit is draggables (dragabilly, vanillaJS)
  - dotted line while creating a connection
  - when a node is selected, all connections become highlighted

- audio chain

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
  - audio out
