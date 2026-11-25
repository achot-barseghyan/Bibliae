import { useRef, useState } from 'react';
import {
  BASE_PRAYERS,
  BASE_PRAYER_KEYS,
  blockLabel,
  newBlock,
  type PrayerBlock
} from '../../data/dailyPrayers';
import type { CustomPrayerDraft } from '../../hooks/useDailyPrayers';
import { tapHaptic } from '../../utils/haptics';
import { CloseIcon } from '../../components/nav/icons';

/** Hauteur d'une ligne du déroulé + écart : un cran de glissement. */
const ROW_STEP = 62;
const MAX_REPEAT = 50;

interface Props {
  initial: CustomPrayerDraft;
  onSave: (draft: CustomPrayerDraft) => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * Écran « Nouvelle prière / Modifier ma prière » : titre, texte libre et
 * déroulé (prières de base à répéter, réordonnables au glisser).
 */
const CustomPrayerEditor: React.FC<Props> = ({ initial, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState(initial.title);
  const [text, setText] = useState(initial.text);
  const [blocks, setBlocks] = useState<PrayerBlock[]>(() => initial.blocks.map((b) => ({ ...b })));
  const [dragId, setDragId] = useState<string | null>(null);
  const dragY = useRef(0);

  const canSave = text.trim().length > 0;
  const placeholderTitle = initial.moment === 'soir' ? 'Ma prière du soir' : 'Ma prière du matin';

  const setCount = (id: string, delta: number) =>
    setBlocks((list) =>
      list.map((b) => (b.id === id ? { ...b, n: Math.max(1, Math.min(MAX_REPEAT, b.n + delta)) } : b))
    );

  const onGrab = (e: React.PointerEvent<HTMLSpanElement>, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragY.current = e.clientY;
    setDragId(id);
    tapHaptic();
  };

  const onMove = (e: React.PointerEvent<HTMLSpanElement>, id: string) => {
    if (dragId !== id) return;
    const steps = Math.trunc((e.clientY - dragY.current) / ROW_STEP);
    if (!steps) return;
    dragY.current += steps * ROW_STEP;
    setBlocks((list) => {
      const from = list.findIndex((b) => b.id === id);
      const to = Math.max(0, Math.min(list.length - 1, from + steps));
      if (from === to) return list;
      const next = list.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const onDrop = () => setDragId(null);

  return (
    <div className="priere-editor" role="dialog" aria-modal="true" aria-label={initial.id ? 'Modifier ma prière' : 'Nouvelle prière'}>
      <div className="priere-editor-head">
        <span className="priere-eyebrow">{initial.id ? 'Modifier ma prière' : 'Nouvelle prière'}</span>
        <button type="button" className="priere-close is-soft" onClick={onClose} aria-label="Fermer sans enregistrer">
          <CloseIcon size={14} />
        </button>
      </div>

      <div className="priere-editor-body">
        <p className="priere-editor-intro">
          Écrivez avec vos mots. Votre prière s'ajoute aux onglets et reste sur cet appareil.
        </p>

        <label className="priere-editor-field">
          <span className="priere-rubric">Titre</span>
          <input
            className="priere-editor-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={placeholderTitle}
          />
        </label>

        <label className="priere-editor-field">
          <span className="priere-rubric">Votre prière</span>
          <textarea
            className="priere-editor-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Seigneur, …"
          />
        </label>

        <div className="priere-editor-field">
          <span className="priere-rubric">Déroulé · glissez pour réordonner</span>
          <div className="priere-editor-blocks">
            {blocks.map((b) => {
              const label = blockLabel(b, title);
              return (
                <div key={b.id} className={`priere-editor-block${dragId === b.id ? ' is-dragging' : ''}${b.k === 'mine' ? ' is-mine' : ''}`}>
                  <span
                    className="priere-editor-grip"
                    onPointerDown={(e) => onGrab(e, b.id)}
                    onPointerMove={(e) => onMove(e, b.id)}
                    onPointerUp={onDrop}
                    onPointerCancel={onDrop}
                    aria-hidden="true"
                  >
                    <svg width="10" height="16" viewBox="0 0 10 16">
                      <circle cx="2" cy="2" r="1.5" />
                      <circle cx="8" cy="2" r="1.5" />
                      <circle cx="2" cy="8" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="2" cy="14" r="1.5" />
                      <circle cx="8" cy="14" r="1.5" />
                    </svg>
                  </span>
                  <span className="priere-editor-block-label">{label}</span>
                  {b.k !== 'mine' && (
                    <>
                      <span className="priere-editor-count">
                        <button type="button" onClick={() => setCount(b.id, -1)} aria-label={`Une fois de moins : ${label}`}>
                          −
                        </button>
                        <span>×{b.n}</span>
                        <button type="button" onClick={() => setCount(b.id, 1)} aria-label={`Une fois de plus : ${label}`}>
                          +
                        </button>
                      </span>
                      <button
                        type="button"
                        className="priere-editor-remove"
                        onClick={() => setBlocks((list) => list.filter((x) => x.id !== b.id))}
                        aria-label={`Retirer : ${label}`}
                      >
                        <CloseIcon size={13} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="priere-editor-chips">
            {BASE_PRAYER_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                className="priere-editor-chip"
                onClick={() => setBlocks((list) => [...list, newBlock(k)])}
              >
                + {BASE_PRAYERS[k].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="priere-editor-foot">
        <button
          type="button"
          className="priere-editor-save"
          disabled={!canSave}
          onClick={() => onSave({ ...initial, title, text, blocks })}
        >
          Enregistrer
        </button>
        {initial.id && (
          <button type="button" className="priere-editor-delete" onClick={onDelete}>
            Supprimer cette prière
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomPrayerEditor;
