import { useMemo } from 'react';

interface NightStarsProps {
  count?: number;
  /** Graine du tirage : chaque bandeau garde son propre ciel, stable d'un rendu à l'autre. */
  seed?: number;
  /** Hauteur maximale (en %) où tombent les étoiles. */
  maxTop?: number;
}

/** Étoiles scintillantes des bandeaux de nuit (Bible, plan de lecture). */
const NightStars: React.FC<NightStarsProps> = ({ count = 28, seed = 7, maxTop = 70 }) => {
  const stars = useMemo(() => {
    let s = seed;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    return Array.from({ length: count }, () => ({
      left: `${(rnd() * 100).toFixed(1)}%`,
      top: `${(rnd() * maxTop).toFixed(1)}%`,
      animation: `bible-twinkle ${(2 + rnd() * 3).toFixed(2)}s ease-in-out ${(-rnd() * 4).toFixed(2)}s infinite`
    }));
  }, [count, seed, maxTop]);

  return (
    <div className="night-stars" aria-hidden="true">
      {stars.map((style, i) => (
        <span key={i} className="night-star" style={style} />
      ))}
    </div>
  );
};

export default NightStars;
