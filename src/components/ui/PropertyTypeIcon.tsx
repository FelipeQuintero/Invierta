import type { PropertyType } from '../../lib/types';

interface Props {
  type: PropertyType;
  className?: string;
}

const iconPaths: Record<PropertyType, React.ReactNode> = {
  apartamento: (
    <>
      <rect x="3" y="2" width="18" height="20" rx="1.5" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <rect x="7" y="5" width="3" height="3" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <rect x="14" y="5" width="3" height="3" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <rect x="7" y="11" width="3" height="3" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <rect x="14" y="11" width="3" height="3" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <rect x="10" y="17" width="4" height="5" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
    </>
  ),
  apartaestudio: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="1.5" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <rect x="8" y="5" width="8" height="5" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <line x1="8" y1="14" x2="16" y2="14" strokeWidth="1.2" stroke="currentColor" />
      <rect x="10" y="17" width="4" height="5" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
    </>
  ),
  casa: (
    <>
      <path d="M3 10.5L12 3l9 7.5" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20a1 1 0 001 1h12a1 1 0 001-1V9.5" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <rect x="10" y="14" width="4" height="7" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <rect x="14.5" y="11" width="2.5" height="2.5" rx="0.3" strokeWidth="1" stroke="currentColor" fill="none" />
    </>
  ),
  casa_campestre: (
    <>
      <path d="M2 12l10-9 10 9" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 10.5V21h16V10.5" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <rect x="9.5" y="15" width="5" height="6" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <path d="M1 21h22" strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" />
      <circle cx="19" cy="6" r="2" strokeWidth="1" stroke="currentColor" fill="none" />
      <path d="M19 8v2" strokeWidth="1" stroke="currentColor" strokeLinecap="round" />
    </>
  ),
  casa_comercial: (
    <>
      <path d="M3 10.5L12 3l9 7.5" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20a1 1 0 001 1h12a1 1 0 001-1V9.5" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <rect x="7" y="12" width="10" height="5" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <line x1="7" y1="14.5" x2="17" y2="14.5" strokeWidth="0.8" stroke="currentColor" />
      <path d="M10 17v4M14 17v4" strokeWidth="1" stroke="currentColor" />
    </>
  ),
  casa_lote: (
    <>
      <path d="M2 13l7-6 7 6" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 11.5V21h12V11.5" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <rect x="8" y="16" width="4" height="5" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <path d="M16 21h6V15l-3-2-3 2v6z" strokeWidth="1.2" stroke="currentColor" fill="none" strokeLinejoin="round" />
    </>
  ),
  local: (
    <>
      <rect x="2" y="7" width="20" height="15" rx="1" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <path d="M2 7l2-4h16l2 4" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinejoin="round" />
      <rect x="5" y="10" width="6" height="5" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <rect x="14" y="14" width="4" height="8" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <path d="M2 7h20" strokeWidth="1.2" stroke="currentColor" />
    </>
  ),
  oficina: (
    <>
      <rect x="2" y="3" width="20" height="18" rx="1.5" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <line x1="2" y1="8" x2="22" y2="8" strokeWidth="1.2" stroke="currentColor" />
      <rect x="5" y="11" width="5" height="3" rx="0.5" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="14" y="11" width="5" height="3" rx="0.5" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="5" y="17" width="5" height="3" rx="0.5" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="14" y="17" width="5" height="3" rx="0.5" strokeWidth="1" stroke="currentColor" fill="none" />
    </>
  ),
  consultorio: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="1.5" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <path d="M12 9v6M9 12h6" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" />
      <line x1="3" y1="8" x2="21" y2="8" strokeWidth="1" stroke="currentColor" />
    </>
  ),
  bodega: (
    <>
      <path d="M2 20V10a2 2 0 011.2-1.8l8-3.5a2 2 0 011.6 0l8 3.5A2 2 0 0122 10v10" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <line x1="1" y1="20" x2="23" y2="20" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" />
      <rect x="8" y="13" width="8" height="7" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <line x1="12" y1="13" x2="12" y2="20" strokeWidth="1" stroke="currentColor" />
    </>
  ),
  edificio: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="1" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <rect x="8" y="5" width="2.5" height="2" rx="0.3" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="13.5" y="5" width="2.5" height="2" rx="0.3" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="8" y="9.5" width="2.5" height="2" rx="0.3" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="13.5" y="9.5" width="2.5" height="2" rx="0.3" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="8" y="14" width="2.5" height="2" rx="0.3" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="13.5" y="14" width="2.5" height="2" rx="0.3" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="10" y="18" width="4" height="4" rx="0.3" strokeWidth="1" stroke="currentColor" fill="none" />
    </>
  ),
  finca: (
    <>
      <path d="M1 14l11-10 11 10" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12.5V21h18V12.5" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <rect x="10" y="16" width="4" height="5" rx="0.5" strokeWidth="1.2" stroke="currentColor" fill="none" />
      <path d="M18 7V4h3v5" strokeWidth="1.2" stroke="currentColor" fill="none" strokeLinejoin="round" />
      <path d="M1 21h22" strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" />
    </>
  ),
  hotel: (
    <>
      <rect x="3" y="3" width="18" height="19" rx="1.5" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <line x1="3" y1="7" x2="21" y2="7" strokeWidth="1.2" stroke="currentColor" />
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <rect x="6" y="10" width="4" height="3" rx="0.5" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="14" y="10" width="4" height="3" rx="0.5" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="6" y="16" width="4" height="3" rx="0.5" strokeWidth="1" stroke="currentColor" fill="none" />
      <rect x="14" y="16" width="4" height="3" rx="0.5" strokeWidth="1" stroke="currentColor" fill="none" />
    </>
  ),
  lote: (
    <>
      <path d="M3 21L7 5l5 4 5-7 4 10v9H3z" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinejoin="round" />
      <line x1="1" y1="21" x2="23" y2="21" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" />
      <path d="M10 14v7M15 12v9" strokeWidth="1" stroke="currentColor" strokeDasharray="2 2" />
    </>
  ),
  parqueadero: (
    <>
      <rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="1.5" stroke="currentColor" fill="none" />
      <path d="M2 10h20" strokeWidth="1.2" stroke="currentColor" />
      <text x="12" y="18" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">P</text>
      <path d="M6 6V4a1 1 0 011-1h10a1 1 0 011 1v2" strokeWidth="1.2" stroke="currentColor" fill="none" />
    </>
  ),
};

export default function PropertyTypeIcon({ type, className = 'w-5 h-5' }: Props) {
  const paths = iconPaths[type];
  if (!paths) return null;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}
