import { useMemo, useState } from 'react';
import ProjectCard from './ProjectCard';
import type { ConstructionStage, Project } from './types';

interface ProjectFiltersProps {
  projects: Project[];
}

const STAGES: Array<{ value: 'all' | ConstructionStage; label: string }> = [
  { value: 'all', label: 'Todas las etapas' },
  { value: 'preventa', label: 'Preventa' },
  { value: 'en_construccion', label: 'En Construcción' },
  { value: 'entrega_inmediata', label: 'Entrega Inmediata' },
];

export default function ProjectFilters({ projects }: ProjectFiltersProps) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('all');
  const [stage, setStage] = useState<'all' | ConstructionStage>('all');

  const cities = useMemo(
    () => ['all', ...Array.from(new Set(projects.map((item) => item.city))).sort((a, b) => a.localeCompare(b))],
    [projects],
  );

  const filtered = useMemo(() => {
    return projects.filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase().trim());
      const matchesCity = city === 'all' || item.city === city;
      const matchesStage = stage === 'all' || item.constructionStage === stage;
      return matchesQuery && matchesCity && matchesStage;
    });
  }, [projects, query, city, stage]);

  const clearFilters = () => {
    setQuery('');
    setCity('all');
    setStage('all');
  };

  return (
    <div>
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label htmlFor="project-search" className="mb-1 block text-sm font-medium text-text-primary">Buscar proyecto</label>
            <input
              id="project-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre del proyecto"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label htmlFor="project-city" className="mb-1 block text-sm font-medium text-text-primary">Ciudad</label>
            <select
              id="project-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {cities.map((cityOption) => (
                <option key={cityOption} value={cityOption}>
                  {cityOption === 'all' ? 'Todas las ciudades' : cityOption}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="project-stage" className="mb-1 block text-sm font-medium text-text-primary">Etapa</label>
            <select
              id="project-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as 'all' | ConstructionStage)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {STAGES.map((stageOption) => (
                <option key={stageOption.value} value={stageOption.value}>{stageOption.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Mostrando <span className="font-semibold text-text-primary">{filtered.length}</span> proyecto{filtered.length !== 1 ? 's' : ''}
          </p>
          <button type="button" onClick={clearFilters} className="text-sm font-medium text-primary hover:text-primary/80">
            Limpiar filtros
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-surface p-8 text-center">
          <h3 className="text-lg font-semibold text-text-primary">No encontramos proyectos con esos filtros</h3>
          <p className="mt-2 text-text-secondary">Prueba con otra ciudad, etapa o término de búsqueda.</p>
        </div>
      )}
    </div>
  );
}
