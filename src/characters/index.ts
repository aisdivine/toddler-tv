// Character archetypes — reusable creatures drawn from math primitives. Add a
// new one by creating ./<name>.ts exporting a CharacterArchetype, then list it
// here. Reference anywhere via ARCHETYPES.<id> or getArchetype('<id>').

import { owl } from './owl';
import { cat } from './cat';
import { dog } from './dog';
import { bunny } from './bunny';
import type { CharacterArchetype } from './types';

export const ARCHETYPES = { owl, cat, dog, bunny } as const;
export type ArchetypeId = keyof typeof ARCHETYPES;

/** All archetypes in display order. */
export const ARCHETYPE_LIST: CharacterArchetype[] = [owl, cat, dog, bunny];

export function getArchetype(id: string): CharacterArchetype {
  const a = (ARCHETYPES as Record<string, CharacterArchetype>)[id];
  if (!a) throw new Error(`Unknown character archetype: ${id}`);
  return a;
}

export type { CharacterArchetype, CharacterPose } from './types';
export { talkEnvelope, blinkEnvelope, idlePose } from './expression';
