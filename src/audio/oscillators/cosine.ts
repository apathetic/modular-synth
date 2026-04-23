import { Sine, type SineOptions } from './sine';

/**
 * Pure cosine oscillator — a `Sine` with `phase = π/2` preset. Exists as its
 * own class so the composed oscillators can `import { Cosine }` without
 * leaking the "sine with phase" detail.
 */
export class Cosine extends Sine {
  constructor(options: Omit<SineOptions, 'phase'> = {}) {
    super({ ...options, phase: Math.PI / 2 });
  }
}
