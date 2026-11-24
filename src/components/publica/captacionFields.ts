// Fuente única del formulario público de captación en /publica.
// `name` es el nombre del campo en el formulario /captaciones del portal interno (Hub de solicitudes),
// así el payload podrá enviarse tal cual cuando se conecte la API.
// Solo están los campos que diligencia el propietario; los internos del portal (asesor, agente, fuente,
// comisión, exclusividad, documentos, fotos, etc.) se omiten a propósito.

export type FieldType = 'text' | 'email' | 'tel' | 'select' | 'radio' | 'number' | 'money' | 'textarea';
export type Validator = 'email' | 'phoneCO' | 'documento' | 'number' | 'integer';

export interface Option {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Option[];
  validate?: Validator;
  placeholder?: string;
  hint?: string;
  /** Ocupa toda la fila en pantallas medianas y grandes. */
  wide?: boolean;
  /** Solo se muestra (y se exige) cuando otro campo tiene uno de estos valores. */
  showWhen?: { field: string; in: string[] };
  /** Cambia la etiqueta según el valor de otro campo (el portal hace esto con el área del lote). */
  labelWhen?: { field: string; equals: string; label: string };
  maxLength?: number;
}

export interface SectionDef {
  id: string;
  title: string;
  description: string;
  fields: FieldDef[];
}

const plain = (items: string[]): Option[] => items.map((v) => ({ value: v, label: v }));

// Listas copiadas del portal (src/lib/modulos/comun.ts y captacion.ts).
const TIPOS_DOC_PROPIETARIO = ['CEDULA DE CIUDADANIA', 'NIT', 'CEDULA EXTRANJERIA', 'RUT', 'TARJETA DE IDENTIDAD', 'PASAPORTE'];
const CIUDADES = ['Pereira', 'Dosquebradas', 'Bogotá', 'Medellín', 'Cali', 'Otra'];
const TIPOS_INMUEBLE = ['Apartamento', 'Casa', 'Local', 'Oficina', 'Lote', 'Bodega', 'Finca / rural'];
const ESTRATOS = ['1', '2', '3', '4', '5', '6', 'Comercial', 'No aplica'];
const OPERACIONES: Option[] = [
  { value: 'venta', label: 'Venta' },
  { value: 'arriendo', label: 'Arriendo' },
  { value: 'ambas', label: 'Venta y arriendo' },
];

export const CAPTACION_SECTIONS: SectionDef[] = [
  {
    id: 'tus-datos',
    title: 'Tus datos',
    description: 'Para que un asesor pueda contactarte.',
    fields: [
      {
        name: 'propNombre',
        label: 'Nombre completo (nombres y apellidos)',
        type: 'text',
        required: true,
        maxLength: 120,
        wide: true,
      },
      { name: 'propCorreo', label: 'Correo electrónico', type: 'email', required: true, validate: 'email', maxLength: 120 },
      {
        name: 'propContacto',
        label: 'No. de contacto',
        type: 'tel',
        required: true,
        validate: 'phoneCO',
        placeholder: 'Ej: 311 555 6333',
        hint: 'Tu celular o WhatsApp.',
      },
      { name: 'propDocTipo', label: 'Tipo de documento', type: 'select', required: true, options: plain(TIPOS_DOC_PROPIETARIO) },
      { name: 'propDocNum', label: 'Número del documento', type: 'text', required: true, validate: 'documento', maxLength: 20 },
    ],
  },
  {
    id: 'tu-inmueble',
    title: 'Tu inmueble',
    description: 'Cuéntanos qué quieres hacer y cómo es tu propiedad.',
    fields: [
      {
        name: 'operacion',
        label: '¿Qué quieres hacer con tu inmueble?',
        type: 'radio',
        required: true,
        options: OPERACIONES,
        wide: true,
      },
      { name: 'tipo', label: 'Tipo de inmueble', type: 'select', required: true, options: plain(TIPOS_INMUEBLE) },
      { name: 'ciudad', label: 'Ciudad', type: 'select', required: true, options: plain(CIUDADES) },
      { name: 'barrio', label: 'Barrio o sector', type: 'text', required: true, maxLength: 80 },
      {
        name: 'direccion',
        label: 'Dirección completa',
        type: 'text',
        required: true,
        placeholder: 'Incluye conjunto, torre y número',
        maxLength: 160,
      },
      { name: 'estrato', label: 'Estrato', type: 'select', required: true, options: plain(ESTRATOS) },
      {
        name: 'areaConstruida',
        label: 'Área construida (m²)',
        type: 'number',
        required: true,
        validate: 'number',
        labelWhen: { field: 'tipo', equals: 'Lote', label: 'Área del lote (m²)' },
      },
      { name: 'areaPrivada', label: 'Área privada (m²)', type: 'number', validate: 'number' },
      { name: 'habitaciones', label: 'Habitaciones', type: 'number', validate: 'integer' },
      { name: 'banos', label: 'Baños', type: 'number', validate: 'integer' },
      { name: 'parqueaderos', label: 'Parqueaderos', type: 'number', validate: 'integer' },
      {
        name: 'precioVenta',
        label: 'Precio de venta',
        type: 'money',
        required: true,
        showWhen: { field: 'operacion', in: ['venta', 'ambas'] },
      },
      {
        name: 'canon',
        label: 'Canon mensual',
        type: 'money',
        required: true,
        showWhen: { field: 'operacion', in: ['arriendo', 'ambas'] },
      },
      {
        name: 'obs',
        label: 'Observaciones',
        type: 'textarea',
        wide: true,
        maxLength: 1000,
        placeholder: 'Arreglos pendientes, si acepta mascotas, condiciones, algo más que debamos saber…',
      },
    ],
  },
];

