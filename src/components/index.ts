import { Analyser } from './modules/Analyser';
import { Comb } from './modules/Comb';
import { Compressor } from './modules/Compressor';
import { Delay } from './modules/Delay';
import { Drive } from './modules/Drive';
import { Env } from './modules/Env';
import { LFO } from './modules/LFO';
import { Mixer } from './modules/Mixer';
import { NoteIn } from './modules/NoteIn';
import { OSC } from './modules/OSC';
import { Reverb } from './modules/Reverb';
import { Filter } from './modules/Filter';
import { VCA } from './modules/VCA';

/**
 * Registry of every rack-placeable module keyed by its type name.
 *
 * `<Unit>` spreads this into its `components` option so `<component :is="module.type">` resolves.
 * `<ContextMenu>`iterates its keys to populate the "New Module" list.
 *
 * In the `modules` export:
 *  - MasterOut is intentionally excluded (it's a singleton rendered by App.vue's sidebar — see `@/audio/master`).
 *  - Debugger is injected ad-hoc by `<Unit>` and isn't part of the user-facing module catalog.
 */
export const modules = {
  Analyser,
  Comb,
  Compressor,
  Delay,
  Drive,
  Env,
  LFO,
  Mixer,
  NoteIn,
  OSC,
  Reverb,
  Filter,
  VCA,
} as const;

export type ModuleType = keyof typeof modules;
