interface IconProps {
  size?: number;
  className?: string;
}

export const CrossIcon: React.FC<IconProps> = ({ size = 22, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3v18M6.5 8.5h11" />
  </svg>
);

export const RosaireIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="14" r="5.5" />
    <path d="M12 8.5V3" />
  </svg>
);

export const PrierIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 21c-3-2-6-4.5-6-8a3.2 3.2 0 0 1 6-1.6A3.2 3.2 0 0 1 18 13c0 3.5-3 6-6 8z" />
    <path d="M12 11.4V6M9.5 8.5 12 6l2.5 2.5" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 12, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 9l7 7 7-7" />
  </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ size = 12, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M19 15l-7-7-7 7" />
  </svg>
);

export const AccessibilityIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
    <path d="M7 10.5c1.5.8 3.2 1.2 5 1.2s3.5-.4 5-1.2" strokeLinecap="round" />
    <path d="M12 11.5v3.5" strokeLinecap="round" />
    <path d="M12 15l-2.2 4.5M12 15l2.2 4.5" strokeLinecap="round" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M20.5 20.5L16 16" />
  </svg>
);

interface BookmarkIconProps extends IconProps {
  filled?: boolean;
}

export const BookmarkIcon: React.FC<BookmarkIconProps> = ({ size = 20, className, filled = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 4.5c0-.55.45-1 1-1h10c.55 0 1 .45 1 1V20l-6-3.8-6 3.8z" />
  </svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ size = 12, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2l1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8z" />
  </svg>
);

export const TreeIcon: React.FC<IconProps> = ({ size = 40, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
    aria-hidden="true"
  >
    <circle cx="20" cy="8" r="4" />
    <circle cx="8" cy="30" r="4" />
    <circle cx="32" cy="30" r="4" />
    <path d="M20 12v8M8 26v-6h24v6M20 20v6" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 13.09H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const UnderlineIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 3v7a6 6 0 0 0 12 0V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);

export const NoteIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 12.5l5.5 5.5L20 7" />
  </svg>
);

export const BookIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 5.5C6 4.2 8.5 3.5 12 3.5s6 .7 8 2v14c-2-1.3-4.5-2-8-2s-6 .7-8 2z" />
    <path d="M12 5.5v14" />
  </svg>
);

export const PeopleIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20c0-3.6 2.9-6.5 5.5-6.5s5.5 2.9 5.5 6.5" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M15.3 13.8c2.3.4 4.2 2.6 4.2 5.4" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
  </svg>
);

export const MusicNoteIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 18V5.5l10-2V16" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="16.5" cy="16" r="2.5" />
  </svg>
);

export const AirplaneIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16M3 21v-5h5" />
  </svg>
);

export const LocationIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
  </svg>
);

export const CompassIcon: React.FC<IconProps> = ({ size = 40, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="20" cy="20" r="13" />
    <path d="M20 10 L22 18 L30 20 L22 22 L20 30 L18 22 L10 20 L18 18 Z" />
    <circle cx="20" cy="20" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const MapIcon: React.FC<IconProps> = ({ size = 40, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M14 6 6 9v25l8-3 12 3 8-3V6l-8 3-12-3z" />
    <path d="M14 6v25M26 9v25" />
    <circle cx="20" cy="18" r="2.5" fill="currentColor" stroke="none" />
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </svg>
);
