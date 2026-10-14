import { describe, expect, it } from 'vitest';
import { mergeRecord, mergeRecordWithAdditions } from './remoteMerge';

interface Detail {
  bio?: string;
  places?: string[];
}

const local: Record<string, Detail> = { adam: { bio: 'local', places: ['Éden'] } };

describe('mergeRecord', () => {
  it('ignore les clés distantes inconnues en local', () => {
    expect(mergeRecord(local, { abel: { bio: 'distant' } })).toEqual(local);
  });
});

describe('mergeRecordWithAdditions', () => {
  it('surcharge champ par champ une fiche existante', () => {
    expect(mergeRecordWithAdditions(local, { adam: { bio: 'corrigé' } }).adam).toEqual({
      bio: 'corrigé',
      places: ['Éden']
    });
  });

  it('ajoute une fiche absente en local', () => {
    expect(mergeRecordWithAdditions(local, { abel: { bio: 'distant' } }).abel).toEqual({ bio: 'distant' });
  });

  it('écarte les entrées qui ne sont pas des objets', () => {
    const remote = { abel: 'texte', cain: null, seth: [1] } as unknown as Record<string, Detail>;
    expect(Object.keys(mergeRecordWithAdditions(local, remote))).toEqual(['adam']);
  });

  it('renvoie le local sans contenu distant', () => {
    expect(mergeRecordWithAdditions(local, null)).toBe(local);
  });
});
