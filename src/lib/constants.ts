import type { SiteConfig, ServiceInfo, TopBarLink } from './types';

export const SITE_CONFIG: SiteConfig = {
  name: import.meta.env.SITE_NAME || 'Invierta Inmobiliaria',
  logo: '/logo.webp',
  headerLogo: '/logo-dark.webp',
  phone: '+57 300 123 4567',
  whatsapp: import.meta.env.WHATSAPP_NUMBER || '573001234567',
  email: 'contacto@inviertainmobiliaria.com',
  address: 'Bogota, Colombia',
  socialMedia: {
    facebook: 'https://facebook.com/inviertainmobiliaria',
    instagram: 'https://instagram.com/inviertainmobiliaria',
  },
  seo: {
    title: 'Invierta Inmobiliaria — Venta y Arriendo de Propiedades en Colombia',
    description:
      'Encuentra apartamentos, casas, locales y oficinas en venta y arriendo en Colombia. Asesoría inmobiliaria profesional.',
    ogImage: '/images/og-image.jpg',
  },
};

export const PROPERTY_TYPES = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'apartaestudio', label: 'Apartaestudio' },
  { value: 'casa', label: 'Casa' },
  { value: 'casa_campestre', label: 'Casa Campestre' },
  { value: 'casa_comercial', label: 'Casa Comercial' },
  { value: 'casa_lote', label: 'Casa Lote' },
  { value: 'local', label: 'Local' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'consultorio', label: 'Consultorio' },
  { value: 'bodega', label: 'Bodega' },
  { value: 'edificio', label: 'Edificio' },
  { value: 'finca', label: 'Finca' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'lote', label: 'Lote' },
  { value: 'parqueadero', label: 'Parqueadero' },
] as const;

export const OPERATION_TYPES = [
  { value: 'venta', label: 'Venta' },
  { value: 'arriendo', label: 'Arriendo' },
  { value: 'proyecto', label: 'Proyectos' },
] as const;

export const CITIES = [
  'Bogota',
  'Medellin',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
  'Santa Marta',
  'Manizales',
  'Villavicencio',
] as const;

export const BEDROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
] as const;

export const BATHROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
] as const;

export const PARKING_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3+' },
] as const;

export const STRATUM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
] as const;

export const PRICE_RANGES_VENTA = [
  { min: 0, max: 200_000_000, label: 'Hasta $200M' },
  { min: 200_000_000, max: 400_000_000, label: '$200M - $400M' },
  { min: 400_000_000, max: 700_000_000, label: '$400M - $700M' },
  { min: 700_000_000, max: 1_000_000_000, label: '$700M - $1.000M' },
  { min: 1_000_000_000, max: Infinity, label: 'Mas de $1.000M' },
] as const;

export const PRICE_RANGES_ARRIENDO = [
  { min: 0, max: 1_000_000, label: 'Hasta $1M' },
  { min: 1_000_000, max: 2_000_000, label: '$1M - $2M' },
  { min: 2_000_000, max: 3_500_000, label: '$2M - $3.5M' },
  { min: 3_500_000, max: 5_000_000, label: '$3.5M - $5M' },
  { min: 5_000_000, max: Infinity, label: 'Mas de $5M' },
] as const;

export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/publica', label: 'Publica tu Inmueble' },
  { href: '/servicios', label: 'Servicios' },
] as const;

export const TOP_BAR_LINKS: TopBarLink[] = [
  { href: '#', label: 'Portal Propietarios', icon: 'User', external: true },
  { href: '#', label: 'Portal Arrendatarios', icon: 'UserCheck', external: true },
  { href: '#', label: 'Pagos PSE', icon: 'CreditCard', external: true },
  { href: '/publica', label: 'Publica tu Inmueble', icon: 'Home', external: false },
  { href: '/servicios', label: 'Registra un Referido', icon: 'Users', external: false },
];

export const SERVICES: ServiceInfo[] = [
  {
    slug: 'agentes-inmobiliarios',
    title: 'Agentes Inmobiliarios',
    shortDescription: 'Red de agentes profesionales para acompanarte en cada paso.',
    icon: 'Users',
  },
  {
    slug: 'creditos-hipotecarios',
    title: 'Creditos Hipotecarios',
    shortDescription: 'Te conectamos con las mejores opciones de financiacion.',
    icon: 'Landmark',
  },
  {
    slug: 'prestamos-hipotecas',
    title: 'Prestamos sobre Hipotecas',
    shortDescription: 'Obtén liquidez usando tu propiedad como respaldo.',
    icon: 'HandCoins',
  },
  {
    slug: 'reduccion-creditos',
    title: 'Reduccion de Creditos Hipotecarios',
    shortDescription: 'Optimiza las condiciones de tu credito actual.',
    icon: 'TrendingDown',
  },
  {
    slug: 'avaluos',
    title: 'Avaluos',
    shortDescription: 'Conoce el valor real de tu propiedad con avaluos certificados.',
    icon: 'FileCheck',
  },
  {
    slug: 'monetizacion-exterior',
    title: 'Monetizacion para Colombianos en el Exterior',
    shortDescription: 'Invierte en Colombia desde cualquier parte del mundo.',
    icon: 'Globe',
  },
];
