import { Heart, MapPin, Ruler, BedDouble, Bath, Car } from 'lucide-react';
import type { PropertyTag, PropertyType, OperationType } from '../../lib/types';
import { PROPERTY_TYPES } from '../../lib/constants';

interface PropertyCardProps {
  id: string;
  title: string;
  image: string;
  images?: string[];
  price: number;
  priceType: 'venta' | 'arriendo';
  operationType?: OperationType;
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking?: number;
  adminFee?: number;
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

function getOperationBadge(operationType?: OperationType, priceType?: 'venta' | 'arriendo'): { label: string; className: string } | null {
  const op = operationType || priceType;
  switch (op) {
    case 'venta':
      return { label: 'En Venta', className: 'bg-emerald-600 text-white' };
    case 'arriendo':
      return { label: 'En Arriendo', className: 'bg-blue-600 text-white' };
    case 'proyecto':
      return { label: 'Proyecto', className: 'bg-purple-600 text-white' };
    default:
      return null;
  }
}

export default function PropertyCardReact({
  id,
  title,
  image,
  images,
  price,
  priceType,
  operationType,
  location,
  area,
  bedrooms,
  bathrooms,
  parking = 0,
  adminFee,
  tags,
  propertyType,
  className = '',
  style,
}: PropertyCardProps) {
  const propertyTypeLabel =
    PROPERTY_TYPES.find((pt) => pt.value === propertyType)?.label || propertyType;

  const formattedPrice = formatPrice(price);
  const propertyUrl = getPropertyUrl(id);
  const opBadge = getOperationBadge(operationType, priceType);
  const imageCount = images ? images.length : 1;

  return (
    <a
      href={propertyUrl}
      className={`group flex flex-col bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer ${className}`}
      style={style}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {opBadge && (
          <div className="absolute top-3 left-3">
            <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md shadow-sm ${opBadge.className}`}>
              {opBadge.label}
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full shadow-sm ${getTagColor(tag)}`}
                >
                  {getTagLabel(tag)}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
            aria-label="Guardar en favoritos"
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {imageCount > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {Array.from({ length: Math.min(imageCount, 5) }).map((_, i) => (
              <span
                key={i}
                className={`block w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
            {imageCount > 5 && (
              <span className="text-white text-[10px] font-medium ml-0.5">+{imageCount - 5}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow p-4">
        <div className="mb-1">
          <p className="font-heading font-bold text-lg text-[var(--color-accent)] leading-tight">
            {formattedPrice}
            {priceType === 'arriendo' && (
              <span className="text-sm font-normal text-[var(--color-text-muted)]">/mes</span>
            )}
          </p>
          {adminFee != null && adminFee > 0 && priceType === 'arriendo' && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Admin: {formatPrice(adminFee)}
            </p>
          )}
        </div>

        <h3 className="font-heading font-semibold text-[var(--color-text-primary)] text-sm leading-snug truncate mb-1 group-hover:text-[var(--color-primary)] transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] text-xs mb-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-text-muted)]" />
          <span className="truncate">{location}</span>
        </div>

        <span className="inline-block self-start text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface-alt)] rounded px-1.5 py-0.5 mb-3 font-medium uppercase tracking-wide">
          {propertyTypeLabel}
        </span>

        <div className="mt-auto pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-xs">
            <div className="flex items-center gap-1" title={`${area} m\u00B2`}>
              <Ruler className="w-3.5 h-3.5 text-[var(--color-navy)]" />
              <span>{area} m&sup2;</span>
            </div>

            {bedrooms > 0 && (
              <div className="flex items-center gap-1" title={`${bedrooms} habitación(es)`}>
                <BedDouble className="w-3.5 h-3.5 text-[var(--color-navy)]" />
                <span>{bedrooms}</span>
              </div>
            )}

            {bathrooms > 0 && (
              <div className="flex items-center gap-1" title={`${bathrooms} baño(s)`}>
                <Bath className="w-3.5 h-3.5 text-[var(--color-navy)]" />
                <span>{bathrooms}</span>
              </div>
            )}

            {parking > 0 && (
              <div className="flex items-center gap-1" title={`${parking} parqueadero(s)`}>
                <Car className="w-3.5 h-3.5 text-[var(--color-navy)]" />
                <span>{parking}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
