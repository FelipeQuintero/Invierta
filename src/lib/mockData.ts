import type { Property } from './types';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento en Chapinero Alto',
    description:
      'Hermoso apartamento con vista a los cerros orientales. Amplia sala-comedor, cocina integral, tres habitaciones con closet, dos banos completos y parqueadero cubierto. Excelente ubicacion cerca a centros comerciales y transporte publico.',
    price: 450_000_000,
    priceType: 'venta',
    location: 'Chapinero, Bogota',
    city: 'Bogota',
    neighborhood: 'Chapinero Alto',
    area: 85,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    stratum: 4,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
    ],
    tags: ['destacado'],
    propertyType: 'apartamento',
    operationType: 'venta',
    coordinates: { lat: 4.6486, lng: -74.0628 },
    features: ['Cocina integral', 'Closets', 'Zona de lavanderia', 'Ascensor', 'Vigilancia 24h'],
    yearBuilt: 2019,
    adminFee: 450_000,
    agent: {
      name: 'Carlos Martinez',
      phone: '+57 310 555 1234',
      email: 'carlos@invierta.com',
    },
    createdAt: '2024-12-01',
  },
  {
    id: '2',
    title: 'Casa Campestre en Chia',
    description:
      'Espectacular casa campestre con amplios jardines, piscina privada y zonas verdes. Ideal para familias que buscan tranquilidad sin alejarse de Bogota. Cuatro habitaciones, sala de estar, estudio y garaje para dos vehiculos.',
    price: 980_000_000,
    priceType: 'venta',
    location: 'Chia, Cundinamarca',
    city: 'Bogota',
    neighborhood: 'Chia',
    area: 280,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    stratum: 5,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    tags: ['destacado', 'negociable'],
    propertyType: 'casa',
    operationType: 'venta',
    coordinates: { lat: 4.8637, lng: -74.0540 },
    features: ['Piscina', 'Jardin', 'BBQ', 'Estudio', 'Cuarto de servicio', 'Garaje doble'],
    yearBuilt: 2021,
    agent: {
      name: 'Laura Gutierrez',
      phone: '+57 315 555 5678',
      email: 'laura@invierta.com',
    },
    createdAt: '2024-11-15',
  },
  {
    id: '3',
    title: 'Apartaestudio en Cedritos',
    description:
      'Moderno apartaestudio totalmente remodelado. Ambiente integrado con cocina abierta, bano con acabados de lujo y closet empotrado. Edificio con gimnasio y salon social.',
    price: 1_800_000,
    priceType: 'arriendo',
    location: 'Cedritos, Bogota',
    city: 'Bogota',
    neighborhood: 'Cedritos',
    area: 42,
    bedrooms: 1,
    bathrooms: 1,
    parking: 0,
    stratum: 4,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
    ],
    tags: ['nuevo'],
    propertyType: 'apartamento',
    operationType: 'arriendo',
    coordinates: { lat: 4.7247, lng: -74.0461 },
    features: ['Cocina abierta', 'Gimnasio', 'Salon social', 'Vigilancia 24h'],
    yearBuilt: 2022,
    adminFee: 280_000,
    agent: {
      name: 'Carlos Martinez',
      phone: '+57 310 555 1234',
      email: 'carlos@invierta.com',
    },
    createdAt: '2024-12-10',
  },
  {
    id: '4',
    title: 'Local Comercial en la Zona T',
    description:
      'Local comercial en excelente ubicacion sobre la Zona T. Alto flujo peatonal, ideal para restaurante, tienda o showroom. Dos niveles con bano y bodega.',
    price: 12_000_000,
    priceType: 'arriendo',
    location: 'Zona T, Bogota',
    city: 'Bogota',
    neighborhood: 'Zona T',
    area: 120,
    bedrooms: 0,
    bathrooms: 2,
    parking: 0,
    stratum: 6,
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800',
    ],
    tags: ['destacado'],
    propertyType: 'local',
    operationType: 'arriendo',
    coordinates: { lat: 4.6661, lng: -74.0527 },
    features: ['Dos niveles', 'Bodega', 'Alta visibilidad', 'Zona de carga'],
    agent: {
      name: 'Laura Gutierrez',
      phone: '+57 315 555 5678',
      email: 'laura@invierta.com',
    },
    createdAt: '2024-11-20',
  },
  {
    id: '5',
    title: 'Apartamento en El Poblado',
    description:
      'Lujoso apartamento en el exclusivo sector de El Poblado. Acabados de primera, vista panoramica a la ciudad, tres habitaciones con bano privado, sala de estar y balcon amplio.',
    price: 720_000_000,
    priceType: 'venta',
    location: 'El Poblado, Medellin',
    city: 'Medellin',
    neighborhood: 'El Poblado',
    area: 140,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    stratum: 6,
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800',
    ],
    tags: ['destacado'],
    propertyType: 'apartamento',
    operationType: 'venta',
    coordinates: { lat: 6.2086, lng: -75.5675 },
    features: ['Balcon', 'Vista panoramica', 'Piscina comunal', 'Gimnasio', 'Porteria 24h'],
    yearBuilt: 2023,
    adminFee: 680_000,
    agent: {
      name: 'Andres Restrepo',
      phone: '+57 320 555 9012',
      email: 'andres@invierta.com',
    },
    createdAt: '2024-12-05',
  },
  {
    id: '6',
    title: 'Casa en Cali — Barrio Granada',
    description:
      'Casa completamente remodelada en el barrio Granada. Tres pisos, terraza con vista, cocina tipo americano, patio interior. Zona tranquila con acceso rapido a la Quinta.',
    price: 520_000_000,
    priceType: 'venta',
    location: 'Granada, Cali',
    city: 'Cali',
    neighborhood: 'Granada',
    area: 190,
    bedrooms: 4,
    bathrooms: 3,
    parking: 1,
    stratum: 5,
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
    ],
    tags: ['negociable'],
    propertyType: 'casa',
    operationType: 'venta',
    coordinates: { lat: 3.4516, lng: -76.5320 },
    features: ['Terraza', 'Patio interior', 'Cocina americana', 'Tres pisos'],
    yearBuilt: 2018,
    agent: {
      name: 'Carlos Martinez',
      phone: '+57 310 555 1234',
      email: 'carlos@invierta.com',
    },
    createdAt: '2024-11-28',
  },
  {
    id: '7',
    title: 'Oficina en Centro Empresarial — Bogota',
    description:
      'Oficina en moderno centro empresarial con excelente conectividad. Espacio abierto con divisiones modulares, sala de juntas y recepcion. Incluye parqueadero y deposito.',
    price: 5_500_000,
    priceType: 'arriendo',
    location: 'Salitre, Bogota',
    city: 'Bogota',
    neighborhood: 'Salitre',
    area: 95,
    bedrooms: 0,
    bathrooms: 2,
    parking: 1,
    stratum: 4,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    ],
    tags: [],
    propertyType: 'oficina',
    operationType: 'arriendo',
    coordinates: { lat: 4.6583, lng: -74.1075 },
    features: ['Sala de juntas', 'Recepcion', 'Deposito', 'Internet de alta velocidad'],
    agent: {
      name: 'Andres Restrepo',
      phone: '+57 320 555 9012',
      email: 'andres@invierta.com',
    },
    createdAt: '2024-12-08',
  },
  {
    id: '8',
    title: 'Apartamento para Estrenar — Usaquen',
    description:
      'Proyecto para estrenar en Usaquen. Apartamento de dos habitaciones con bano privado en la principal, zona social amplia, balcon y parqueadero. Conjunto con zonas comunes completas.',
    price: 380_000_000,
    priceType: 'venta',
    location: 'Usaquen, Bogota',
    city: 'Bogota',
    neighborhood: 'Usaquen',
    area: 68,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    stratum: 4,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
    ],
    tags: ['nuevo', 'destacado'],
    propertyType: 'apartamento',
    operationType: 'proyecto',
    coordinates: { lat: 4.7364, lng: -74.0319 },
    features: ['Para estrenar', 'Zonas comunes', 'Salon comunal', 'Parque infantil'],
    yearBuilt: 2025,
    adminFee: 350_000,
    agent: {
      name: 'Laura Gutierrez',
      phone: '+57 315 555 5678',
      email: 'laura@invierta.com',
    },
    createdAt: '2024-12-12',
  },
  {
    id: '9',
    title: 'Lote en Sopó',
    description:
      'Lote de 500m² en zona rural de Sopó con vista a las montanas. Ideal para construccion de casa campestre. Acceso por via pavimentada, servicios publicos disponibles.',
    price: 320_000_000,
    priceType: 'venta',
    location: 'Sopó, Cundinamarca',
    city: 'Bogota',
    neighborhood: 'Sopó',
    area: 500,
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    stratum: 3,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    ],
    tags: ['negociable'],
    propertyType: 'lote',
    operationType: 'venta',
    coordinates: { lat: 4.9065, lng: -73.9397 },
    features: ['Vista a montanas', 'Via pavimentada', 'Servicios publicos', 'Escritura publica'],
    agent: {
      name: 'Andres Restrepo',
      phone: '+57 320 555 9012',
      email: 'andres@invierta.com',
    },
    createdAt: '2024-11-10',
  },
  {
    id: '10',
    title: 'Apartamento Amoblado en Laureles',
    description:
      'Apartamento completamente amoblado en Laureles, ideal para ejecutivos o temporadas cortas. Dos habitaciones, cocina equipada, internet incluido.',
    price: 3_200_000,
    priceType: 'arriendo',
    location: 'Laureles, Medellin',
    city: 'Medellin',
    neighborhood: 'Laureles',
    area: 72,
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    stratum: 5,
    images: [
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800',
      'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800',
    ],
    tags: ['destacado'],
    propertyType: 'apartamento',
    operationType: 'arriendo',
    coordinates: { lat: 6.2452, lng: -75.5916 },
    features: ['Amoblado', 'Internet incluido', 'Cocina equipada', 'Lavadora'],
    adminFee: 320_000,
    agent: {
      name: 'Laura Gutierrez',
      phone: '+57 315 555 5678',
      email: 'laura@invierta.com',
    },
    createdAt: '2024-12-15',
  },
];

export function getMockProperties(filters?: {
  operation?: string;
  propertyType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  query?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}): Property[] {
  let filtered = [...mockProperties];

  if (filters?.operation) {
    filtered = filtered.filter((p) => p.operationType === filters.operation);
  }
  if (filters?.propertyType) {
    filtered = filtered.filter((p) => p.propertyType === filters.propertyType);
  }
  if (filters?.city) {
    filtered = filtered.filter((p) =>
      p.city.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }
  if (filters?.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters?.bedrooms) {
    filtered = filtered.filter((p) => p.bedrooms >= filters.bedrooms!);
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (filters?.featured) {
    filtered = filtered.filter((p) => p.tags.includes('destacado'));
  }

  const offset = filters?.offset || 0;
  const limit = filters?.limit || filtered.length;

  return filtered.slice(offset, offset + limit);
}

export function getMockPropertyById(id: string): Property | undefined {
  return mockProperties.find((p) => p.id === id);
}
