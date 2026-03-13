import { Building2, Calendar, MapPin } from 'lucide-react';
import type { ConstructionStage, Project } from './types';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

function formatPrice(price?: number) {
  if (!price) return 'Precio a consultar';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function stageMeta(stage: ConstructionStage) {
  switch (stage) {
    case 'preventa':
      return { label: 'Preventa', className: 'bg-amber-400 text-amber-950' };
    case 'en_construccion':
      return { label: 'En Construcción', className: 'bg-blue-500 text-white' };
    case 'entrega_inmediata':
      return { label: 'Entrega Inmediata', className: 'bg-emerald-500 text-white' };
    default:
      return { label: stage, className: 'bg-gray-500 text-white' };
  }
}

function formatDeliveryDate(value?: string) {
  if (!value) return 'Fecha por confirmar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
}

export default function ProjectCard({ project, className = '' }: ProjectCardProps) {
  const cover = project.coverImage || project.images?.[0] || '/logo.webp';
  const stage = stageMeta(project.constructionStage);

  return (
    <a
      href={`/proyecto/${project.slug}`}
      className={`group block overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface)]">
        <img
          src={cover}
          alt={project.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm ${stage.className}`}>
          {stage.label}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 font-heading text-lg font-semibold text-text-primary transition-colors group-hover:text-primary">
          {project.name}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
          <MapPin className="h-4 w-4 shrink-0 text-text-muted" />
          <span className="truncate">
            {project.city}
            {project.zone ? `, ${project.zone}` : ''}
          </span>
        </p>

        <p className="mt-3 text-base font-bold text-accent">Desde {formatPrice(project.priceFrom)}</p>

        <div className="mt-3 space-y-1.5 text-sm text-text-secondary">
          {project.developer && (
            <p className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 shrink-0 text-text-muted" />
              <span className="truncate">{project.developer}</span>
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 shrink-0 text-text-muted" />
            <span>Entrega: {formatDeliveryDate(project.deliveryDate)}</span>
          </p>
        </div>
      </div>
    </a>
  );
}
