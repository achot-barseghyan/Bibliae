import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useAccessibility } from '../../hooks/useAccessibility';
import { CATEGORIES, BOOKS, booksInCategory } from '../../data/bible';
import type { HighlightColor } from '../../services/appDataStore';
import type { ReadingScope } from '../../hooks/useReadingProgress';
import { CloseIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import '../figures/VersePreviewSheet.css';
import './ParcoursCreateSheet.css';

const EASE = [0.22, 0.8, 0.28, 1] as const;

const COLOR_OPTIONS: HighlightColor[] = ['or', 'bleu-encre', 'olive', 'sanguine', 'oxblood'];

const SCOPE_OPTIONS: { key: ReadingScope; label: string }[] = [
  { key: 'bible', label: 'Toute la Bible' },
  { key: 'ancien', label: 'Ancien Testament' },
  { key: 'nouveau', label: 'Nouveau Testament' },
  { key: 'custom', label: 'Sélection libre' }
];

const TEMPLATES: { label: string; name: string; scope: ReadingScope; scopeBooks?: string[] }[] = [
  { label: 'Toute la Bible', name: 'Première lecture', scope: 'bible' },
  { label: 'Nouveau Testament', name: 'Nouveau Testament', scope: 'nouveau' },
  { label: 'Les quatre Évangiles', name: 'Les quatre Évangiles', scope: 'custom', scopeBooks: ['mt', 'mc', 'lc', 'jn'] }
];

interface ParcoursCreateSheetProps {
  onClose: () => void;
  onCreated: (parcoursId: string) => void;
}

const ParcoursCreateSheet: React.FC<ParcoursCreateSheetProps> = ({ onClose, onCreated }) => {
  const { settings } = useAccessibility();
  const { parcours, nextColor, create } = useReadingProgress();
  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };

  const [name, setName] = useState('');
  const [color, setColor] = useState<HighlightColor>(() => nextColor());
  const [scope, setScope] = useState<ReadingScope>('bible');
  const [scopeBooks, setScopeBooks] = useState<string[]>([]);

  const usedColors = new Set(parcours.filter((p) => !p.archived).map((p) => p.color));
  const canCreate = name.trim() !== '' && (scope !== 'custom' || scopeBooks.length > 0);

  const toggleBook = (bookId: string) => {
    setScopeBooks((prev) => (prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]));
  };

  const handleCreate = () => {
    if (!canCreate) return;
    tapHaptic();
    const created = create({ name: name.trim(), color, scope, scopeBooks });
    onCreated(created.id);
  };

  return (
    <motion.div
      className="verse-sheet-backdrop"
      slot="fixed"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <motion.div
        className="verse-sheet parcours-create-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Nouveau parcours de lecture"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={transition}
      >
        <div className="verse-sheet-handle" aria-hidden="true" />

        <div className="verse-sheet-header">
          <p className="parcours-create-title">Nouveau parcours</p>
          <button type="button" className="verse-sheet-close" onClick={onClose} aria-label="Fermer">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="parcours-create-body">
          <div className="parcours-create-templates">
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                type="button"
                className="parcours-create-template"
                onClick={() => {
                  tapHaptic();
                  setName(t.name);
                  setScope(t.scope);
                  setScopeBooks(t.scopeBooks ?? []);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="parcours-create-field">
            <span className="parcours-create-field-label">Nom</span>
            <input
              type="text"
              className="parcours-create-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Deuxième lecture"
              maxLength={60}
            />
          </label>

          <div className="parcours-create-field">
            <span className="parcours-create-field-label">Couleur</span>
            <div className="parcours-create-colors">
              {COLOR_OPTIONS.map((c) => {
                const disabled = usedColors.has(c) && c !== color;
                return (
                  <button
                    key={c}
                    type="button"
                    className={`parcours-create-color parcours-create-color--${c}${color === c ? ' is-selected' : ''}`}
                    disabled={disabled}
                    onClick={() => {
                      tapHaptic();
                      setColor(c);
                    }}
                    aria-label={`Couleur ${c}`}
                    aria-pressed={color === c}
                  />
                );
              })}
            </div>
          </div>

          <div className="parcours-create-field">
            <span className="parcours-create-field-label">Étendue</span>
            <div className="parcours-create-scopes">
              {SCOPE_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`parcours-create-scope${scope === s.key ? ' is-selected' : ''}`}
                  onClick={() => {
                    tapHaptic();
                    setScope(s.key);
                  }}
                  aria-pressed={scope === s.key}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {scope === 'custom' && (
            <div className="parcours-create-books">
              {CATEGORIES.map((category) => (
                <div key={category.key} className="parcours-create-books-category">
                  <p className="parcours-create-books-heading">{category.label}</p>
                  {booksInCategory(category.key).map((book) => (
                    <label key={book.id} className="parcours-create-book-row">
                      <input
                        type="checkbox"
                        checked={scopeBooks.includes(book.id)}
                        onChange={() => toggleBook(book.id)}
                      />
                      <span>{book.name}</span>
                    </label>
                  ))}
                </div>
              ))}
              {scopeBooks.length > 0 && (
                <p className="parcours-create-books-count">
                  {scopeBooks.length} livre{scopeBooks.length > 1 ? 's' : ''} ·{' '}
                  {BOOKS.filter((b) => scopeBooks.includes(b.id)).reduce((sum, b) => sum + b.chapters, 0)} chapitres
                </p>
              )}
            </div>
          )}

          <button type="button" className="parcours-create-submit" disabled={!canCreate} onClick={handleCreate}>
            Créer le parcours
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ParcoursCreateSheet;
