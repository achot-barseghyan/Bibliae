import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { IonContent, IonPage } from '@ionic/react';
import { BOOKS, getBook, booksByTestament } from '../../data/bible';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import type { Parcours, ChapterRead, ReadingScope } from '../../hooks/useReadingProgress';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import ParcoursCreateSheet from './ParcoursCreateSheet';
import ParcoursActionsSheet from './ParcoursActionsSheet';
import './MesLectures.css';

const LONG_PRESS_MS = 450;
const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const SCOPE_LABELS: Record<ReadingScope, string> = {
  bible: 'Toute la Bible',
  ancien: 'Ancien Testament',
  nouveau: 'Nouveau Testament',
  custom: 'Sélection libre'
};

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() + diff);
  return monday;
}

function computeStreak(reads: ChapterRead[]): number {
  const readDays = new Set(reads.map((c) => dayKey(new Date(c.readAt))));
  let streak = 0;
  const cursor = new Date();
  while (readDays.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatRelative(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const days = Math.floor((dayStart(now).getTime() - dayStart(then).getTime()) / 86400000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} jours`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  return `il y a ${Math.floor(months / 12)} an${months >= 24 ? 's' : ''}`;
}

function dayStart(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function firstChapterOfScope(parcours: Parcours): { bookId: string; chapter: number } | null {
  const books =
    parcours.scope === 'bible'
      ? BOOKS
      : parcours.scope === 'custom'
        ? BOOKS.filter((b) => parcours.scopeBooks.includes(b.id))
        : booksByTestament(parcours.scope);
  const first = books[0];
  return first ? { bookId: first.id, chapter: 1 } : null;
}

const MesLectures: React.FC = () => {
  const navigate = useNavigate();
  const { parcours, activeParcours, forParcours, positionFor, progress, activate } = useReadingProgress();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionsFor, setActionsFor] = useState<Parcours | null>(null);
  const longPressTimer = useRef<number | undefined>(undefined);
  const longPressFired = useRef(false);

  const startLongPress = (p: Parcours) => {
    longPressFired.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      tapHaptic();
      setActionsFor(p);
    }, LONG_PRESS_MS);
  };
  const cancelLongPress = () => window.clearTimeout(longPressTimer.current);

  const visible = parcours.filter((p) => !p.archived);
  const ongoing = visible.filter((p) => !p.completedAt);
  const completed = visible.filter((p) => p.completedAt);

  // --- Bloc Reprendre ---
  const activeReads = activeParcours ? forParcours(activeParcours.id) : [];
  const activePosition = activeParcours ? positionFor(activeParcours.id) : undefined;
  const mostRecentRead = activeReads.length
    ? activeReads.reduce((latest, c) => (c.readAt > latest.readAt ? c : latest))
    : undefined;
  const resumeTarget = activePosition
    ? { bookId: activePosition.bookId, chapter: activePosition.chapter, at: activePosition.updatedAt }
    : mostRecentRead
      ? { bookId: mostRecentRead.bookId, chapter: mostRecentRead.chapter, at: mostRecentRead.readAt }
      : null;
  const resumeBook = resumeTarget ? getBook(resumeTarget.bookId) : undefined;

  // --- Statistiques hebdomadaires ---
  const monday = startOfWeekMonday(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const countsByDay = new Map<string, number>();
  activeReads.forEach((c) => {
    const key = dayKey(new Date(c.readAt));
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  });
  const weekCounts = weekDays.map((d) => countsByDay.get(dayKey(d)) ?? 0);
  const maxCount = Math.max(1, ...weekCounts);
  const weekTotal = weekCounts.reduce((a, b) => a + b, 0);
  const streak = computeStreak(activeReads);
  const todayKey = dayKey(new Date());

  return (
    <IonPage>
      <IonContent fullscreen className="mes-lectures-content">
        <header className="mes-lectures-header">
          <button type="button" className="mes-lectures-back" onClick={() => navigate(-1)} aria-label="Retour">
            <ChevronLeftIcon size={22} />
          </button>
          <h1 className="mes-lectures-title">Mes lectures</h1>
          <button
            type="button"
            className="mes-lectures-add"
            onClick={() => {
              tapHaptic();
              setIsCreateOpen(true);
            }}
            aria-label="Créer un parcours"
          >
            <PlusIcon size={20} />
          </button>
        </header>

        <div className="mes-lectures-body">
          {activeParcours && (
            <button
              type="button"
              className="mes-lectures-resume"
              onClick={() => {
                tapHaptic();
                const target = resumeTarget ?? firstChapterOfScope(activeParcours);
                if (target) navigate(`/bible/${target.bookId}/${target.chapter}`);
              }}
            >
              {resumeTarget && resumeBook ? (
                <>
                  <div className="mes-lectures-resume-top">
                    <span className="mes-lectures-resume-kicker">Reprendre</span>
                    <span className="mes-lectures-resume-date">{formatRelative(resumeTarget.at)}</span>
                  </div>
                  <p className="mes-lectures-resume-ref">
                    {resumeBook.name} {resumeTarget.chapter}
                  </p>
                  <p className="mes-lectures-resume-sub">
                    {activeParcours.name} · {activeReads.length} chapitre{activeReads.length > 1 ? 's' : ''} lus
                  </p>
                </>
              ) : (
                <>
                  <div className="mes-lectures-resume-top">
                    <span className="mes-lectures-resume-kicker">Commencer</span>
                  </div>
                  <p className="mes-lectures-resume-ref">{activeParcours.name}</p>
                  <p className="mes-lectures-resume-sub">{SCOPE_LABELS[activeParcours.scope]}</p>
                </>
              )}
            </button>
          )}

          <p className="mes-lectures-section-label">Parcours</p>
          <div className="mes-lectures-list">
            {ongoing.map((p) => {
              const { read, total, percent } = progress(p);
              const isActive = p.id === activeParcours?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`mes-lectures-card${isActive ? ' is-active' : ''}`}
                  onPointerDown={() => startLongPress(p)}
                  onPointerUp={cancelLongPress}
                  onPointerLeave={cancelLongPress}
                  onPointerCancel={cancelLongPress}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={() => {
                    if (longPressFired.current) {
                      longPressFired.current = false;
                      return;
                    }
                    if (!isActive) {
                      tapHaptic();
                      activate(p.id);
                    }
                  }}
                >
                  <div className="mes-lectures-card-top">
                    <span className={`mes-lectures-card-dot mes-lectures-card-dot--${p.color}`} aria-hidden="true" />
                    <span className="mes-lectures-card-name">{p.name}</span>
                    <span className="mes-lectures-card-percent">{percent}%</span>
                  </div>
                  <div className="mes-lectures-card-track">
                    <span
                      className={`mes-lectures-card-fill mes-lectures-card-fill--${p.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mes-lectures-card-info">
                    <span>
                      {SCOPE_LABELS[p.scope]} · {read} / {total} ch.
                    </span>
                    {isActive && <span className="mes-lectures-card-badge">Actif</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {completed.length > 0 && (
            <>
              <p className="mes-lectures-section-label">Achevés</p>
              <div className="mes-lectures-list">
                {completed.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="mes-lectures-card mes-lectures-card--completed"
                    onPointerDown={() => startLongPress(p)}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    onPointerCancel={cancelLongPress}
                    onContextMenu={(e) => e.preventDefault()}
                    onClick={() => {
                      if (longPressFired.current) longPressFired.current = false;
                    }}
                  >
                    <div className="mes-lectures-card-top">
                      <span className={`mes-lectures-card-dot mes-lectures-card-dot--${p.color}`} aria-hidden="true" />
                      <span className="mes-lectures-card-name">{p.name}</span>
                      <ChevronRightIcon size={14} className="mes-lectures-card-check" />
                    </div>
                    <div className="mes-lectures-card-info">
                      <span>Achevé le {p.completedAt ? formatRelative(p.completedAt) : ''}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeParcours && (
            <>
              <p className="mes-lectures-section-label">Cette semaine</p>
              <div className="mes-lectures-stats">
                <div className="mes-lectures-chart">
                  {weekDays.map((d, i) => {
                    const isToday = dayKey(d) === todayKey;
                    const heightPercent = Math.max(6, (weekCounts[i] / maxCount) * 100);
                    return (
                      <div className="mes-lectures-chart-col" key={i}>
                        <div className="mes-lectures-chart-bar-track">
                          <span
                            className={`mes-lectures-chart-bar mes-lectures-chart-bar--${activeParcours.color}${isToday ? ' is-today' : ''}`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="mes-lectures-chart-label">{WEEKDAY_LABELS[i]}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mes-lectures-stats-line">
                  {weekTotal} chapitre{weekTotal > 1 ? 's' : ''} cette semaine
                  {streak > 1 ? ` · ${streak} jours de suite` : ''}
                </p>
              </div>
            </>
          )}
        </div>

        <AnimatePresence>
          {isCreateOpen && (
            <ParcoursCreateSheet
              onClose={() => setIsCreateOpen(false)}
              onCreated={(id) => {
                setIsCreateOpen(false);
                activate(id);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {actionsFor && <ParcoursActionsSheet parcours={actionsFor} onClose={() => setActionsFor(null)} />}
        </AnimatePresence>
      </IonContent>
    </IonPage>
  );
};

export default MesLectures;
