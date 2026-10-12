import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  eventImageUrl,
  type Chorus,
  type EventCharacter,
  type EventDetail,
  type EventLayer,
  type EventRoute,
  type EventScene,
  type Tableau,
  type VerseRef
} from '../../data/events';
import { getBook } from '../../data/bible';
import { useElementWidth } from '../../hooks/useElementWidth';
import { tapHaptic } from '../../utils/haptics';
import { contentTop, useParallax, useReveal, useScrollEngine } from './scrollEngine';

// Sections de la fiche événement, dans l'ordre de la page.

/** Générateur pseudo-aléatoire déterministe : étoiles placées au hasard,
 * mais toujours aux mêmes endroits. */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export const Stars: React.FC<{ seed: string; count: number; maxTop: number; className?: string }> = ({
  seed,
  count,
  maxTop,
  className
}) => {
  const stars = useMemo(() => {
    const random = seededRandom(seed);
    return Array.from({ length: count }, () => ({
      left: 3 + random() * 94,
      top: 2 + random() * (maxTop - 2),
      size: 1 + random() * 1.8,
      duration: 2.2 + random() * 3.6,
      delay: random() * 4
    }));
  }, [seed, count, maxTop]);
  return (
    <div className={`evd-stars${className ? ` ${className}` : ''}`} aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="evd-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`
          }}
        />
      ))}
    </div>
  );
};

/** Illustration protégée : ni glisser, ni appui long (licence de l'artiste). */
export const Art: React.FC<{ asset: string; alt: string; className?: string; style?: React.CSSProperties }> = ({
  asset,
  alt,
  className,
  style
}) => {
  const src = eventImageUrl(asset);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={`evd-art${className ? ` ${className}` : ''}`}
      style={style}
      draggable={false}
      decoding="async"
      loading="lazy"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

function formatRef(ref: VerseRef): string {
  const abbr = getBook(ref.bookId)?.abbreviation ?? ref.bookId;
  const verses = ref.verseStart === ref.verseEnd ? `${ref.verseStart}` : `${ref.verseStart}-${ref.verseEnd}`;
  return `${abbr} ${ref.chapter}, ${verses}`;
}

/** Pastille de référence : ouvre le lecteur sur le passage, versets surlignés. */
export const RefPill: React.FC<{ refValue: VerseRef; tone?: 'light' | 'dark' }> = ({ refValue, tone = 'light' }) => {
  const navigate = useNavigate();
  const { bookId, chapter, verseStart, verseEnd } = refValue;
  return (
    <button
      type="button"
      className={`evd-ref-pill${tone === 'dark' ? ' is-dark' : ''}`}
      onClick={() => {
        tapHaptic();
        navigate(`/bible/${bookId}/${chapter}?v=${verseStart}-${verseEnd}`);
      }}
    >
      {formatRef(refValue)}
    </button>
  );
};

const Quote: React.FC<{ text: string }> = ({ text }) => (
  <blockquote className="evd-quote">
    <span className="evd-quote-mark" aria-hidden="true">
      «
    </span>
    {text}
    <span className="evd-quote-mark" aria-hidden="true">
      »
    </span>
  </blockquote>
);

/** Titre de section : « Le récit », sous-titre en italique. */
const SectionTitle: React.FC<{ title: string; subtitle: string; dark?: boolean }> = ({ title, subtitle, dark }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`evd-section-title evd-rise${dark ? ' is-dark' : ''}`}>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
};

/** Filet or avec une étoile au centre, qui se dessine. */
const Rule: React.FC = () => {
  const ref = useReveal<HTMLDivElement>(0.86);
  return (
    <div ref={ref} className="evd-rule" aria-hidden="true">
      <svg viewBox="0 0 220 20" width="220" height="20">
        <path className="evd-draw" pathLength={1} d="M100 10H6" />
        <path className="evd-draw" pathLength={1} d="M120 10h94" />
        <path className="evd-rule-star" d="M110 2.5l1.9 5.6 5.6 1.9-5.6 1.9-1.9 5.6-1.9-5.6-5.6-1.9 5.6-1.9z" />
      </svg>
    </div>
  );
};

// --- 3. Titre ---

export const TitleBlock: React.FC<{ event: EventDetail }> = ({ event }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <header className="evd-title-block">
      <div ref={ref} className="evd-rise">
        <p className="evd-kicker">{event.kicker}</p>
        <h1 className="evd-title">{event.title}</h1>
        <p className="evd-refs">{event.refs}</p>
      </div>
      <Rule />
    </header>
  );
};

// --- 4. Repères ---

