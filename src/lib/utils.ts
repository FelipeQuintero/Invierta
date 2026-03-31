export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(area: number): string {
  const formatted = Number.isInteger(area) ? area.toString() : area.toFixed(2);
  return `${formatted} m²`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getWhatsAppUrl(number: string, message?: string): string {
  const encodedMessage = encodeURIComponent(
    message || 'Hola, me interesa información sobre sus propiedades'
  );
  return `https://wa.me/${number}?text=${encodedMessage}`;
}

export function getPropertyUrl(id: string): string {
  return `/propiedad/${id}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

export function buildSearchParams(filters: Record<string, string | number | boolean | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export function getTagLabel(tag: string): string {
  const labels: Record<string, string> = {
    destacado: 'Destacado',
    negociable: 'Negociable',
    bajo_precio: 'Bajo de Precio',
    nuevo: 'Nuevo',
  };
  return labels[tag] || tag;
}

export function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    destacado: 'bg-amber-500 text-white',
    negociable: 'bg-emerald-500 text-white',
    bajo_precio: 'bg-rose-500 text-white',
    nuevo: 'bg-sky-500 text-white',
  };
  return colors[tag] || 'bg-gray-500 text-white';
}
