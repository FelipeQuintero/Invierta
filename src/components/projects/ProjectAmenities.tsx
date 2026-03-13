import {
  Car,
  Dumbbell,
  Flame,
  HelpCircle,
  Shield,
  TreePine,
  Users,
  Waves,
  type LucideIcon,
} from 'lucide-react';

interface ProjectAmenitiesProps {
  amenities: string[];
}

function iconForAmenity(amenity: string): LucideIcon {
  const key = amenity.toLowerCase();
  if (key.includes('piscina')) return Waves;
  if (key.includes('gimnasio')) return Dumbbell;
  if (key.includes('parqueadero') || key.includes('parking')) return Car;
  if (key.includes('seguridad') || key.includes('vigilancia')) return Shield;
  if (key.includes('zona verde') || key.includes('zonas verdes') || key.includes('parque')) return TreePine;
  if (key.includes('bbq')) return Flame;
  if (key.includes('salon social') || key.includes('salón social')) return Users;
  return HelpCircle;
}

export default function ProjectAmenities({ amenities }: ProjectAmenitiesProps) {
  if (!amenities?.length) {
    return <p className="text-sm text-text-secondary">Este proyecto no tiene amenidades registradas.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {amenities.map((amenity) => {
        const Icon = iconForAmenity(amenity);
        return (
          <div key={amenity} className="flex items-center gap-2.5 rounded-lg border border-border bg-white p-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-text-primary">{amenity}</span>
          </div>
        );
      })}
    </div>
  );
}
