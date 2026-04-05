import { useEffect, useMemo, useRef, useState } from 'react';
import type { Property } from '../../lib/types';
import { PROPERTY_TYPES } from '../../lib/constants';

interface PropertiesMapProps {
  properties: Property[];
}
 
function formatPriceCOP(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getPropertyTypeLabel(type: string): string {
  const found = PROPERTY_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

function buildPopupHTML(property: Property): string {
  const image = property.images[0] || '/images/placeholder.jpg';
  const typeLabel = getPropertyTypeLabel(property.propertyType);
  const price = formatPriceCOP(property.price);
  const priceLabel = property.priceType === 'arriendo' ? '/mes' : '';

  return `
    <div style="width:260px;font-family:'DM Sans',sans-serif;">
      <img src="${image}" alt="${property.title}"
        style="width:100%;height:140px;object-fit:cover;border-radius:6px 6px 0 0;display:block;" />
      <div style="padding:10px 12px 12px;">
        <div style="font-size:11px;color:#4a5568;margin-bottom:2px;">
          ${typeLabel} &middot; ${property.neighborhood}
        </div>
        <div style="font-size:16px;font-weight:700;color:#1a2332;margin-bottom:4px;">
          ${price}<span style="font-size:12px;font-weight:400;color:#4a5568;">${priceLabel}</span>
        </div>
        <div style="display:flex;gap:10px;font-size:12px;color:#4a5568;margin-bottom:8px;">
          <span title="Área">${property.area} m&sup2;</span>
          ${property.bedrooms > 0 ? `<span title="Habitaciones">${property.bedrooms} hab</span>` : ''}
          ${property.bathrooms > 0 ? `<span title="Baños">${property.bathrooms} baños</span>` : ''}
        </div>
        <a href="/propiedad/${property.id}"
          style="display:block;text-align:center;background:#f97316;color:#fff;padding:6px 12px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:600;">
          Ver detalle
        </a>
      </div>
    </div>
  `;
}

// Center of Colombia as default
const COLOMBIA_CENTER: [number, number] = [4.6, -74.1];
const COLOMBIA_ZOOM = 6;

export default function PropertiesMap({ properties }: PropertiesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const mapInstanceRef = useRef<ReturnType<typeof Object> | null>(null);

  const propertiesWithCoords = useMemo(
    () => properties.filter(
      (p) => p.coordinates && p.coordinates.lat !== 0 && p.coordinates.lng !== 0
    ),
    [properties]
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const loadMap = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet@1.9"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Load MarkerCluster CSS
        if (!document.querySelector('link[href*="MarkerCluster.css"]')) {
          const mcCss = document.createElement('link');
          mcCss.rel = 'stylesheet';
          mcCss.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
          document.head.appendChild(mcCss);

          const mcDefaultCss = document.createElement('link');
          mcDefaultCss.rel = 'stylesheet';
          mcDefaultCss.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
          document.head.appendChild(mcDefaultCss);
        }

        // Load Leaflet JS
        if (!(window as unknown as Record<string, unknown>).L) {
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

        // Load MarkerCluster JS
        if (!(window as unknown as Record<string, unknown>).L || !(window as unknown as Record<string, { MarkerClusterGroup?: unknown }>).L?.MarkerClusterGroup) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load MarkerCluster'));
            document.head.appendChild(script);
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L;

        const map = L.map(mapRef.current, {
          scrollWheelZoom: true,
          zoomControl: true,
        });
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Create marker cluster group with branded colors
        const markers = L.markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          iconCreateFunction: (cluster: { getChildCount: () => number }) => {
            const count = cluster.getChildCount();
            let size = 'small';
            let dimension = 36;
            if (count >= 10 && count < 50) {
              size = 'medium';
              dimension = 44;
            } else if (count >= 50) {
              size = 'large';
              dimension = 52;
            }
            return L.divIcon({
              html: `<div class="properties-cluster properties-cluster--${size}"><span>${count}</span></div>`,
              className: 'properties-cluster-icon',
              iconSize: L.point(dimension, dimension),
            });
          },
        });

        if (propertiesWithCoords.length > 0) {
          const bounds: [number, number][] = [];

          propertiesWithCoords.forEach((property) => {
            const coords = property.coordinates!;
            const marker = L.marker([coords.lat, coords.lng]);
            marker.bindPopup(buildPopupHTML(property), {
              maxWidth: 280,
              minWidth: 260,
              className: 'properties-map-popup',
            });
            markers.addLayer(marker);
            bounds.push([coords.lat, coords.lng]);
          });

          map.addLayer(markers);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        } else {
          map.setView(COLOMBIA_CENTER, COLOMBIA_ZOOM);
        }

        setLoaded(true);
      } catch (err) {
        console.error('Error loading properties map:', err);
        setError(true);
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [propertiesWithCoords]);

  if (error) {
    return (
      <div className="w-full h-[500px] lg:h-[600px] bg-surface rounded-xl flex flex-col items-center justify-center gap-3 border border-border">
        <svg className="w-12 h-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <p className="text-text-secondary text-sm">No se pudo cargar el mapa</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="w-full h-[500px] lg:h-[600px] bg-surface rounded-xl flex flex-col items-center justify-center gap-3 border border-border">
        <svg className="w-12 h-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <p className="text-text-secondary text-sm">No hay propiedades para mostrar en el mapa</p>
      </div>
    );
  }

  if (propertiesWithCoords.length === 0) {
    return (
      <div className="w-full h-[500px] lg:h-[600px] bg-surface rounded-xl flex flex-col items-center justify-center gap-3 border border-border">
        <svg className="w-12 h-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <p className="text-text-secondary text-sm">No hay propiedades con ubicación disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-border relative bg-surface">
      {!loaded && (
        <div className="absolute inset-0 bg-surface animate-pulse flex flex-col items-center justify-center gap-2 z-10">
          <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-text-muted text-sm">Cargando mapa...</p>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      />
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-text-secondary border border-border shadow-sm">
        {propertiesWithCoords.length} propiedad{propertiesWithCoords.length !== 1 ? 'es' : ''} en el mapa
      </div>
    </div>
  );
}
