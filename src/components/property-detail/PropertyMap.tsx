import { useEffect, useRef, useState } from 'react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  title?: string;
}

export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  const hasCoordinates = lat !== 0 && lng !== 0;
  const address = title || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  useEffect(() => {
    if (!hasCoordinates || !mapRef.current || mapInstanceRef.current) return;

    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      try {
        // Load CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Load JS
        if (!(window as any).L) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Leaflet'));
            document.head.appendChild(script);
          });
        }

        const L = (window as any).L;

        // Initialize map
        const map = L.map(mapRef.current).setView([lat, lng], 16);
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Add marker
        const marker = L.marker([lat, lng]).addTo(map);
        if (title) {
          marker.bindPopup(`<strong>${title}</strong>`).openPopup();
        }

        setLoaded(true);
      } catch (err) {
        console.error('Error loading map:', err);
        setError(true);
      }
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, title, hasCoordinates]);

  if (!hasCoordinates) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
          Ubicación
        </h3>
        <div className="w-full h-64 bg-[var(--color-surface)] rounded-xl flex flex-col items-center justify-center gap-2 border border-[var(--color-border)]">
          <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-[var(--color-text-secondary)] text-sm">Ubicación no disponible en el mapa</p>
          {address && (
            <p className="text-[var(--color-text-primary)] font-medium text-sm">{address}</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
          Ubicación
        </h3>
        <div className="w-full h-64 bg-[var(--color-surface)] rounded-xl flex flex-col items-center justify-center gap-3 p-6 text-center border border-[var(--color-border)]">
          <svg className="w-12 h-12 text-[var(--color-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-[var(--color-text-primary)] font-semibold">{address}</p>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm mt-2"
          >
            Ver en OpenStreetMap
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-family-heading)]">
        Ubicación
      </h3>
      <div className="w-full h-80 md:h-96 rounded-xl overflow-hidden border border-[var(--color-border)] relative bg-[var(--color-surface)]">
        {!loaded && (
          <div className="absolute inset-0 bg-[var(--color-surface)] animate-pulse flex flex-col items-center justify-center gap-2 z-10">
            <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="text-[var(--color-text-muted)] text-sm">Cargando mapa...</p>
          </div>
        )}
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ zIndex: 1 }}
        />
      </div>
    </div>
  );
}
