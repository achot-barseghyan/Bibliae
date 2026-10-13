import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { VerseNote } from '../../services/verseAnnotations';
import { tokenizeWords } from '../../services/verseAnnotations';
import VerseBlock from './VerseBlock';

const VERSE = 'Heureux l’homme qui ne marche pas dans le conseil des impies.';
const LONG_NOTE =
  'Les deux voies : à lire avec Jr 17, 5-8. L’arbre planté près des eaux ne craint pas la sécheresse, ' +
  'il garde son feuillage et ne cesse de porter du fruit.';

const note = (text: string): VerseNote => ({
  key: 'n1',
  annotationIds: ['a1'],
  ranges: [{ verse: 1, start: 0, end: 7 }],
  text,
  lastVerse: 1,
  updatedAt: '2026-10-14T10:00:00.000Z'
});

const renderVerse = (text: string, notesExpanded = false, onOpenNote = vi.fn()) =>
  render(
    <VerseBlock
      bookId="ps"
      chapter={1}
      verseNumber={1}
      verseText={VERSE}
      words={tokenizeWords(VERSE)}
      annotations={[]}
      selectedRange={null}
      notes={[note(text)]}
      onOpenNote={onOpenNote}
      notesExpanded={notesExpanded}
    />
  );

describe('note sous le verset', () => {
  it('passe du bandeau à la carte, puis au texte complet, et revient', () => {
    renderVerse(LONG_NOTE);
    expect(screen.queryByText(/Ma note/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByText(/Ma note · 14 oct\./)).toBeInTheDocument();
    expect(screen.getByText('1 min de lecture')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Lire la note/ }));
    expect(screen.getByRole('button', { name: /Réduire/ })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Réduire/ }));
    expect(screen.queryByText(/Ma note/)).not.toBeInTheDocument();
  });

  it('montre directement la carte quand les notes sont dépliées', () => {
    renderVerse(LONG_NOTE, true);
    expect(screen.getByText(/Ma note/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lire la note/ })).toBeInTheDocument();
  });

  it('ouvre la note courte avec « Lire la note », rien à déplier', () => {
    const onOpenNote = vi.fn();
    renderVerse('Les deux voies.', true, onOpenNote);
    fireEvent.click(screen.getByRole('button', { name: /Lire la note/ }));
    expect(onOpenNote).toHaveBeenCalledTimes(1);
  });
});
