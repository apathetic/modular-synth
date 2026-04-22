# Architecture: the three parallel graphs

A running patch is held in **three graphs** that all reference the same
`moduleId`. They are created, read, and torn down on different schedules; a
lot of the trickier bugs in this codebase have come from blurring the line
between them. Keep them straight and most things fall out.

```
                   ┌────────────────────────────┐
                   │  1. Patch data (JSON)      │
                   │  Pinia + localStorage      │
                   │  modules[], connections[]  │
                   └────────────┬───────────────┘
                                │ moduleId
                 ┌──────────────┼──────────────┐
                 ▼                             ▼
   ┌─────────────────────────┐   ┌──────────────────────────┐
   │  2. Audio graph         │   │  3. Parameter values     │
   │  AudioNodes + WebAudio  │   │  preset.parameters[id]   │
   │  `@/audio/registry`     │   │  Pinia + localStorage    │
   │  (runtime only)         │   │  (per-preset)            │
   └─────────────────────────┘   └──────────────────────────┘
```

The three exist because they have fundamentally different natures:

| Concern | Serializable | Reactive | Lifetime |
| ---     | ---          | ---      | ---      |
| Patch data (1)        | yes | yes | persisted                 |
| Audio graph (2)       | no  | no  | component mount/unmount   |
| Parameter values (3)  | yes | yes | persisted                 |

## 1. Patch data

The ground truth for the **shape** of a patch: which modules exist, what they
connect to, what named parameter presets it ships with.

```ts
type Patch = {
  id: string;                  // uuid
  i: number;                   // monotonic module-id counter
  loaded?: boolean;            // runtime flag, stripped on write
  name: string;
  modules:     Module[];       // { id, type, x, y, col, row, w, h }
  connections: Connection[];   // { id, from: {id, port}, to: {id, port} }
  presets:     Preset[];       // see §3
}
```

Lives in Pinia (`useAppStore().patches`, `useAppStore().patch`) and is
persisted to `localStorage` under the `synth.patches` key inside a versioned
envelope (`{ version, patches }`).

Read path: `loadPatches()` → Zod validate → `fixPatch` repair → store init.
Write path: narrow `watch(() => store.patches, …, { deep: true })` debounces
for 2 s, validates, then `JSON.stringify`s (the replacer strips the transient
`loaded` flag).

The `loaded` flag is the only per-patch runtime concern that leaks into the
patch object: it gates rendering of `<Connection>` components so they only
mount **after** the modules (and therefore the audio registry) are up. See
`loadPatch()` in `src/stores/app/index.ts`.

## 2. Audio graph

The live WebAudio graph — a collection of `AudioNode`s (`OscillatorNode`,
`GainNode`, `BiquadFilterNode`, …) wired together with `.connect()` /
`.disconnect()`. **Never serialized, never reactive.**

Each module component mints its own audio handles in `setup()` / `created()`
using the factories in `src/audio/index.ts`, assembles them into an
inlets/outlets bag, and `expose()`s that bag. The wrapping `<Unit>`
component picks the exposed node up in `onMounted` and calls
`registry.add(id, node)`.

```ts
// src/audio/registry.ts
const nodes = new Map<number, SynthNode>();
export const registry = {
  add(id, node): void, remove(id): void,
  get(id): SynthNode | undefined,
  has(id): boolean, clear(): void,
};
```

The registry is a plain module-level `Map`, **not** Pinia state. Reasons:

* Audio handles aren't `structuredClone`-able; putting them in reactive state
  creates serialization landmines (this is what the historical
  `DataCloneError` traces were).
* Registry mutations happen on every module mount/unmount. Making them
  reactive would force the persistence watcher to re-run on every patch
  load for no UI benefit.
* No template reads from it; only two imperative consumers (`<Connection>`'s
  routing effect, and the dev `clear()` action) need access.

