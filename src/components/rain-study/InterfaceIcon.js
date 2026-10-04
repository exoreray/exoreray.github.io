const drawings = {
  'arrow-right': <path d="M4.5 12h14.5M13 6l6 6-6 6" />,
  'arrow-down': <path d="M12 4.5V19M6 13l6 6 6-6" />,
  external: <><path d="M14 4.5h5.5V10M19.5 4.5 10 14" /><path d="M10 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-4" /></>,
  play: <path d="m8 5 11 7-11 7Z" />,
  pause: <path d="M8.5 5v14M15.5 5v14" />,
  music: <><path d="M9 17.5V5.5l10-2v12M9 9l10-2" /><ellipse cx="6" cy="17.5" rx="3" ry="2.5" /><ellipse cx="16" cy="15.5" rx="3" ry="2.5" /></>,
  sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  moon: <path d="M20 14.1A8.4 8.4 0 0 1 9.9 4a8.4 8.4 0 1 0 10.1 10.1Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
};

export default function InterfaceIcon({ name, className = '' }) {
  return <svg className={`rain-icon ${className}`} data-icon={name} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{drawings[name]}</svg>;
}
