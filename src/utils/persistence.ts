import { basicPatch } from '@/synths/basic';
import { dx7Patch } from '@/synths/dx7';
import { isPatch, fixPatch } from '@/utils/validatePatch';

export const STORAGE_KEY = 'synth.patches';
export const STORAGE_VERSION = 1;

const LEGACY_KEY = 'patches';

/**
 * Patches seeded into the workspace on first boot (or any time localStorage
 * is empty/unreadable). DX7 is first so it auto-loads at `patchId: 0`; Basic
 * stays in the list as a simple fallback the user can switch to.
 */
export const defaultPatches = (): Patch[] => [dx7Patch(), basicPatch()];

type StoredEnvelope = {
  version: number;
  patches: unknown[];
};

const isEnvelope = (value: unknown): value is StoredEnvelope => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    'patches' in value &&
    Array.isArray((value as StoredEnvelope).patches)
  );
};

const readRaw = (): string | null => {
  try {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_KEY) ||
      null
    );
  } catch (err) {
    console.warn('[persistence] localStorage read failed:', err);
    return null;
  }
};

const sanitizePatch = (raw: unknown): Patch => {
  if (isPatch(raw)) {
    return { ...raw, loaded: false };
  }

  try {
    const fixed = fixPatch(raw as Partial<Patch>);
    return { ...fixed, loaded: false };
  } catch (err) {
    console.warn('[persistence] unrecoverable patch, substituting basic:', err);
    return basicPatch();
  }
};

/**
 * Safe-read patches from localStorage. Always returns a non-empty array.
 * On any failure (missing key, malformed JSON, schema drift) falls back
 * to a single `basicPatch()`.
 */
export function loadPatches(): Patch[] {
  const raw = readRaw();
  if (!raw) return defaultPatches();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn('[persistence] JSON.parse failed, starting fresh:', err);
    return defaultPatches();
  }

  const rawPatches: unknown[] = isEnvelope(parsed)
    ? parsed.patches
    : Array.isArray(parsed)
      ? parsed
      : [];

  if (rawPatches.length === 0) return defaultPatches();

  const patches = rawPatches.map(sanitizePatch);
  return patches.length > 0 ? patches : defaultPatches();
}

/**
 * Produce the JSON string written to localStorage. Wraps in a versioned
 * envelope and strips the transient `loaded` flag via the stringify replacer.
 *
 * NOTE: intentionally avoids `structuredClone` here. `persistState` hands us
 * a Pinia reactive proxy, and `structuredClone` walks it via property
 * descriptors — which bypasses Vue's ref auto-unwrap and chokes on any non-
 * cloneable host object (AudioNode, DOM element, function) that may have
 * leaked into patch state. `JSON.stringify` goes through each property's
 * getter instead, so refs are unwrapped and non-serializable values are
 * silently dropped.
 */
export function serializePatches(patches: Patch[]): string {
  const envelope: StoredEnvelope = {
    version: STORAGE_VERSION,
    patches,
  };

  return JSON.stringify(envelope, (key, value) => {
    if (key === 'loaded') return undefined;
    return value;
  });
}

/**
 * Remove the persisted patches blob (and the legacy key, if present).
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch (err) {
    console.warn('[persistence] localStorage clear failed:', err);
  }
}
