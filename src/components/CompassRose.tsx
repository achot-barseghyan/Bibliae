import './CompassRose.css';

/** Rose des vents : quatre grandes pointes cardinales bicolores, quatre
 * petites pointes intercardinales, deux cercles et le nord marqué. */
const CompassRose: React.FC<{ className?: string }> = ({ className }) => {
  const cardinal = [0, 90, 180, 270];
  const intercardinal = [45, 135, 225, 315];
  const ticks = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg className={`compass-rose${className ? ` ${className}` : ''}`} viewBox="-120 -130 240 250" aria-hidden="true">
      <circle r="112" className="compass-rose-ring" />
      <circle r="74" className="compass-rose-ring compass-rose-ring--inner" />
      {ticks.map((angle) => (
        <line
          key={angle}
          y1={-112}
          y2={angle % 90 === 0 ? -100 : -106}
          transform={`rotate(${angle})`}
          className="compass-rose-tick"
        />
      ))}
      <text y="-117" className="compass-rose-north">
        N
      </text>
      <g className="compass-rose-star">
        {intercardinal.map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path d="M0 0 L-9 -9 L0 -62 Z" className="compass-rose-point--light" />
            <path d="M0 0 L9 -9 L0 -62 Z" className="compass-rose-point--outline" />
          </g>
        ))}
        {cardinal.map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path d="M0 0 L-11 -11 L0 -92 Z" className="compass-rose-point--dark" />
            <path d="M0 0 L11 -11 L0 -92 Z" className="compass-rose-point--mid" />
          </g>
        ))}
        <circle r="5" className="compass-rose-center" />
      </g>
    </svg>
  );
};

export default CompassRose;
