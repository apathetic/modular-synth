import { describe, it, expect } from 'vitest';
import { dx7Patch } from '~/synths/dx7';
import { PatchSchema } from '~/types/generated';
import { isPatch } from '~/utils/validatePatch';

/*
  dx7Patch sanity checks. The patch is hand-wired — a regression here would
  typically be "I reordered an OSC inlet" or "I mistyped an operator id",
  so these tests focus on structural invariants rather than parameter
  values.
*/

describe('dx7Patch', () => {
  it('passes the canonical Patch schema (round-trips through persistence)', () => {
    const patch = dx7Patch();
    expect(() => PatchSchema.parse(patch)).not.toThrow();
    expect(isPatch(patch)).toBe(true);
  });

  it('ships exactly 6 operators (18 OSC/Env/VCA modules) plus MasterOut and NoteIn', () => {
    const { modules } = dx7Patch();
    const types = modules.map((m) => m.type);

    expect(types.filter((t) => t === 'OSC')).toHaveLength(6);
    expect(types.filter((t) => t === 'Env')).toHaveLength(6);
    expect(types.filter((t) => t === 'VCA')).toHaveLength(6);
    expect(types.filter((t) => t === 'NoteIn')).toHaveLength(1);
    expect(types.filter((t) => t === 'MasterOut')).toHaveLength(1);
    expect(modules).toHaveLength(20);
  });

  it('wires both carriers (Op1, Op3) into MasterOut L and R', () => {
    const { connections } = dx7Patch();
    const toMaster = connections.filter((c) => c.to.id === 0);

    // Op1.VCA = 13, Op3.VCA = 33 — both fanned out to ports 0 and 1 = 4 edges.
    expect(toMaster).toHaveLength(4);

    const op1Edges = toMaster.filter((c) => c.from.id === 13).map((c) => c.to.port).sort();
    const op3Edges = toMaster.filter((c) => c.from.id === 33).map((c) => c.to.port).sort();
    expect(op1Edges).toEqual([0, 1]);
    expect(op3Edges).toEqual([0, 1]);
  });

  it('implements algorithm 1 FM topology (6→5→4→3, 2→1, 6 feedback)', () => {
    const { connections } = dx7Patch();
    const MOD_PORT = 1;
    // FM edges target an OSC's mod inlet. In the id scheme, OSC ids end in 1;
    // filtering by target port alone would also match VCA.gain edges (also
    // port 1), which aren't FM.
    const isOscId = (id: number) => id % 10 === 1;
    const fmEdges = connections
      .filter((c) => c.to.port === MOD_PORT && isOscId(c.to.id))
      .map((c) => `${c.from.id}->${c.to.id}`)
      .sort();

    expect(fmEdges).toEqual(
      [
        '63->61', // Op6 feedback
        '63->51', // 6 -> 5
        '53->41', // 5 -> 4
        '43->31', // 4 -> 3
        '23->11', // 2 -> 1
      ].sort()
    );
  });

  it('gates every operator (all 6 Envs receive NoteIn velocity)', () => {
    const { connections } = dx7Patch();
    // NoteIn id 1, gate is port 1, target is Env.gate (port 0).
    const velEdges = connections.filter(
      (c) => c.from.id === 1 && c.from.port === 1 && c.to.port === 0,
    );
    const gatedEnvelopeIds = velEdges.map((c) => c.to.id).sort((a, b) => a - b);
    expect(gatedEnvelopeIds).toEqual([12, 22, 32, 42, 52, 62]);
  });

  it('provides a preset entry for every OSC and Env in the patch', () => {
    const { modules, presets } = dx7Patch();
    const params = presets[0].parameters;

    for (const m of modules) {
      if (m.type === 'OSC' || m.type === 'Env') {
        expect(params[m.id], `missing params for ${m.type} id=${m.id}`).toBeDefined();
      }
    }
  });
});
