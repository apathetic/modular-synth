/**
 * Bundled wavetables used by the `Wavetable` oscillator. Each table is an
 * ordered list of harmonic-coefficient pairs; each pair becomes one
 * `PeriodicWave` slot. The `Wavetable.index` parameter scans 0..1 across the
 * whole table, linearly crossfading between adjacent slots.
 *
 * Coefficients follow the WebAudio `PeriodicWave` convention:
 *   real[n] = cosine coefficient for harmonic n
 *   imag[n] = sine   coefficient for harmonic n
 *   index 0 is the DC component (should stay 0 for audio).
 *
 * Tables can be added freely; keep slot counts small (≤16) and harmonic
 * counts modest (≤32) to avoid per-voice allocation cost.
 */

export type WaveSlot = {
  real: Float32Array;
  imag: Float32Array;
};

export type Wavetable = ReadonlyArray<WaveSlot>;

const HARMONICS = 32;

function zeros(): Float32Array { return new Float32Array(HARMONICS + 1); }

/** Pure sine: only the fundamental on the sine axis. */
function sineSlot(): WaveSlot {
  const real = zeros();
  const imag = zeros();
  imag[1] = 1;
  return { real, imag };
}

/** Triangle: 1/n² on odd harmonics with alternating sign (sine axis). */
function triangleSlot(): WaveSlot {
  const real = zeros();
  const imag = zeros();
  for (let n = 1; n <= HARMONICS; n += 2) {
    const sign = ((n - 1) / 2) % 2 === 0 ? 1 : -1;
    imag[n] = sign * (1 / (n * n));
  }
  return { real, imag };
}

/** Square: 1/n on odd harmonics (sine axis). */
function squareSlot(): WaveSlot {
  const real = zeros();
  const imag = zeros();
  for (let n = 1; n <= HARMONICS; n += 2) imag[n] = 1 / n;
  return { real, imag };
}

/** Sawtooth: 1/n on all harmonics (sine axis). */
function sawSlot(): WaveSlot {
  const real = zeros();
  const imag = zeros();
  for (let n = 1; n <= HARMONICS; n++) imag[n] = 1 / n;
  return { real, imag };
}

/**
 * Classic 4-slot analogue-style sweep: sine -> triangle -> square -> saw.
 * Index 0..1 glides through the timbre spectrum from purest to harshest.
 */
export const analogueSweep: Wavetable = [
  sineSlot(),
  triangleSlot(),
  squareSlot(),
  sawSlot(),
];

/**
 * Odd-harmonic bloom: starts at sine, progressively adds odd harmonics with
 * equal amplitude. Good for hollow, woody timbres.
 */
export const oddBloom: Wavetable = (() => {
  const slots: WaveSlot[] = [];
  for (let k = 1; k <= 5; k++) {
    const real = zeros();
    const imag = zeros();
    // slot k contains odd harmonics 1, 3, 5, ..., (2k-1) all at amplitude 1
    for (let i = 0; i < k; i++) {
      const n = 2 * i + 1;
      if (n <= HARMONICS) imag[n] = 1;
    }
    slots.push({ real, imag });
  }
  return slots;
})();

/** Registry of built-in tables keyed by name. */
export const builtInTables: Record<string, Wavetable> = {
  analogueSweep,
  oddBloom,
};

export type BuiltInTableName = keyof typeof builtInTables;
