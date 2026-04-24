# Architecture: the two parallel graphs

A running patch is held in **two graphs** that both reference the same
`moduleId`. They are created, read, and torn down on different schedules; a
lot of the trickier bugs in this codebase have come from blurring the line
between them. Keep them straight and most things fall out.

```
                   ┌────────────────────────────┐
                   │  1. Patch data (JSON)      │
                   │  Pinia + localStorage      │
                   │  modules[], connections[]  │
                   │  presets (parameters)      │
                   └────────────┬───────────────┘
                                │ moduleId
                                ▼
                   ┌─────────────────────────┐
                   │  2. Audio graph         │
                   │  AudioNodes + WebAudio  │
                   │  `@/audio/registry`     │
                   │  (runtime only)         │
                   └─────────────────────────┘
```

The two exist because they have fundamentally different natures:

| Concern | Serializable | Reactive | Lifetime |
| ---     | ---          | ---      | ---      |
| Patch data (1)        | yes | yes | persisted                 |
| Audio graph (2)       | no  | no  | component mount/unmount   |

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
  presets:     Preset[];       // parameter values
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

### Parameter values

Knob / slider / dropdown state is stored **per preset** inside the patch. The
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


Access goes through the store:

```ts
store.setParameter({ moduleId, param, value });
store.removeParameter({ moduleId, param });
store.getParameter(moduleId, param);    // active preset lookup
store.parameters;                        // full ParameterMap for active preset
```

`useParameter()` (in `src/composables/parameter.js`) is the bridge between
the UI control and the store.

* **Read** side: a `watchEffect` reflects `store.getParameter(moduleId,
  param)` → local `mapped` / `normalized` refs.
* **Write** side: `store.setParameter(...)` is called *only* from user
  input (drag, dropdown select). There is no default-seeding on mount:
  unset entries stay at the control's `props.default ?? min` and are only
  materialized in the preset once the user actually changes them.
* **Teardown**: deliberately does **not** call `store.removeParameter` on
  unmount. The two scenarios that fire unmounts — module deletion and
  patch switch — are either redundant with `removeModule`'s per-preset
  cleanup (scenario 1) or actively harmful (scenario 2: `this.patch` has
  already swapped, so leaves would be deleted from the incoming patch).

This keeps presets small and round-trip-stable — a freshly-loaded preset
looks identical on save, with no drive-by writes during mount or
teardown.

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

### MasterOut is a singleton

`MasterOut` is the fixed sink that every patch routes into. Conceptually it
isn't a user-placed rack module — its id is always `0`, `fixPatch` re-inserts
it if missing, and it's rendered once in App.vue's sidebar. Its audio graph
lives in `src/audio/master.ts`:

```ts
// src/audio/master.ts — runs once at module load
const out1 = gain(0.5), out2 = gain(0.5);
out1.connect(context.destination);
out2.connect(context.destination);
registry.add(MASTER_ID, { inlets: [...] });
export const master = { out1, out2, inlets, setGain };
```

Because the nodes are module-level singletons, re-rendering `<MasterOut />`
is an audio no-op — no duplicate summing gains, no second
`context.destination` wire, no registry clobber.

Three layers enforce the "render exactly once" contract:

1. `store.rackModules` (getter) excludes `id === MASTER_ID` — anything
   iterating `<Unit>`s binds here, not to `store.modules`.
2. `MasterOut` is deliberately **not** in the `src/components` barrel, so
   `<component :is="module.type">` inside `<Unit>` can't resolve it.
3. `<Unit>` throws if it ever receives `id === MASTER_ID` or
   `type === 'MasterOut'`, converting a silent double-mount into a loud,
   actionable error.

The "what kind of edge is this and how do I create/destroy it" decision
lives in `src/audio/routing.ts`:

```ts
import { wire } from '@/audio/routing';

const handle = wire(
  { node: src.node,  port: from.port },
  { node: dest.node, port: to.port },
);
// ...later
handle.unwire();
```

`wire()` picks one of three strategies based on what the ports expose —
`audio → audio`, `data → audio` (via an interpolating `Parameter`), or
`data → data` (via a Vue `$watch`) — and hands back an idempotent disposer
tagged with the strategy it used. Keeping this out of the Vue component
means the component stays small and the strategies are exercised directly
in unit tests (`src/audio/__tests__/routing.test.ts`).

## How the two graphs relate

The glue is **`moduleId`**, an integer minted by the `Patch.i` counter when
a module is added. Both graphs key by it:

```
patch.modules.find(m => m.id === N)     // graph (1)
preset.parameters[N]                    // graph (1)
registry.get(N)                         // graph (2)
```

A module id is **only valid for the lifetime of one patch**. Switching
patches remounts every module, which means:

1. Old `<Unit>`s unmount → `registry.remove(id)` → audio handles eligible
   for GC.
2. `store.patch` swaps to the new patch object.
3. `await nextTick()` — DOM + registry re-populate for the new patch.
4. `patch.loaded = true` → `<Connection>` components mount → `wire()` runs,
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
                 wire() → outlet.audio.connect(inlet.audio)

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

* `src/stores/patch/index.ts` — blank `state()` + `masterout` sentinel.
* `src/synths/basic.ts` — `basicPatch()` seed shape (fallback when
  localStorage is empty).
* `src/synths/dx7.ts` — DX7 algorithm-1 FM example patch.
* `src/utils/persistence.ts` — read/validate/repair.
* `src/utils/validatePatch.ts` — Zod type guards and `fixPatch`.
* `src/audio/registry.ts` — runtime-only audio registry.
* `src/audio/routing.ts` — `wire()` / `unwire()` strategies for connections.
* `src/audio/master.ts` — MasterOut singleton (gain nodes, destination wiring).
* `src/composables/parameter.js` — UI ↔ store binding.
