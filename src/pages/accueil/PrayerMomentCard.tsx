import {
  PRAYERS_BY_MOMENT,
  decimalHour,
  formatDelay,
  mod24,
  nextPrayer,
  prayerPhase,
  todayPrayerIndex,
  type PrayerMoment
} from '../../data/dailyPrayers';
import { useDailyPrayers, useNow } from '../../hooks/useDailyPrayers';
import './PrayerMomentCard.css';

const C = 27;

/** Point du cadran de 12 h, centre (27, 27). */
function dialPoint(hour: number, r: number): [number, number] {
  const t = ((hour % 12) / 12) * 2 * Math.PI;
  return [+(C + r * Math.sin(t)).toFixed(1), +(C - r * Math.cos(t)).toFixed(1)];
}

interface Props {
  onOpen: (moment: PrayerMoment) => void;
}

/**
 * Carte « Prière du matin / du soir » : suit l'heure. Pendant une plage, elle
 * propose la prière du jour ; entre deux, elle annonce la suivante. Le petit
 * cadran porte l'heure courante et l'arc de la plage concernée.
 */
const PrayerMomentCard: React.FC<Props> = ({ onOpen }) => {
  const { settings: s } = useDailyPrayers();
  const now = useNow();
  const phase = prayerPhase(now, s);
  const next = nextPrayer(now, s);
  const moment: PrayerMoment = phase === 'jour' ? next.moment : phase;

  const today = PRAYERS_BY_MOMENT[moment][todayPrayerIndex(moment, now)];
  const title = moment === 'soir' ? 'Prière du soir' : 'Prière du matin';
  const eyebrow =
    phase === 'matin'
      ? `Au lever · ${s.morningStart} h – ${s.morningEnd} h`
      : phase === 'soir'
        ? `Au coucher · ${s.eveningStart} h – ${s.eveningEnd} h`
        : 'Prochaine prière';
  const subText =
    phase === 'jour'
      ? `${next.moment === 'soir' ? `Ce soir à ${s.eveningStart} h` : `Demain à ${s.morningStart} h`} · ${formatDelay(next.inHours)}`
      : `${today.title} · ${today.dur}`;

  const h = decimalHour(now);
  const start = moment === 'soir' ? s.eveningStart : s.morningStart;
  let span = mod24((moment === 'soir' ? s.eveningEnd : s.morningEnd) - start);
  if (span >= 12) span = 11.95;
  const [ax1, ay1] = dialPoint(start, 24);
  const [ax2, ay2] = dialPoint(start + span, 24);
  const [hx, hy] = dialPoint(h, 11);
  const [mx, my] = dialPoint(now.getMinutes() / 5, 17);

  const tone = phase === 'soir' ? 'is-night' : moment === 'soir' ? 'is-day is-before-night' : 'is-day';

  return (
    <button
      type="button"
      className={`priere-card ${tone}${phase === 'jour' ? ' is-between' : ''}`}
      data-rv="1"
      onClick={() => onOpen(moment)}
      aria-label={`${title} : ${subText}`}
    >
      <span className="priere-card-text">
        <span className="priere-card-eyebrow">{eyebrow}</span>
        <span className="priere-card-title">{title}</span>
        <span className="priere-card-sub">{subText}</span>
      </span>
      <svg className="priere-card-dial" viewBox="0 0 54 54" aria-hidden="true">
        <circle className="priere-card-dial-track" cx={C} cy={C} r="24" />
        <path
          className="priere-card-dial-arc"
          d={`M ${ax1} ${ay1} A 24 24 0 ${span > 6 ? 1 : 0} 1 ${ax2} ${ay2}`}
        />
        <line className="priere-card-dial-hand is-hour" x1={C} y1={C} x2={hx} y2={hy} />
        <line className="priere-card-dial-hand" x1={C} y1={C} x2={mx} y2={my} />
        <circle className="priere-card-dial-pin" cx={C} cy={C} r="2.2" />
      </svg>
    </button>
  );
};

export default PrayerMomentCard;
