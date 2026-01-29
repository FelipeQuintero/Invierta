import { useState } from 'react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  title?: string;
}

export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  const [loaded, setLoaded] = useState(false);

  const hasCoordinates = lat !== 0 && lng !== 0;
  const address = title || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  // The Google Maps API key would be set via environment variable
  // For now we use a fallback that shows coordinates and a link to Google Maps
  const apiKey = '';

  if (!hasCoordinates) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
          Ubicacion
        </h3>
        <div className="w-full h-64 bg-[var(--color-surface)] rounded-xl flex flex-col items-center justify-center gap-2 border border-[var(--color-border)]">
          <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-[var(--color-text-secondary)] text-sm">Ubicacion no disponible en el mapa</p>
          {address && (
            <p className="text-[var(--color-text-primary)] font-medium text-sm">{address}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
        Ubicacion
      </h3>
      <div className="w-full h-80 md:h-96 rounded-xl overflow-hidden border border-[var(--color-border)] relative bg-[var(--color-surface)]">
        {!loaded && (
          <div className="absolute inset-0 bg-[var(--color-surface)] animate-pulse flex flex-col items-center justify-center gap-2">
            <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="text-[var(--color-text-muted)] text-sm">Cargando mapa...</p>
          </div>
        )}
        {apiKey ? (
          <iframe
            title={`Mapa de ${address}`}
            src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=16`}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
            <svg className="w-12 h-12 text-[var(--color-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="text-[var(--color-text-primary)] font-semibold">{address}</p>
            <p className="text-[var(--color-text-secondary)] text-sm">
              Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm mt-2"
            >
              Ver en Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
