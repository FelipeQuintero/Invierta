import { useState } from 'react';

interface StreetViewProps {
  lat: number;
  lng: number;
  apiKey?: string;
}

export default function StreetView({ lat, lng, apiKey }: StreetViewProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const hasCoordinates = lat !== 0 && lng !== 0;

  if (!hasCoordinates || !apiKey) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
          Street View
        </h3>
        <div className="w-full h-64 bg-[var(--color-surface)] rounded-xl flex flex-col items-center justify-center gap-2 border border-[var(--color-border)]">
          <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {!apiKey
              ? 'Street View no disponible sin API key de Google Maps'
              : 'Coordenadas no disponibles para Street View'}
          </p>
          {hasCoordinates && (
            <a
              href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] text-sm font-medium underline mt-1"
            >
              Abrir Street View en Google Maps
            </a>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
          Street View
        </h3>
        <div className="w-full h-64 bg-[var(--color-surface)] rounded-xl flex flex-col items-center justify-center gap-3 border border-[var(--color-border)]">
          <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-[var(--color-text-secondary)] text-sm">Street View no disponible para esta ubicacion</p>
          <a
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] text-sm font-medium underline"
          >
            Intentar en Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
        Street View
      </h3>
      <div className="w-full h-80 md:h-96 rounded-xl overflow-hidden border border-[var(--color-border)] relative bg-[var(--color-surface)]">
        {!loaded && (
          <div className="absolute inset-0 bg-[var(--color-surface)] animate-pulse flex flex-col items-center justify-center gap-2">
            <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-[var(--color-text-muted)] text-sm">Cargando Street View...</p>
          </div>
        )}
        <iframe
          title="Google Street View"
          src={`https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lng}&heading=210&pitch=10&fov=90&source=outdoor`}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
}
