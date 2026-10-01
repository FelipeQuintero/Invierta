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

// ============================================================================
// ZONA DE CLIENTES — portales y pagos
// Para cambiar un enlace, edítalo SOLO en CLIENT_LINKS: se actualiza
// automáticamente en la barra superior, el header móvil, el menú móvil,
// el hero y la sección "Zona de clientes" del inicio.
// ============================================================================

export const CLIENT_LINKS = {
  portalPropietarios: 'https://invierta.portal.rentio.cloud/',
  portalArrendatarios: 'https://invierta.portal.rentio.cloud/',
  pagosArrendamientos: 'https://pagos.rentio.cloud',
  pagosPse: 'https://portalpagos.davivienda.com/#/comercio/7133/INVIERTA%20INMOBILIARIA%20S%20A%20S',
} as const;

export type ClientAccessIcon = 'owner' | 'tenant' | 'payment';

export interface ClientAccess {
  id: 'propietarios' | 'arrendatarios' | 'pagos';
  href: string;
  /** Nombre completo (tarjetas, barra superior, menú) */
  label: string;
  /** Nombre corto para espacios reducidos (móvil) */
  shortLabel: string;
  description: string;
  cta: string;
  icon: ClientAccessIcon;
  /** Acción principal: se muestra resaltada */
  featured: boolean;
}

export const CLIENT_ACCESS: ClientAccess[] = [
  {
    id: 'propietarios',
    href: CLIENT_LINKS.portalPropietarios,
    label: 'Portal Propietarios',
    shortLabel: 'Propietarios',
    description: 'Consulta la información y los movimientos de tu inmueble en administración.',
    cta: 'Ingresar al portal',
    icon: 'owner',
    featured: false,
  },
  {
    id: 'arrendatarios',
    href: CLIENT_LINKS.portalArrendatarios,
    label: 'Portal Arrendatarios',
    shortLabel: 'Arrendatarios',
    description: 'Consulta la información de tu contrato de arrendamiento.',
    cta: 'Ingresar al portal',
    icon: 'tenant',
    featured: false,
  },
  {
    id: 'pagos',
    href: CLIENT_LINKS.pagosArrendamientos,
    label: 'Pagos Arrendamientos',
    shortLabel: 'Paga tu arriendo acá',
    description: 'Paga tu canon de arrendamiento en línea, de forma rápida y segura.',
    cta: 'Paga tu arriendo acá',
    icon: 'payment',
    featured: true,
  },
];

export const PSE_PAYMENT = {
  href: CLIENT_LINKS.pagosPse,
  label: 'Pagos PSE',
  description: 'Estudios de arrendamiento y otros pagos a Invierta Inmobiliaria, directo desde tu cuenta bancaria.',
  cta: 'Pagar con PSE',
  provider: 'Portal de pagos Davivienda · Invierta Inmobiliaria S.A.S.',
  // Logo oficial de PSE: guardar el archivo en public/images/pse-logo.png
  // Mientras no exista, se muestra el texto "PSE" como respaldo.
  logo: '/images/pse-logo.png',
} as const;

// Enlaces secundarios de la barra superior y el menú móvil
export const QUICK_LINKS: TopBarLink[] = [
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
