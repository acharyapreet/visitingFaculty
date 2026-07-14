// Lightweight inline icon set so this folder has zero required dependency on
// an icon package. Swap for lucide-react if the project already includes it:
//   import { LayoutGrid, Users, ... } from "lucide-react";

export const IconGrid = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconUsers = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconBook = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const IconClipboardCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" {...props}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

export const IconCalendarCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="m9 16 2 2 4-4" />
  </svg>
);

export const IconReceipt = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" {...props}>
    <path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 1z" />
    <path d="M8 7h8M8 11h8M8 15h5" />
  </svg>
);

export const IconBarChart = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" {...props}>
    <path d="M12 20V10M18 20V4M6 20v-4" />
  </svg>
);

export const IconLogOut = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const IconSearch = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" width="14" height="14" {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconX = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" width="14" height="14" {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconEye = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="14" height="14" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconAlertTriangle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="22" height="22" {...props}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const IconShieldCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" {...props}>
    <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconDownload = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5M12 15V3" />
  </svg>
);

export const IconPlus = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16" {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconFilter = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16" {...props}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </svg>
);

export const IconDots = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}>
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

export const IconMail = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </svg>
);

export const IconUser = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16" {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
  </svg>
);

export const IconGraduationCap = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16" {...props}>
    <path d="M22 10 12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
  </svg>
);

export const IconChevronLeft = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16" {...props}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const IconChevronRight = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16" {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const IconArrowRight = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="16" height="16" {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconHelp = (props) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="20" height="20" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
    <path d="M12 17h.01" />
  </svg>
);