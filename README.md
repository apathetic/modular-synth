# modular-synth

[![CircleCI](https://circleci.com/gh/apathetic/modular-synth/tree/master.svg?style=svg)](https://circleci.com/gh/apathetic/modular-synth/tree/master)

> Experiments in WebAudio

Note: much of this code inspired by:
* https://tonejs.github.io
* https://github.com/cwilso/WebAudio
* https://github.com/idflood/Threenodes.js


## Quick Start

* Visit [malformed.ca](https://malformed.ca/).
* From the switch on the top right, switch the patch into `edit` mode (or, press `tab`)
* Right-click to add modules
* Toggle to `play` mode to adjust parameters, etc.

This demo presumes an existant knowledge of modular synthesis. For example, how to generate a note by modulating the amplitude of an oscillator with a envelope generator.

### Simple synth
* While in `edit` mode, right-click and create a `NoteIn` component
* Next, right-click and create a `VCO` (voltage-controlled oscillator) component
* Connect the `freq` _output_ of the `NoteIn` to the `freq` _input_ of the `VCO`
* Create an `Env` component; connect the `vel` _output_ of the `NoteIn` to the `vel` _input_ of the `Env`
* Create a `VCA` component; connect the outputs from both the `VCO` and `Env` to its inputs
* Connect the outputs of the `VCO` to the `out-1` and `out-2` ("master outs") in the bottom left corner
* Switch to `play` mode and turn on the patch (bottom right). You can trigger notes using `ASDFG` on your keyboard*

\* or you can use MIDI or even OSC :)

## Saving data

All patch data is, by default, stored in LocalStorage. However, if you wish to persist data from multiple patches and parameter sets, you may can create an account / sign in by clicking the glowing ring in the top right. I use `Firebase` to store patch data in JSON format.


## Docs

* [Building](docs/building.md)
* [Component structure](docs/components.md)
* [Component roadmap](docs/roadmap.md)
* [Application events](docs/events.md)