export const Facts: React.FC<{ facts: EventDetail['facts'] }> = ({ facts }) => {
  const ref = useReveal<HTMLDListElement>();
  return (
    <dl ref={ref} className="evd-facts">
      {facts.slice(0, 4).map((fact, i) => (
        <div key={fact.label} className="evd-fact" style={{ transitionDelay: `${i * 90}ms` }}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
};

// --- 5. Le récit ---

const Layer: React.FC<{ layer: EventLayer }> = ({ layer }) => (
  <div
    className={`evd-layer evd-enter-${layer.enter}`}
    style={{
      left: `${layer.x}%`,
      top: `${layer.y}%`,
      width: `${layer.w}%`,
      height: `${layer.h}%`,
      transitionDelay: `${layer.delay}ms`,
      ['--evd-layer-opacity' as string]: layer.opacity
    }}
  >
    <Art asset={layer.asset} alt={layer.alt} className={layer.flip ? 'is-flipped' : undefined} />
  </div>
);

const TableauView: React.FC<{ tableau: Tableau }> = ({ tableau }) => {
  const stageRef = useReveal<HTMLDivElement>();
  const textRef = useReveal<HTMLDivElement>();
  const numeralRef = useParallax<HTMLSpanElement>(0.14);
  const layersRef = useParallax<HTMLDivElement>(0.05);
  return (
    <article className={`evd-tableau is-${tableau.side}`} data-tableau>
      <div ref={stageRef} className="evd-tableau-stage">
        <span ref={numeralRef} className="evd-numeral" aria-hidden="true">
          {tableau.numeral}
        </span>
        <div
          className="evd-glow"
          style={{
            background: `radial-gradient(closest-side at 38% 42%, ${tableau.glow[0]}, transparent), radial-gradient(closest-side at 64% 60%, ${tableau.glow[1]}, transparent)`
          }}
          aria-hidden="true"
        />
        <div ref={layersRef} className="evd-layers">
          {tableau.layers.map((layer) => (
            <Layer key={layer.asset} layer={layer} />
          ))}
        </div>
      </div>
      <div ref={textRef} className="evd-tableau-text evd-rise">
        <p className="evd-place">{tableau.place}</p>
        <h3 className="evd-tableau-title">{tableau.title}</h3>
        <Quote text={tableau.quote} />
        <RefPill refValue={tableau.ref} />
      </div>
    </article>
  );
};

/** Chant des anges : bande de nuit, citation qui s'éclaire mot à mot. */
const ChorusBand: React.FC<{ chorus: Chorus }> = ({ chorus }) => {
  const { onFrame, onMeasure, reduceMotion } = useScrollEngine();
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const angelRef = useReveal<HTMLDivElement>();
  // Ponctuation haute (« ! », « ; »…) gardée avec le mot qui la précède,
  // par une espace insécable.
  const words = useMemo(
    () => chorus.quote.split(/\s+(?=[^!?;:»])/).map((w) => w.replace(/\s+(?=[!?;:»])/g, ' ')),
    [chorus.quote]
  );

  useEffect(() => {
    const quote = quoteRef.current;
    if (!quote) return;
    const spans = Array.from(quote.querySelectorAll<HTMLSpanElement>('.evd-word'));
    if (reduceMotion) {
      spans.forEach((s) => s.classList.add('is-lit'));
      return;
    }
    let top = 0;
    let lit = -1;
    const offMeasure = onMeasure((scrollEl) => {
      top = contentTop(quote, scrollEl);
    });
    // De 86 % à 44 % de l'écran, les mots s'allument un à un ; ils
    // s'éteignent si l'on remonte.
    const offFrame = onFrame(({ scrollTop, viewportHeight }) => {
      const y = top - scrollTop;
      const progress = (viewportHeight * 0.86 - y) / (viewportHeight * 0.42);
      const count = Math.max(0, Math.min(spans.length, Math.round(progress * spans.length)));
      if (count === lit) return;
      lit = count;
      spans.forEach((s, i) => s.classList.toggle('is-lit', i < count));
    });
    return () => {
      offMeasure();
      offFrame();
    };
  }, [onFrame, onMeasure, reduceMotion, words]);

  return (
    <section className="evd-chorus">
      <Stars seed="chorus" count={34} maxTop={92} />
      <div ref={angelRef} className="evd-chorus-angel evd-rise">
        <div className="evd-chorus-halo" aria-hidden="true" />
        <div className="evd-float">
          <Art asset={chorus.asset} alt="Un ange chante la gloire de Dieu" />
        </div>
      </div>
      <p className="evd-chorus-label">{chorus.label}</p>
      <p ref={quoteRef} className="evd-chorus-quote">
        {words.map((word, i) => (
          <span key={i} className="evd-word">
            {word}{' '}
          </span>
        ))}
      </p>
      <RefPill refValue={chorus.ref} tone="dark" />
    </section>
  );
};

const NUMBER_WORDS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'];

/** Fil or ondulé, dessiné au rythme du défilement (point de lecture à 62 %). */
const STORY_THREAD_X = 16;

export const Story: React.FC<{ event: EventDetail }> = ({ event }) => {
  const { onFrame, onMeasure, reduceMotion } = useScrollEngine();
  const storyRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [geometry, setGeometry] = useState<{ height: number; nodes: number[] }>({ height: 0, nodes: [] });

  // Positions des tableaux dans le récit : hauteur du fil et place des nœuds.
  useEffect(
    () =>
      onMeasure(() => {
        const story = storyRef.current;
        if (!story) return;
        const base = story.getBoundingClientRect().top;
        const nodes = Array.from(story.querySelectorAll('[data-tableau]')).map(
          (el) => Math.round(el.getBoundingClientRect().top - base) + 22
        );
        const height = story.offsetHeight;
        setGeometry((prev) =>
          prev.height === height && prev.nodes.join() === nodes.join() ? prev : { height, nodes }
        );
      }),
    [onMeasure]
  );

  const pathD = useMemo(() => {
    if (!geometry.height) return '';
    const points: string[] = [];
    for (let y = 0; y <= geometry.height; y += 8) {
      const x = STORY_THREAD_X + Math.sin((y / 150) * Math.PI * 2) * 5;
      points.push(`${points.length ? 'L' : 'M'}${x.toFixed(1)} ${y}`);
    }
    return points.join('');
  }, [geometry.height]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const story = storyRef.current;
    if (!path || !story || !pathD) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = reduceMotion ? '0' : `${length}`;
    if (reduceMotion) {
      nodeRefs.current.forEach((n) => n?.classList.add('is-reached'));
      return;
    }
    let top = 0;
    const offMeasure = onMeasure((scrollEl) => {
      top = contentTop(story, scrollEl);
    });
    const offFrame = onFrame(({ scrollTop, viewportHeight }) => {
      const reading = scrollTop + viewportHeight * 0.62 - top;
      const progress = Math.max(0, Math.min(1, reading / geometry.height));
      path.style.strokeDashoffset = `${(length * (1 - progress)).toFixed(1)}`;
      geometry.nodes.forEach((y, i) => nodeRefs.current[i]?.classList.toggle('is-reached', reading >= y));
    });
    return () => {
      offMeasure();
      offFrame();
    };
  }, [pathD, geometry, onFrame, onMeasure, reduceMotion]);

  const count = event.tableaux.length;
  return (
    <section className="evd-story-section">
      <SectionTitle title="Le récit" subtitle={`en ${NUMBER_WORDS[count] ?? count} tableaux`} />
      <div ref={storyRef} className="evd-story">
        <svg className="evd-thread" width="32" height={geometry.height} aria-hidden="true">
          <path className="evd-thread-base" d={pathD} />
          <path ref={pathRef} className="evd-thread-line" d={pathD} />
        </svg>
        {geometry.nodes.map((y, i) => (
          <span
            key={i}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            className="evd-node"
            style={{ top: y }}
            aria-hidden="true"
          >
            ✦
          </span>
        ))}
        {event.tableaux.map((tableau, i) => (
          <div key={tableau.numeral}>
            <TableauView tableau={tableau} />
            {event.chorus && i === event.chorusAfter && <ChorusBand chorus={event.chorus} />}
          </div>
        ))}
      </div>
    </section>
  );
};

// --- 7. Personnages ---

const Medallion: React.FC<{ character: EventCharacter; index: number }> = ({ character, index }) => {
  const navigate = useNavigate();
  const { crop } = character;
  const content = (
    <>
      <span className="evd-medallion">
        <span className="evd-medallion-face">
          <Art
            asset={character.asset}
            alt=""
            style={{
              width: `${crop.scale * 100}%`,
              transform: `translate(-${crop.x}%, -${crop.y}%)`
            }}
          />
        </span>
        <svg className="evd-medallion-ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle className="evd-draw" pathLength={1} cx="60" cy="60" r="58" />
        </svg>
      </span>
      <span className="evd-character-name">{character.name}</span>
      <span className="evd-character-role">{character.role}</span>
    </>
  );
  const style = { transitionDelay: `${index * 90}ms` };
  return character.personId ? (
    <button
      type="button"
      className="evd-character is-link"
      style={style}
      onClick={() => {
        tapHaptic();
        navigate(`/figures/${character.personId}`);
      }}
    >
      {content}
    </button>
  ) : (
    <div className="evd-character" style={style}>
      {content}
    </div>
  );
};

export const Characters: React.FC<{ characters: EventCharacter[] }> = ({ characters }) => {
  const ref = useReveal<HTMLDivElement>(0.86);
  return (
    <section className="evd-band">
      <SectionTitle title="Les personnages" subtitle="autour de la crèche" />
      <div ref={ref} className="evd-characters">
        {characters.map((c, i) => (
          <Medallion key={c.name} character={c} index={i} />
        ))}
      </div>
    </section>
  );
};

// --- 8. Le chemin ---

/** Premier et dernier point d'un tracé SVG. */
function pathEnds(d: string) {
  const nums = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  return { start: [nums[0], nums[1]], end: [nums[nums.length - 2], nums[nums.length - 1]] };
}

export const RouteMap: React.FC<{ route: EventRoute }> = ({ route }) => {
  const ref = useReveal<HTMLDivElement>(0.6);
  const { start, end } = pathEnds(route.path);
  // La carte est dessinée dans un repère de 300 × 200 (celui du tracé, que
  // suit l'âne via offset-path), mis à l'échelle de la largeur disponible.
  const [frameRef, frameWidth] = useElementWidth<HTMLDivElement>(300);
  return (
    <section className="evd-route-section">
      <SectionTitle title="Le chemin" subtitle={`de ${route.from.name} à ${route.to.name}`} />
      <div ref={ref} className="evd-route">
        <div ref={frameRef} className="evd-route-frame">
        <div className="evd-route-map" style={{ transform: `scale(${frameWidth / 300})` }}>
          <svg viewBox="0 0 300 200" className="evd-route-svg" aria-hidden="true">
            <path className="evd-route-dashed" d={route.path} />
            <path className="evd-route-line" pathLength={1} d={route.path} />
            <circle className="evd-route-point" cx={start[0]} cy={start[1]} r="4" />
            <circle className="evd-route-point is-end" cx={end[0]} cy={end[1]} r="4.5" />
          </svg>
          <div className="evd-route-walker" style={{ offsetPath: `path('${route.path}')` }}>
            <Art asset={route.walker} alt="" />
          </div>
          <p className="evd-route-label" style={{ left: `${(start[0] / 300) * 100}%`, top: `${(start[1] / 200) * 100}%` }}>
            <strong>{route.from.name}</strong>
            <span>{route.from.region}</span>
          </p>
          <p
            className="evd-route-label is-end"
            style={{ left: `${(end[0] / 300) * 100}%`, top: `${(end[1] / 200) * 100}%` }}
          >
            <strong>{route.to.name}</strong>
            <span>{route.to.region}</span>
          </p>
        </div>
        </div>
        <p className="evd-route-caption">{route.caption}</p>
      </div>
    </section>
  );
};

// --- 9. La crèche ---

export const SceneView: React.FC<{ scene: EventScene }> = ({ scene }) => {
  const ref = useReveal<HTMLDivElement>();
  const textRef = useReveal<HTMLDivElement>();
  return (
    <section className="evd-scene-section">
      <SectionTitle title={scene.title} subtitle={scene.subtitle} />
      <div ref={ref} className="evd-scene">
        <div className="evd-glow evd-scene-glow" aria-hidden="true" />
        {scene.layers.map((layer) => (
          <Layer key={`${layer.asset}-${layer.x}`} layer={layer} />
        ))}
      </div>
      <div ref={textRef} className="evd-scene-text evd-rise">
        <Quote text={scene.quote} />
        <RefPill refValue={scene.ref} />
      </div>
    </section>
  );
};

// --- 10. Dans la liturgie ---

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export const Liturgy: React.FC<{ days: EventDetail['liturgy'] }> = ({ days }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="evd-liturgy-section">
      <SectionTitle title="Dans la liturgie" subtitle="l'Église célèbre" />
      <div ref={ref} className="evd-liturgy">
        {days.map((d, i) => (
          <div
            key={d.label}
            className={`evd-liturgy-day${d.highlight ? ' is-main' : ''}`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <span className="evd-liturgy-pill">
              <strong>{d.day}</strong>
              <span>{MONTHS[d.month - 1]}</span>
            </span>
            <span className="evd-liturgy-label">{d.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- 11. Pied de page ---

const ARTIST_SHOP_URL = 'https://www.etsy.com/shop/DolceDreamsStudio';

export const Footer: React.FC = () => (
  <footer className="evd-footer">
    <span className="evd-footer-star" aria-hidden="true">
      ✦
    </span>
    <p>
      Artwork by{' '}
      <a href={ARTIST_SHOP_URL} target="_blank" rel="noopener noreferrer">
        DolceDreamsStudio
      </a>
    </p>
    <p>Citations · Bible Crampon</p>
  </footer>
);
