import type { SiteConfig, ServiceInfo, TopBarLink } from './types';

// TODO: Reemplazar VIDEO_ID_AQUI con el ID real del video institucional de Invierta o el video de Ventas y Rentas
export const DEFAULT_VIDEO_URL = 'https://www.youtube.com/embed/VIDEO_ID_AQUI';

export const SITE_CONFIG: SiteConfig = {
  name: import.meta.env.SITE_NAME || 'Invierta Inmobiliaria',
  logo: '/logo.webp',
  headerLogo: '/logo-dark.webp',
  phone: '+57 312 248 2337',
  whatsapp: import.meta.env.WHATSAPP_NUMBER || '573122482327',
  email: 'comercial@invierta.com.co',
  address: 'Calle 14 No 16-47 Pinares, Pereira',
  socialMedia: {
    facebook: 'https://www.facebook.com/InviertaInmobiliariaEjeCafetero',
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
  { href: '/servicios', label: 'Servicios' },
  { href: '/publica', label: 'Publica tu Inmueble' },
] as const;

export const TOP_BAR_LINKS: TopBarLink[] = [
  { href: 'https://invierta.portal.rent10.online/', label: 'Portal Propietarios', icon: 'User', external: true },
  { href: 'https://invierta.portal.rent10.online/', label: 'Portal Arrendatarios', icon: 'UserCheck', external: true },
  { href: 'https://pagos.rent10.online/-/view-payment', label: 'Pagos PSE', icon: 'CreditCard', external: true },
  { href: '/referidos', label: 'Registrar referido', icon: 'Users', external: false },
  { href: '/publica', label: 'Publica tu Inmueble', icon: 'Home', external: false },
];

export const SERVICES: ServiceInfo[] = [
  {
    slug: 'creditos-hipotecarios',
    title: 'Gestión de Créditos Hipotecarios',
    shortDescription: 'Intermediación con entidades financieras a nivel nacional.',
    icon: 'Landmark',
  },
  {
    slug: 'administracion-arrendamientos',
    title: 'Colocación de contratos de administración',
    shortDescription: 'Colocación de contratos de administración con respaldo jurídico y financiero.',
    icon: 'Users',
  },
  {
    slug: 'creditos-exterior',
    title: 'Créditos para Colombianos en el Exterior',
    shortDescription: 'Compra tu inmueble en Colombia con proceso 100 % virtual.',
    icon: 'HandCoins',
  },
  {
    slug: 'monetizacion-divisas',
    title: 'Monetización de Divisas',
    shortDescription: 'Trae recursos del exterior con cumplimiento cambiario y soporte.',
    icon: 'Globe',
  },
  {
    slug: 'reduccion-creditos',
    title: 'Reducción de Créditos Hipotecarios',
    shortDescription: 'Reduce intereses, plazo y optimiza tu crédito actual.',
    icon: 'TrendingDown',
  },
  {
    slug: 'avaluos',
    title: 'Avalúos Inmobiliarios Profesionales',
    shortDescription: 'Conoce el valor real de tu propiedad con criterios técnicos.',
    icon: 'FileCheck',
  },
];
