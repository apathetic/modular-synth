/**
 * Barrel for the "composed" Reaktor-style oscillators. These modules compose
 * the core primitives from the parent directory into richer, rack-placeable
 * SynthModules with UI shells under `src/components/modules/`.
 *
 * Phase B so far: Bento Box, Boutique. Monark, Modern, Kodiak, WestCoast
 * land in subsequent passes.
 */

export { Bento, type BentoOptions } from './bento';
export { Boutique, type BoutiqueOptions } from './boutique';
