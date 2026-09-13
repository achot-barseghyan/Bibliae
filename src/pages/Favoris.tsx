import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { useBookmarks } from '../hooks/useBookmarks';
import {
  resolveBookmark,
  BOOKMARK_TYPE_LABELS,
  BOOKMARK_TYPE_ORDER,
  type BookmarkType,
  type ResolvedBookmark
} from '../services/bookmarkResolver';
import { CrossIcon, BookmarkIcon } from '../components/nav/icons';
import WorldSheet from '../components/nav/WorldSheet';
import { tapHaptic } from '../utils/haptics';
import './Favoris.css';

const Favoris: React.FC = () => {
  const navigate = useNavigate();
  const { bookmarks, toggle } = useBookmarks();
  const [isWorldSheetOpen, setIsWorldSheetOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BookmarkType | 'all'>('all');

  const allGroups = useMemo(() => {
    const resolved = bookmarks.map(resolveBookmark);
    const byType = new Map<BookmarkType, ResolvedBookmark[]>();
    for (const item of resolved) {
      const list = byType.get(item.type) ?? [];
      list.push(item);
      byType.set(item.type, list);
    }
    return BOOKMARK_TYPE_ORDER.map((type) => ({ type, items: byType.get(type) ?? [] })).filter(
      (group) => group.items.length > 0
    );
  }, [bookmarks]);

  // Si la catégorie filtrée n'a plus aucun favori (dernier retiré), on revient
  // sur "Tous" plutôt que d'afficher un filtre actif qui ne montre plus rien.
  useEffect(() => {
    if (activeFilter !== 'all' && !allGroups.some((group) => group.type === activeFilter)) {
      setActiveFilter('all');
    }
  }, [activeFilter, allGroups]);

  const groups = activeFilter === 'all' ? allGroups : allGroups.filter((g) => g.type === activeFilter);

  const handleOpen = (item: ResolvedBookmark) => {
    if (!item.path) return;
    tapHaptic();
    navigate(item.path);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="favoris-content">
        <header className="favoris-header">
          <h1 className="favoris-title">Favoris</h1>
          <button
            type="button"
            className="favoris-world-button"
            onClick={() => {
              tapHaptic();
              setIsWorldSheetOpen(true);
            }}
            aria-label="Changer de monde"
          >
            <CrossIcon size={18} />
          </button>
        </header>

        {allGroups.length > 0 && (
          <div className="favoris-filters">
            <button
              type="button"
              className={`favoris-filter-chip${activeFilter === 'all' ? ' is-active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Tous
            </button>
            {allGroups.map((group) => (
              <button
                key={group.type}
                type="button"
                className={`favoris-filter-chip${activeFilter === group.type ? ' is-active' : ''}`}
                onClick={() => setActiveFilter(group.type)}
              >
                {BOOKMARK_TYPE_LABELS[group.type]} ({group.items.length})
              </button>
            ))}
          </div>
        )}

        {groups.length === 0 ? (
          <p className="favoris-empty">
            {allGroups.length === 0
              ? "Aucun favori pour l'instant. Ajoutez des versets, prières, figures ou saints en favoris pour les retrouver ici."
              : 'Aucun favori dans cette catégorie.'}
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.type} className="favoris-group">
              <p className="favoris-group-label">{BOOKMARK_TYPE_LABELS[group.type]}</p>
              <div className="favoris-rows">
                {group.items.map((item) => (
                  <div key={item.key} className="favoris-row" onClick={() => handleOpen(item)}>
                    <div className="favoris-row-text">
                      <p className="favoris-row-title">{item.title}</p>
                      {item.subtitle && <p className="favoris-row-subtitle">{item.subtitle}</p>}
                    </div>
                    <button
                      type="button"
                      className="favoris-row-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(item.key);
                      }}
                      aria-label="Retirer des favoris"
                    >
                      <BookmarkIcon size={18} filled />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}

        <WorldSheet isOpen={isWorldSheetOpen} onClose={() => setIsWorldSheetOpen(false)} />
      </IonContent>
    </IonPage>
  );
};

export default Favoris;
