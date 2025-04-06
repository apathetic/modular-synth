# ID Sharing in RackUnit

## Overview

The RackUnit structure uses a shared ID system to ensure consistent identification between the Module (UI) and SynthNode (audio) components. This document explains how the ID referencing system works and how to properly use it.

## ID Referencing Architecture

### Structure

The RackUnit is structured as follows:

```typescript
export type RackUnit = {
  id: number;      // Shared ID
  module: Module;  // UI/visual representation
  node: SynthNode; // Audio processing functionality
};
```

- The `id` at the RackUnit level is a duplicate of `module.id`
- This same `id` is used as the key in the registry that stores the SynthNode instances

### ID Flow

1. **ID Creation**:
   - New module IDs are generated during patch creation or when modules are added
   - The ID is assigned to the Module object: `module.id`

2. **Registration**:
   - When a Module component mounts, it registers its audio node using the same ID:
   ```typescript
   store.addToRegistry({ id, node: node.value as SynthNode });
   ```
   - The ID becomes the key in the registry: `registry[id] = node`

3. **Retrieval**:
   - The `getRackUnit(id)` getter fetches both module and node by the same ID
   - It returns a unified object with both, plus the ID at the top level

## Usage Guidelines

### Retrieving RackUnits

Always use the `getRackUnit` getter to retrieve complete rack units:

```typescript
const rackUnit = store.getRackUnit(id);
if (rackUnit) {
  // Access properties via rackUnit.module and rackUnit.node
  // Or directly reference the ID via rackUnit.id
}
```

### Creating Connections

When creating connections between modules:

1. Get both endpoints using their IDs:
   ```typescript
   const source = store.getRackUnit(fromId);
   const destination = store.getRackUnit(toId);
   ```

2. Reference properties appropriately:
   ```typescript
   // For UI positioning
   source.module.x, source.module.y

   // For audio connections
   source.node.outlets[port], destination.node.inlets[port]
   ```

3. For logging/debugging, use the consistent ID:
   ```typescript
   console.log(`Connection: ${source.id} → ${destination.id}`);
   ```

## Benefits

1. **Consistency**: Same ID used throughout the application
2. **Type Safety**: Clear typing for modules vs nodes
3. **Traceability**: Easy debugging with consistent identifiers
4. **Separation of Concerns**: UI and audio logic remain separate
5. **Data Integrity**: Ensures modules and nodes stay in sync

## Considerations

- When removing modules, ensure both the module and node are removed using the same ID
- When serializing patches, only the modules need to be saved (nodes are recreated on load)
- The ID is always a number, making array indexing and lookup efficient