type P = { className?: string };

const svg = "shrink-0";

export const IconPlay = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="currentColor" aria-hidden>
    <path d="M8 5.2c0-.9 1-1.5 1.8-1l9.1 6.3c.7.5.7 1.5 0 2L9.8 18.8c-.8.5-1.8-.1-1.8-1V5.2Z" />
  </svg>
);

export const IconPause = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="currentColor" aria-hidden>
    <path d="M7 5h3.4v14H7zm6.6 0H17v14h-3.4z" />
  </svg>
);

export const IconReplay = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
  </svg>
);

export const IconRotate = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.5 12a8.5 8.5 0 1 1-2.7-6.2M20.5 4v5h-5" />
    <circle cx="12" cy="12" r="2.4" />
  </svg>
);

export const IconExpand = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5" />
  </svg>
);

export const IconCompress = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5" />
  </svg>
);

export const IconVolume = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
    <path d="M16 9a4 4 0 0 1 0 6M18.7 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);

export const IconVolumeOff = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
    <path d="m16.5 9.5 5 5m0-5-5 5" />
  </svg>
);

export const IconZoomIn = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6" />
  </svg>
);

export const IconZoomOut = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21M7.5 10.5h6" />
  </svg>
);

export const IconReset = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3a9 9 0 1 1-8.4 12.2M3 20v-5h5" />
    <circle cx="12" cy="12" r="2.2" />
  </svg>
);

export const IconChevronL = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m14.5 5-7 7 7 7" />
  </svg>
);

export const IconChevronR = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m9.5 5 7 7-7 7" />
  </svg>
);

export const IconCube = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4z" />
    <path d="M3.8 7.4 12 12l8.2-4.6M12 12v9.2" />
  </svg>
);

export const IconHand = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M8 12V5.6a1.4 1.4 0 0 1 2.8 0V11m0-1.4a1.4 1.4 0 0 1 2.8 0V11m0-.8a1.4 1.4 0 0 1 2.8 0v4.4c0 3.2-2.2 5.4-5.4 5.4h-1.2c-2 0-3.3-.8-4.4-2.4l-2-3a1.5 1.5 0 0 1 2.3-1.9L8 14.6" />
  </svg>
);

export const IconSpark = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 2.5 13.8 9l6.7 1.8-6.7 1.8L12 19.3l-1.8-6.7L3.5 10.8 10.2 9z" />
  </svg>
);

export const IconKeyboard = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={`${svg} ${className}`} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 13.5h.01M10 13.5h.01M14 13.5h.01M18 13.5h.01M8.5 16h7" />
  </svg>
);
