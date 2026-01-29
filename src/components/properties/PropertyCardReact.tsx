import type { Property, PropertyTag, PropertyType } from '../../lib/types';
import { PROPERTY_TYPES } from '../../lib/constants';

interface PropertyCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  priceType: 'venta' | 'arriendo';
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  tags: PropertyTag[];
  propertyType: PropertyType;
  className?: string;
  style?: React.CSSProperties;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getPropertyUrl(id: string): string {
  return `/propiedad/${id}`;
}

function getTagLabel(tag: PropertyTag): string {
  const labels: Record<PropertyTag, string> = {
    destacado: 'Destacado',
    negociable: 'Negociable',
    bajo_precio: 'Bajo de Precio',
    nuevo: 'Nuevo',
  };
  return labels[tag] || tag;
}

function getTagColor(tag: PropertyTag): string {
  const colors: Record<PropertyTag, string> = {
    destacado: 'bg-amber-500 text-white',
    negociable: 'bg-emerald-500 text-white',
    bajo_precio: 'bg-rose-500 text-white',
    nuevo: 'bg-sky-500 text-white',
  };
  return colors[tag] || 'bg-gray-500 text-white';
}

export default function PropertyCardReact({
  id,
  title,
  image,
  price,
  priceType,
  location,
  area,
  bedrooms,
  bathrooms,
  tags,
  propertyType,
  className = '',
  style,
}: PropertyCardProps) {
  const propertyTypeLabel =
    PROPERTY_TYPES.find((pt) => pt.value === propertyType)?.label || propertyType;

  const formattedPrice = formatPrice(price);
  const priceDisplay = priceType === 'arriendo' ? `${formattedPrice}/mes` : formattedPrice;
  const propertyUrl = getPropertyUrl(id);

  return (
    <a
      href={propertyUrl}
      className={`group block bg-white rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${className}`}
      style={style}
    >
      {/* Image section */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Tag badges - top left */}
        {tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full shadow-sm ${getTagColor(tag)}`}
              >
                {getTagLabel(tag)}
              </span>
            ))}
          </div>
        )}

        {/* Price overlay - bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-3 px-4">
          <p className="text-white font-heading font-bold text-lg leading-tight">
            {priceDisplay}
          </p>
        </div>
      </div>

      {/* Info section */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-text-primary text-base leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-text-secondary text-sm mb-1">
          {/* Location pin icon */}
          <svg
            className="w-4 h-4 flex-shrink-0 text-text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="truncate">{location}</span>
        </div>

        <span className="inline-block text-xs text-text-muted bg-surface-alt rounded-md px-2 py-0.5 mb-3">
          {propertyTypeLabel}
        </span>

        {/* Bottom row: area, bedrooms, bathrooms */}
        <div className="flex items-center gap-4 pt-3 border-t border-border text-text-secondary text-sm">
          {/* Area - Ruler icon */}
          <div className="flex items-center gap-1.5" title={`${area} m\u00B2`}>
            <svg
              className="w-4 h-4 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
              <path d="m14.5 12.5 2-2" />
              <path d="m11.5 9.5 2-2" />
              <path d="m8.5 6.5 2-2" />
              <path d="m17.5 15.5 2-2" />
            </svg>
            <span>{area} m&sup2;</span>
          </div>

          {/* Bedrooms - BedDouble icon (only show if > 0) */}
          {bedrooms > 0 && (
            <div className="flex items-center gap-1.5" title={`${bedrooms} habitacion(es)`}>
              <svg
                className="w-4 h-4 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
                <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                <path d="M12 4v6" />
                <path d="M2 18h20" />
              </svg>
              <span>{bedrooms}</span>
            </div>
          )}

          {/* Bathrooms - Bath icon (only show if > 0) */}
          {bathrooms > 0 && (
            <div className="flex items-center gap-1.5" title={`${bathrooms} bano(s)`}>
              <svg
                className="w-4 h-4 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
                <line x1="10" x2="8" y1="5" y2="7" />
                <line x1="2" x2="22" y1="12" y2="12" />
                <line x1="7" x2="7" y1="19" y2="21" />
                <line x1="17" x2="17" y1="19" y2="21" />
              </svg>
              <span>{bathrooms}</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </a>
  );
}
