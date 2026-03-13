import { useState } from 'react';
import { Bath, BedDouble, Car, Expand, Ruler } from 'lucide-react';
import type { ProjectTypology } from './types';

interface ProjectTypologiesProps {
  typologies: ProjectTypology[];
}

function formatPrice(price?: number) {
  if (!price) return 'A consultar';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProjectTypologies({ typologies }: ProjectTypologiesProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  if (!typologies?.length) {
    return <p className="text-sm text-text-secondary">Este proyecto aún no tiene tipologías publicadas.</p>;
  }

  const sorted = [...typologies].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((item) => (
          <article key={item.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="font-heading text-lg font-semibold text-text-primary">{item.name}</h3>
              {item.totalUnits != null && item.availableUnits != null && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {item.availableUnits} de {item.totalUnits} disponibles
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-text-secondary sm:grid-cols-4">
              <div className="flex items-center gap-1.5"><Ruler className="h-4 w-4" />{item.area ? `${item.area} m²` : 'N/D'}</div>
              <div className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" />{item.bedrooms ?? 'N/D'}</div>
              <div className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{item.bathrooms ?? 'N/D'}</div>
              <div className="flex items-center gap-1.5"><Car className="h-4 w-4" />{item.parking ?? 0}</div>
            </div>

            <p className="mt-3 text-base font-bold text-accent">{formatPrice(item.price)}</p>

            {item.floorPlanImage && (
              <button
                type="button"
                onClick={() => setSelectedPlan(item.floorPlanImage || null)}
                className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-alt"
              >
                <Expand className="h-4 w-4" />
                Ver plano
              </button>
            )}
          </article>
        ))}
      </div>

      {selectedPlan && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPlan(null)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="absolute -top-10 right-0 rounded-md bg-white/20 px-3 py-1 text-sm font-semibold text-white hover:bg-white/30"
            >
              Cerrar
            </button>
            <img src={selectedPlan} alt="Plano de tipología" className="max-h-[80vh] w-full rounded-lg object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
