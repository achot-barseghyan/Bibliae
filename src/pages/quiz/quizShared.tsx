import { memo } from 'react';
import { avatarOf } from './quizFormat';

const STARS = (() => {
  let seed = 11;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 26 }, () => ({
    left: `${(rnd() * 100).toFixed(1)}%`,
    top: `${(rnd() * 100).toFixed(1)}%`,
    size: rnd() > 0.7 ? 3 : 2,
    duration: `${(2.2 + rnd() * 3).toFixed(2)}s`,
    delay: `${(-rnd() * 4).toFixed(2)}s`
  }));
})();

/** Ciel étoilé décoratif des bandeaux. */
export const QuizStars = memo(function QuizStars({ height }: { height: number }) {
  return (
    <div className="qz-stars" style={{ height }} aria-hidden="true">
      {STARS.map((s, i) => (
        <span
          key={i}
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDuration: s.duration, animationDelay: s.delay }}
        />
      ))}
    </div>
  );
});

export function Medallion({ avatar, size, ring = false }: { avatar: number; size: number; ring?: boolean }) {
  const a = avatarOf(avatar);
  return (
    <img
      className={`qz-medallion${ring ? ' has-ring' : ''}`}
      src={a.src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