The **edges** of the audio graph live entirely inside WebAudio: there is no
list of `AudioNode → AudioNode` edges in memory beyond what WebAudio tracks
internally. `<Connection>` holds a closure that knows how to undo its own
edge on unmount.

## 3. Parameter values

Knob / slider / dropdown state, stored **per preset** inside the patch. The
on-disk shape is nested by `moduleId`:

```ts
type Preset = {
  name: string;
  parameters: {
    [moduleId: number]: {
      [paramName: string]: number | string;
    };
  };
};
```

e.g. for the seed patch:

```json
"parameters": {
  "1": { "mod": 0, "freq": 100, "PW": 0, "detune": -500 },
  "5": { "attack": 0.01, "decay": 0.01, "sustain": 0.01, "release": 0.01 }
}
```

The nesting by `moduleId` means:

* cleanup on module removal is one `delete` per preset (`removeModule` does
  this explicitly);
* a malformed `moduleId` (e.g. `undefined`) is a TypeScript error, not a
  silently-poisoned preset as in the old `${moduleId}-${param}` flat form;
* each module's value set is self-contained and easy to inspect at the JSON
  level.

Access goes through the store:

```ts
store.setParameter({ moduleId, param, value });
store.removeParameter({ moduleId, param });
store.getParameter(moduleId, param);    // active preset lookup
store.parameters;                        // full ParameterMap for active preset
```

`useParameter()` (in `src/composables/parameter.js`) is the bridge between
the UI control and the store. It seeds a default on mount, reflects store
value → `mapped`/`normalized` refs with `watchEffect`, and writes back
on drag.

## How the three graphs relate

The glue is **`moduleId`**, an integer minted by the `Patch.i` counter when
a module is added. Every graph keys by it:

```
patch.modules.find(m => m.id === N)    // graph (1)
registry.get(N)                         // graph (2)
preset.parameters[N]                    // graph (3)
```

A module id is **only valid for the lifetime of one patch**. Switching
patches remounts every module, which means:

1. Old `<Unit>`s unmount → `registry.remove(id)` → audio handles eligible
   for GC.
2. `store.patch` swaps to the new patch object.
3. `await nextTick()` — DOM + registry re-populate for the new patch.
4. `patch.loaded = true` → `<Connection>` components mount → `route()` runs,
   wiring the new audio graph.

The `nextTick` + `loaded` gate is what keeps `Connection.setup` from
reading an empty registry.

## Lifecycle summary

```
localStorage ──(loadPatches)──►  patches[]  ──(loadPatch)──►  store.patch
                                                                │
                         render ◄────────────────────────── <Rack>
                                        ▼
                              <Unit v-for="module">
                             ┌────────┴─────────┐
                             ▼                  ▼
                    <component :is="type">   provideModuleId(id)
                             │
                    setup() creates AudioNodes
                    expose({ inlets, outlets })
                             │
                      onMounted → registry.add(id, node)
                             │
                 await nextTick, patch.loaded = true
                             │
                     <Connection v-for="c">
                             │
                 route() → outlet.audio.connect(inlet.audio)

     UI interaction
         │
         ▼
   useParameter({ moduleId, param, … })
         │  mousedown/drag
         ▼
   store.setParameter({ moduleId, param, value })
         │
         ▼                                ┌── watch(store.patches, deep) ──┐
   preset.parameters[id][name] = value ───┤                                │
         │                                └── debounce 2s ─► localStorage ─┘
         ▼
   useParameter.watchEffect(() => store.getParameter(moduleId, param))
         │
         ▼
   mapped.value = v   →   component @value → module's local watcher →
                          real AudioParam.value = v
```

## See also

* `src/stores/patch/index.ts` — `basicPatch()` seed shape.
* `src/utils/persistence.ts` — read/validate/repair.
* `src/utils/validatePatch.ts` — Zod type guards and `fixPatch`.
* `src/audio/registry.ts` — runtime-only audio registry.
* `src/composables/parameter.js` — UI ↔ store binding.
