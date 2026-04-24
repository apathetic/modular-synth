import { context, parameter } from '..';
import type { Parameter } from '..';
import type { Inlet, Outlet, SynthModule } from '~/types/audio';

/**
 * All filter shapes the underlying BiquadFilterNode supports that we care
 * about. Exposed so the UI layer can build its dropdown from the same
 * source of truth rather than re-declaring the list.
 */
export const FILTER_TYPES = ['allpass', 'bandpass', 'highpass', 'lowpass', 'peaking'] as const;
export type FilterType = typeof FILTER_TYPES[number];

export type FilterConfig = {
  type?: FilterType;
  /** Cutoff / center frequency in Hz. */
  frequency?: number;
  /** Q (resonance). */
  Q?: number;
  /** Mod-input depth in cents. Default preserves the legacy `parameter(500)` behavior. */
  modDepth?: number;
};

/**
 * Biquad filter wrapped as a SynthModule.
 *
 * Inlets
 * ------
 *
 *   - `input` (audio) — the signal to filter.
 *   - `pitch` (data)  — sets the cutoff directly in Hz. Named `pitch`
 *                       instead of `freq` so NoteIn's pitch outlet (and
 *                       any other Hz-bearing data source) wires up with
 *                       the same vocabulary.
 *   - `mod`   (audio) — summed into a `Parameter` whose output feeds
 *                       `detune` in cents. `modDepth` is the Parameter's
 *                       initial gain, i.e. the modulation range.
 *
 * The mod path and 1:1 pitch-to-Hz mapping are carried over from the
 * pre-refactor Filter.vue so existing patches keep behaving the same —
 * this refactor is a pure relocation, not a semantic change.
 */
export class Filter implements SynthModule {
  readonly inlets:  Inlet[];
  readonly outlets: Outlet[];

  private node: BiquadFilterNode;
  private mod:  Parameter;

  constructor(config: FilterConfig = {}) {
    const type  = config.type      ?? 'lowpass';
    const freq  = config.frequency ?? 440;
    const q     = config.Q         ?? 1;
    const depth = config.modDepth  ?? 500;

    this.node = context.createBiquadFilter();
    this.node.type           = type;
    this.node.frequency.value = freq;
    this.node.Q.value        = q;

    this.mod = parameter(depth);
    this.mod.output.connect(this.node.detune);

    this.inlets = [
      {
        label: 'input',
        desc:  'signal to filter',
        audio: this.node,
      },
      {
        label: 'pitch',
        desc:  'sets cutoff frequency in Hz',
        data:  (v) => this.setFrequency(Number(v)),
      },
      {
        label: 'mod',
        desc:  'detune modulation (cents)',
        audio: this.mod.input,
      },
    ];

    this.outlets = [
      {
        label: 'output',
        desc:  'filtered audio',
        audio: this.node,
      },
    ];
  }

  get type(): FilterType { return this.node.type as FilterType; }
  set type(v: FilterType) { this.node.type = v; }

  get frequency(): number { return this.node.frequency.value; }
  set frequency(v: number) { this.setFrequency(v); }

  get Q(): number { return this.node.Q.value; }
  set Q(v: number) { this.node.Q.value = v; }

  /**
   * Guarded cutoff setter shared by the `pitch` inlet callback and the
   * public `frequency` setter. Non-finite / non-positive values are
   * dropped so stray wires can't push the AudioParam into its error
   * regime.
   */
  setFrequency(v: number): void {
    if (Number.isFinite(v) && v > 0) this.node.frequency.value = v;
  }

  /**
   * Thin passthrough to `BiquadFilterNode.getFrequencyResponse`, exposed
   * so the UI shell can sketch the response curve without reaching into
   * the underlying node.
   */
  getFrequencyResponse(
    frequencies: Float32Array,
    magResponse: Float32Array,
    phaseResponse: Float32Array,
  ): void {
    this.node.getFrequencyResponse(frequencies, magResponse, phaseResponse);
  }

  destroy(): void {
    this.mod.destroy();
    this.node.disconnect();
  }
}
