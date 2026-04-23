import { state } from '@/stores/patch';

/**
 * Yamaha DX7 "Algorithm 1" patch — six FM operators arranged in two parallel
 * stacks, both carriers summed to output.
 *
 *     Stack A (4-deep)          Stack B (2-deep)
 *
 *          [Op6] ⤾ feedback          [Op2]
 *            ↓                         ↓
 *          [Op5]                     [Op1]   ← carrier
 *            ↓                         ↓
 *          [Op4]                       │
 *            ↓                         │
 *          [Op3]   ← carrier           │
 *            ↓                         ↓
 *            └─────────┬───────────────┘
 *                      ↓
 *                   MasterOut
 *
 * Each "operator" is the `(OSC + Env + VCA)` triple this synth has: the
 * oscillator produces the tone, the envelope shapes amplitude, and the VCA
 * multiplies them. FM between operators is a modulator operator's VCA
 * output wired into the next operator's `OSC.mod` inlet (the oscillator's
 * audio-rate frequency modulation port).
 *
 * ID scheme: the ones-digit of an ID is the role (1 = OSC, 2 = Env, 3 = VCA)
 * and the tens-digit is the operator number — so `Op4.Env` is id 42,
 * `Op6.VCA` is 63. NoteIn is 1, MasterOut is 0 (sentinel).
 *
 * Caveats
 * -------
 * - `OSC.freq` is driven directly by NoteIn's note data, which sets an
 *   absolute pitch per operator. The DX7 instead sets each operator's
 *   frequency as a *ratio* of the fundamental; the synth doesn't expose a
 *   ratio inlet yet, so all operators currently play at the same pitch and
 *   character is set through `detune` and envelope shape.
 * - `Op6.VCA -> Op6.OSC.mod` is a WebAudio cycle. That's legal — WebAudio
 *   inserts a one-block delay in cycles, which is exactly what FM feedback
 *   wants.
 */
export const dx7Patch = (): Patch => {
  const OPS = [1, 2, 3, 4, 5, 6] as const;
  const osc = (op: number) => op * 10 + 1;
  const env = (op: number) => op * 10 + 2;
  const vca = (op: number) => op * 10 + 3;

  const NOTE_IN = 1;
  const MASTER = 0;

  // Operator modules, laid out one operator per row. Visual order top→bottom:
  // NoteIn, Op6..Op4 (stack A modulators, deepest first), Op3 (carrier A),
  // Op2 (stack B modulator), Op1 (carrier B).
  const rowOf: Record<number, number> = { 6: 1, 5: 2, 4: 3, 3: 4, 2: 5, 1: 6 };
  const modules: (Module | MasterOut)[] = [
    { id: MASTER,  type: 'MasterOut', x: 1100, y: 50 },
    { id: NOTE_IN, type: 'NoteIn',    x: 60, y: 30, col: 0, row: 0, w: 2, h: 1 },
    ...OPS.flatMap((op): Module[] => {
      const row = rowOf[op];
      const y = 100 + row * 160;
      return [
        { id: osc(op), type: 'OSC', x: 60,  y, col: 0, row, w: 4, h: 1 },
        { id: env(op), type: 'Env', x: 420, y, col: 5, row, w: 3, h: 1 },
        { id: vca(op), type: 'VCA', x: 720, y, col: 9, row, w: 2, h: 1 },
      ];
    }),
  ];

  // Shared wiring every operator needs:
  //   NoteIn.note -> OSC.freq (data)   NoteIn.vel -> Env.vel (data)
  //   OSC.out     -> VCA.signal        Env.out    -> VCA.gain
  let cid = 0;
  const next = () => ++cid;
  const operatorInternals: Connection[] = OPS.flatMap((op) => [
    { id: next(), from: { id: NOTE_IN, port: 0 }, to: { id: osc(op), port: 0 } }, // pitch
    { id: next(), from: { id: NOTE_IN, port: 1 }, to: { id: env(op), port: 0 } }, // gate
    { id: next(), from: { id: osc(op), port: 0 }, to: { id: vca(op), port: 0 } },
    { id: next(), from: { id: env(op), port: 0 }, to: { id: vca(op), port: 1 } },
  ]);

  // Algorithm 1: FM wiring.
  // OSC.mod is inlet port 1; see OSC.vue inlets[] ordering.
  const MOD_PORT = 1;
  const fm: Connection[] = [
    // Stack A: 6 -> 5 -> 4 -> 3, with 6 feeding back into itself.
    { id: next(), from: { id: vca(6), port: 0 }, to: { id: osc(6), port: MOD_PORT } }, // feedback
    { id: next(), from: { id: vca(6), port: 0 }, to: { id: osc(5), port: MOD_PORT } },
    { id: next(), from: { id: vca(5), port: 0 }, to: { id: osc(4), port: MOD_PORT } },
    { id: next(), from: { id: vca(4), port: 0 }, to: { id: osc(3), port: MOD_PORT } },
    // Stack B: 2 -> 1.
    { id: next(), from: { id: vca(2), port: 0 }, to: { id: osc(1), port: MOD_PORT } },
  ];

  // Both carriers (Op1, Op3) -> stereo master.
  const toMaster: Connection[] = [
    { id: next(), from: { id: vca(1), port: 0 }, to: { id: MASTER, port: 0 } },
    { id: next(), from: { id: vca(1), port: 0 }, to: { id: MASTER, port: 1 } },
    { id: next(), from: { id: vca(3), port: 0 }, to: { id: MASTER, port: 0 } },
    { id: next(), from: { id: vca(3), port: 0 }, to: { id: MASTER, port: 1 } },
  ];

  // Preset defaults:
  //   - Carriers (Op1, Op3): longer amplitude envelopes — they're the ones
  //     you hear directly.
  //   - Modulators (Op2, Op4, Op5, Op6): percussive envelopes (fast decay
  //     to near-zero sustain) — characteristic "bell / e-piano" FM timbre.
  //   - OSC.mod knobs scale incoming modulation depth at each receiving
  //     operator; stack tops (Op2, Op6) get 0 since they have no FM in
  //     (Op6's feedback still routes through its own mod inlet).
  //   - `detune` varies per operator as a rough ratio proxy until the synth
  //     supports proper frequency-ratio inlets.
  const oscParams = (mod: number, detune: number) => ({ mod, freq: 440, PW: 0, detune });
  const envParams = (attack: number, decay: number, sustain: number, release: number) =>
    ({ attack, decay, sustain, release });

  return <Patch>{
    ...state(),
    i: 100,
    name: 'DX7',
    modules,
    connections: [...operatorInternals, ...fm, ...toMaster],
    presets: [{
      name: 'Algo-1',
      parameters: {
        [osc(1)]: oscParams(60,   0), [env(1)]: envParams(0.02, 0.50, 0.60, 0.80),
        [osc(2)]: oscParams( 0,   0), [env(2)]: envParams(0.01, 0.20, 0.05, 0.30),
        [osc(3)]: oscParams(60,   0), [env(3)]: envParams(0.02, 0.30, 0.50, 0.60),
        [osc(4)]: oscParams(40, 100), [env(4)]: envParams(0.01, 0.30, 0.10, 0.40),
        [osc(5)]: oscParams(40, 200), [env(5)]: envParams(0.01, 0.15, 0.02, 0.20),
        [osc(6)]: oscParams(30, 300), [env(6)]: envParams(0.01, 0.10, 0.01, 0.15),
      },
    }],
  };
};
