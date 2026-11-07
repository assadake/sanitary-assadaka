type P = { className?: string };

const base = "shrink-0";

export const IconSearch = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" className={`${base} ${className}`}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </svg>
);

export const IconBag = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M5.5 8h13l-1 12h-11z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const IconHeart = ({ className = "h-5 w-5", filled = false }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20Z" />
  </svg>
);

export const IconGlobe = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`${base} ${className}`}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9Z" />
  </svg>
);

export const IconPin = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const IconClock = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={`${base} ${className}`}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.4l3.4 2" />
  </svg>
);

export const IconPhone = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M6 3h3l1.6 4.2-2 1.4a11 11 0 0 0 5 5l1.4-2 4.2 1.6V19a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 5.2 2 2 0 0 1 6 3Z" />
  </svg>
);

export const IconChevron = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconArrow = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);

export const IconPlus = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className={`${base} ${className}`}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconMinus = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className={`${base} ${className}`}>
    <path d="M5 12h14" />
  </svg>
);

export const IconTrash = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M4 7h16M9 7V5h6v2M6.5 7l1 13h9l1-13" />
  </svg>
);

export const IconX = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={`${base} ${className}`}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconStar = ({ className = "h-4 w-4", filled = true }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="m12 3.6 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.8-5.1 2.8 1-5.7-4.1-4 5.7-.8Z" />
  </svg>
);

export const IconCheck = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconMenu = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={`${base} ${className}`}>
    <path d="M4 7h16M4 12h16M4 17h11" />
  </svg>
);

export const IconTruck = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17.5" cy="18" r="1.8" />
  </svg>
);

export const IconShield = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M12 3.2 19 6v5.5c0 4.3-2.9 7.6-7 9.3-4.1-1.7-7-5-7-9.3V6Z" />
    <path d="m9 12 2.2 2.2L15.4 10" strokeLinecap="round" />
  </svg>
);

export const IconWrench = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M15.5 3.5a5 5 0 0 0-5.9 6.6L3.8 15.9a2 2 0 0 0 2.8 2.8l5.8-5.8a5 5 0 0 0 6.6-5.9l-2.8 2.8-2.6-.6-.6-2.6Z" />
  </svg>
);

export const IconShip = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M3 14h18l-2.2 5.2H5.2Z" />
    <path d="M6 14V9h12v5M12 9V4M9 4h6" />
  </svg>
);

export const IconTag = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M4 11.5V4h7.5L20 12.5 12.5 20Z" />
    <circle cx="8" cy="8" r="1.4" />
  </svg>
);

export const IconChat = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M4 5h16v11H9l-5 4Z" />
    <path d="M8 9h8M8 12h5" />
  </svg>
);

export const IconSofa = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
    <path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M3 13a2 2 0 0 1 2 2v3h14v-3a2 2 0 0 1 4 0v5H1v-5a2 2 0 0 1 2-2Z" />
  </svg>
);

export const IconWhatsApp = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={`${base} ${className}`}>
    <path d="M16.04 3.2c-7.06 0-12.8 5.73-12.8 12.79 0 2.25.6 4.45 1.72 6.39L3.1 28.8l6.6-1.73a12.8 12.8 0 0 0 6.33 1.66h.01c7.05 0 12.79-5.73 12.79-12.79 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.04-3.69Zm0 23.4h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.92 1.03 1.05-3.82-.26-.4a10.55 10.55 0 0 1-1.62-5.65c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.5 1.1 7.52 3.12a10.56 10.56 0 0 1 3.11 7.52c0 5.87-4.77 10.64-10.72 10.64Zm5.83-7.95c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.08 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37Z" />
  </svg>
);

export const IconFacebook = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`${base} ${className}`}>
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4A21 21 0 0 0 14.3 4c-2.4 0-4 1.4-4 4.1v2.4H7.7v3h2.6V21Z" />
  </svg>
);

export const IconInstagram = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={`${base} ${className}`}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconTiktok = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`${base} ${className}`}>
    <path d="M16.2 3h-2.7v12.1a2.3 2.3 0 1 1-1.9-2.3V10a5.1 5.1 0 1 0 4.6 5.1V8.7a6 6 0 0 0 3.5 1.1V7.1A3.6 3.6 0 0 1 16.2 3Z" />
  </svg>
);

export const IconMail = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" className={`${base} ${className}`}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.8 7 8.2 6 8.2-6" strokeLinecap="round" />
  </svg>
);