export const ALL_FIELDS: FieldDef[] = CAPTACION_SECTIONS.flatMap((s) => s.fields);

export type FormValues = Record<string, string>;
export type FormErrors = Record<string, string>;

export const emptyValues = (): FormValues => Object.fromEntries(ALL_FIELDS.map((f) => [f.name, '']));

export const isVisible = (f: FieldDef, values: FormValues): boolean =>
  !f.showWhen || f.showWhen.in.includes(values[f.showWhen.field] ?? '');

export const labelOf = (f: FieldDef, values: FormValues): string =>
  f.labelWhen && values[f.labelWhen.field] === f.labelWhen.equals ? f.labelWhen.label : f.label;

/** Deja solo los dígitos y quita el indicativo +57 / 57 de un número colombiano. */
export const nationalPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('57') ? digits.slice(2) : digits;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateFormat(f: FieldDef, value: string, values: FormValues): string {
  switch (f.validate) {
    case 'email':
      return EMAIL_RE.test(value) ? '' : 'Escribe un correo válido, por ejemplo nombre@correo.com.';
    case 'phoneCO': {
      const d = nationalPhone(value);
      // Celular: 10 dígitos que empiezan por 3. Fijo: 10 dígitos que empiezan por 60 + indicativo de ciudad.
      return /^3\d{9}$/.test(d) || /^60\d{8}$/.test(d)
        ? ''
        : 'Escribe un número colombiano válido: celular de 10 dígitos que empieza por 3 (ej. 311 555 6333).';
    }
    case 'documento': {
      const compact = value.replace(/[\s.\-]/g, '');
      if (values.propDocTipo === 'PASAPORTE') {
        return /^[A-Za-z0-9]{5,20}$/.test(compact) ? '' : 'El pasaporte debe tener entre 5 y 20 letras o números.';
      }
      return /^\d{5,15}$/.test(compact) ? '' : 'Escribe solo números, entre 5 y 15 dígitos.';
    }
    case 'number': {
      const n = Number(value.replace(',', '.'));
      return /^\d+([.,]\d{1,2})?$/.test(value) && n > 0 && n <= 1_000_000 ? '' : 'Escribe un número mayor que 0 (puedes usar decimales).';
    }
    case 'integer':
      return /^\d{1,2}$/.test(value) ? '' : 'Escribe un número entero entre 0 y 99.';
    default:
      return '';
  }
}

export function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  for (const f of ALL_FIELDS) {
    if (!isVisible(f, values)) continue;
    const value = (values[f.name] ?? '').trim();
    if (!value) {
      if (f.required) {
        errors[f.name] = f.type === 'select' || f.type === 'radio' ? 'Selecciona una opción.' : 'Este campo es obligatorio.';
      }
      continue;
    }
    const formatError = validateFormat(f, value, values);
    if (formatError) errors[f.name] = formatError;
  }
  return errors;
}

/** Payload con los nombres de campo del portal. Los campos ocultos van vacíos, como en `vacioCaptacion()` del portal. */
export function buildPayload(values: FormValues): FormValues {
  const payload: FormValues = {};
  for (const f of ALL_FIELDS) {
    const raw = (values[f.name] ?? '').trim();
    if (!isVisible(f, values) || !raw) payload[f.name] = '';
    else if (f.validate === 'phoneCO') payload[f.name] = nationalPhone(raw);
    else if (f.validate === 'documento') payload[f.name] = raw.replace(/[\s.\-]/g, '');
    else if (f.validate === 'number') payload[f.name] = raw.replace(',', '.');
    else payload[f.name] = raw;
  }
  return payload;
}

export const formatMoney = (digits: string): string =>
  digits ? '$ ' + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
