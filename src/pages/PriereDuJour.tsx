import { Fragment, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import {
  BASE_PRAYERS,
  PRAYERS_BY_MOMENT,
  PRAYER_STEPS,
  capitalizedDate,
  customPrayerDuration,
  defaultBlocks,
  expandCustomPrayer,
  todayPrayerIndex,
  type CustomPrayer,
  type DailyPrayer,
  type PrayerMoment
} from '../data/dailyPrayers';
import { useDailyPrayers, useNow, type CustomPrayerDraft } from '../hooks/useDailyPrayers';
import { CloseIcon } from '../components/nav/icons';
import { tapHaptic } from '../utils/haptics';
import CustomPrayerEditor from './priere/CustomPrayerEditor';
import './PriereDuJour.css';

/** Onglet choisi : une prière proposée (par rang) ou une prière personnelle (par id). */
type Selection = { kind: 'base'; index: number } | { kind: 'custom'; id: string };

const SIGN_OF_CROSS = BASE_PRAYERS.croix.text;

/** « Voici la servante… – Qu'il me soit fait… | Je vous salue… » → texte, réponse, reprise. */
function splitResponse(paragraph: string): { main: string; response: string; tail: string } {
  const [body, tail = ''] = paragraph.split(' | ');
  const i = body.indexOf(' – ');
  return i < 0
    ? { main: body, response: '', tail }
    : { main: body.slice(0, i + 1), response: body.slice(i + 1), tail };
}

const StandardPrayer: React.FC<{ prayer: DailyPrayer }> = ({ prayer }) => (
  <>
    <p className="priere-rubric is-first">Signe de croix</p>
    <p className="priere-prose">{SIGN_OF_CROSS}</p>

    <p className="priere-rubric">{prayer.rubric}</p>
    {prayer.paragraphs?.map((paragraph, i) => {
      const { main, response, tail } = splitResponse(paragraph);
      return (
        <p key={i} className="priere-prose is-tight">
          {main}
          {response && <span className="priere-response">{response}</span>}
          {tail && ` ${tail}`}
        </p>
      );
    })}
    {prayer.stanzas?.map((lines, i) => (
      <p key={i} className="priere-stanza">
        {lines.map((line, j) => (
          <Fragment key={j}>
            {line}
            {j < lines.length - 1 && <br />}
          </Fragment>
        ))}
      </p>
    ))}

    <p className="priere-rubric">Notre Père</p>
    <p className="priere-prose">{BASE_PRAYERS.pater.text}</p>
    <p className="priere-rubric">Je vous salue Marie</p>
    <p className="priere-prose">{BASE_PRAYERS.ave.text}</p>
    <p className="priere-rubric">Signe de croix</p>
    <p className="priere-prose">{SIGN_OF_CROSS}</p>
  </>
);

const CustomPrayerBody: React.FC<{ prayer: CustomPrayer }> = ({ prayer }) => (
  <>
    {expandCustomPrayer(prayer).map((block, i) => (
      <Fragment key={block.key}>
        <p className={`priere-rubric priere-rubric--row${i === 0 ? ' is-first' : ''}`}>
          <span>{block.label}</span>
          {block.times && <span className="priere-times">{block.times}</span>}
        </p>
        {block.paragraphs.map((p, j) => (
          <p key={j} className="priere-prose">
            {p}
          </p>
        ))}
      </Fragment>
    ))}
  </>
);

const PrayerSteps: React.FC<{ moment: PrayerMoment }> = ({ moment }) => (
  <section className="priere-steps" aria-label="Les étapes de la prière">
    <p className="priere-steps-title">Les étapes de la prière</p>
    <ol className="priere-steps-list">
      {PRAYER_STEPS[moment].map((step, i) => (
        <li key={i} className="priere-step">
          <span className="priere-step-n">{i + 1}.</span>
          <div>
            <p className="priere-step-t">{step.t}</p>
            <p className="priere-step-a">
              {step.a}
              {step.em && <em className="priere-step-em">{step.em}</em>}
              {step.b}
            </p>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

const PriereDuJour: React.FC = () => {
  const { moment: param } = useParams<{ moment: string }>();
  const navigate = useNavigate();
  const now = useNow();
  const { settings, customPrayers, saveCustomPrayer, deleteCustomPrayer } = useDailyPrayers();

  const moment: PrayerMoment | null = param === 'matin' || param === 'soir' ? param : null;
  const [selection, setSelection] = useState<Selection | null>(null);
  const [draft, setDraft] = useState<CustomPrayerDraft | null>(null);

  const mine = useMemo(() => customPrayers.filter((p) => p.moment === moment), [customPrayers, moment]);

  if (!moment) return <Navigate to="/compendium/accueil" replace />;

  const proposed = PRAYERS_BY_MOMENT[moment];
  const todayIndex = todayPrayerIndex(moment, now);
  // Une prière personnelle supprimée (ou absente après un import) : retour à celle du jour.
  const current: Selection =
    selection && (selection.kind === 'base' || mine.some((p) => p.id === selection.id))
      ? selection
      : { kind: 'base', index: todayIndex };
  const custom = current.kind === 'custom' ? mine.find((p) => p.id === current.id) : undefined;
  const base = current.kind === 'base' ? proposed[current.index] : undefined;

  const title = custom ? custom.title : base!.title;
  const duration = custom ? customPrayerDuration(custom) : base!.dur;
  const heading = moment === 'soir' ? 'Prière du soir' : 'Prière du matin';

  const pick = (next: Selection) => {
    tapHaptic();
    setSelection(next);
  };

  const close = () => {
    tapHaptic();
    if (window.history.length > 1) navigate(-1);
    else navigate('/compendium/accueil', { replace: true });
  };

  const openEditor = (prayer?: CustomPrayer) => {
    tapHaptic();
    setDraft(
      prayer
        ? { id: prayer.id, moment, title: prayer.title, text: prayer.text, blocks: prayer.blocks }
        : { id: null, moment, title: '', text: '', blocks: defaultBlocks() }
    );
  };

  return (
    <IonPage className={`priere-jour is-${moment}`}>
      <header className="priere-head">
        <span className="priere-eyebrow">{heading}</span>
        <button type="button" className="priere-close" onClick={close} aria-label="Fermer">
          <CloseIcon size={14} />
        </button>
      </header>

      <div className="priere-tabs" role="tablist" aria-label="Choisir une prière">
        <button type="button" className="priere-tab is-new" onClick={() => openEditor()}>
          + Ma prière
        </button>
        {proposed.map((p, i) => {
          const active = current.kind === 'base' && current.index === i;
          return (
            <button
              key={p.label}
              type="button"
              role="tab"
              aria-selected={active}
              className={`priere-tab${active ? ' is-active' : ''}`}
              onClick={() => pick({ kind: 'base', index: i })}
            >
              {p.label}
            </button>
          );
        })}
        {mine.map((p) => {
          const active = current.kind === 'custom' && current.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`priere-tab${active ? ' is-active' : ''}`}
              onClick={() => pick({ kind: 'custom', id: p.id })}
            >
              {p.title}
            </button>
          );
        })}
      </div>

      <IonContent className="priere-content">
        <article className="priere-body">
          <p className="priere-meta">
            {capitalizedDate(now)} · {duration}
          </p>
          <h1 className="priere-title">{title}</h1>
          {custom && (
            <button type="button" className="priere-edit" onClick={() => openEditor(custom)}>
              Modifier ma prière
            </button>
          )}

          {settings.showSteps && <PrayerSteps moment={moment} />}

          {custom ? <CustomPrayerBody prayer={custom} /> : <StandardPrayer prayer={base!} />}

          <p className="priere-fleuron" aria-hidden="true">
            ✦
          </p>
        </article>
      </IonContent>

      {draft && (
        <CustomPrayerEditor
          initial={draft}
          onClose={() => setDraft(null)}
          onSave={(next) => {
            tapHaptic();
            const id = saveCustomPrayer(next);
            setSelection({ kind: 'custom', id });
            setDraft(null);
          }}
          onDelete={() => {
            if (!draft.id) return;
            tapHaptic();
            deleteCustomPrayer(draft.id);
            setSelection(null);
            setDraft(null);
          }}
        />
      )}
    </IonPage>
  );
};

export default PriereDuJour;
