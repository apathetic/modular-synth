import { basicPatch } from '@/stores/patch';
import { isPatch, fixPatch } from '@/utils/validatePatch';

export const STORAGE_KEY = 'synth.patches';
export const STORAGE_VERSION = 1;

const LEGACY_KEY = 'patches';

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
  if (!raw) return [basicPatch()];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn('[persistence] JSON.parse failed, starting fresh:', err);
    return [basicPatch()];
  }

  const rawPatches: unknown[] = isEnvelope(parsed)
    ? parsed.patches
    : Array.isArray(parsed)
      ? parsed
      : [];

  if (rawPatches.length === 0) return [basicPatch()];

  const patches = rawPatches.map(sanitizePatch);
  return patches.length > 0 ? patches : [basicPatch()];
}

/**
 * Produce the JSON string written to localStorage. Deep-clones each patch,
 * strips the transient `loaded` flag, and wraps in a versioned envelope.
 */
export function serializePatches(patches: Patch[]): string {
  const cleaned = patches.map((patch) => {
    const { loaded: _loaded, ...rest } = structuredClone(patch);
    return rest;
  });

  const envelope: StoredEnvelope = {
    version: STORAGE_VERSION,
    patches: cleaned,
  };

  return JSON.stringify(envelope);
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
