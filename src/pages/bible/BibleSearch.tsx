import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BOOKS, getBook, type Book } from '../../data/bible';
import { useVerseSearch } from '../../hooks/useVerseSearch';
import { useAccessibility } from '../../hooks/useAccessibility';
import { normalizeForSearch } from '../../utils/text';
import { CloseIcon, SearchIcon, ChevronRightIcon } from '../../components/nav/icons';
import './BibleSearch.css';

interface BibleSearchProps {
  onClose: () => void;
}

interface ChapterShortcut {
  book: Book;
  chapter: number;
}

// Reconnaît une requête du type "jean 3" ou "1co 13" : un nom/abréviation
// de livre suivi d'un numéro de chapitre, pour sauter directement dedans.
function findChapterShortcut(query: string): ChapterShortcut | null {
  const match = query.trim().match(/^(.+?)\s+(\d{1,3})$/);
  if (!match) return null;
  const [, bookPart, chapterPart] = match;
  const needle = normalizeForSearch(bookPart);
  const chapter = Number(chapterPart);
  if (!needle || !Number.isInteger(chapter) || chapter < 1) return null;

  const book = BOOKS.find(
    (b) => normalizeForSearch(b.name) === needle || normalizeForSearch(b.abbreviation) === needle
  );
  if (!book || chapter > book.chapters) return null;
  return { book, chapter };
}

const BibleSearch: React.FC<BibleSearchProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const [query, setQuery] = useState('');

  const transition = settings.reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const };
  const trimmed = query.trim();
  const needle = normalizeForSearch(trimmed);

  const bookMatches = useMemo(() => {
    if (!needle) return [];
    return BOOKS.filter(
      (book) =>
        normalizeForSearch(book.name).includes(needle) ||
        normalizeForSearch(book.abbreviation).includes(needle)
    );
  }, [needle]);

  const shortcut = useMemo(() => findChapterShortcut(trimmed), [trimmed]);
  const { results: verseMatches, isLoading: isSearchingVerses } = useVerseSearch(trimmed);

  const hasResults = bookMatches.length > 0 || verseMatches.length > 0 || Boolean(shortcut);

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <motion.div
      className="bible-search"
      role="dialog"
      aria-modal="true"
      aria-label="Rechercher dans la Bible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <div className="bible-search-header">
        <div className="bible-search-field">
          <SearchIcon size={17} className="bible-search-field-icon" />
          <input
            type="search"
            className="bible-search-input"
            placeholder="Un livre, une référence (Jean 3), un mot..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <button type="button" className="bible-search-close" onClick={onClose} aria-label="Fermer la recherche">
          <CloseIcon size={20} />
        </button>
      </div>

      <div className="bible-search-body">
        {!trimmed && (
          <p className="bible-search-hint">
            Cherchez un livre par son nom (« Genèse »), une référence (« Jean 3 »), ou un mot dans
            les versets déjà disponibles.
          </p>
        )}

        {trimmed && !hasResults && !isSearchingVerses && (
          <p className="bible-search-empty">Aucun résultat pour « {trimmed} ».</p>
        )}

        {shortcut && (
          <div className="bible-search-section">
            <button
              type="button"
              className="bible-search-row bible-search-row--shortcut"
              onClick={() => goTo(`/bible/${shortcut.book.id}/${shortcut.chapter}`)}
            >
              <span className="bible-search-row-body">
                <span className="bible-search-row-title">
                  Aller à {shortcut.book.name} {shortcut.chapter}
                </span>
                <span className="bible-search-row-subtitle">
                  {shortcut.book.abbreviation} {shortcut.chapter}
                </span>
              </span>
              <ChevronRightIcon size={16} className="bible-search-row-chevron" />
            </button>
          </div>
        )}

        {bookMatches.length > 0 && (
          <div className="bible-search-section">
            <p className="bible-search-section-label">Livres</p>
            {bookMatches.map((book) => (
              <button
                key={book.id}
                type="button"
                className="bible-search-row"
                onClick={() => goTo(`/bible/${book.id}`)}
              >
                <span className="bible-search-row-body">
                  <span className="bible-search-row-title">{book.name}</span>
                  <span className="bible-search-row-subtitle">
                    {book.abbreviation} · {book.chapters} chapitres
                  </span>
                </span>
                <ChevronRightIcon size={16} className="bible-search-row-chevron" />
              </button>
            ))}
          </div>
        )}

        {(verseMatches.length > 0 || isSearchingVerses) && (
          <div className="bible-search-section">
            <p className="bible-search-section-label">Versets</p>
            {isSearchingVerses && verseMatches.length === 0 && (
              <p className="bible-search-loading">Recherche en cours...</p>
            )}
            {verseMatches.map((verse) => {
              const book = getBook(verse.bookId);
              return (
                <button
                  key={`${verse.bookId}-${verse.chapter}-${verse.verse}`}
                  type="button"
                  className="bible-search-row"
                  onClick={() => goTo(`/bible/${verse.bookId}/${verse.chapter}`)}
                >
                  <span className="bible-search-row-body">
                    <span className="bible-search-row-title">{verse.text}</span>
                    <span className="bible-search-row-subtitle">
                      {book ? book.abbreviation : verse.bookId} {verse.chapter}, {verse.verse}
                    </span>
                  </span>
                  <ChevronRightIcon size={16} className="bible-search-row-chevron" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BibleSearch;
