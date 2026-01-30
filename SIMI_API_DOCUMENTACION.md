# Documentación API SIMI - Portal Invierta

> **Estado:** Pendiente API Key
> **Fecha:** 2026-01-30
> **Código Inmobiliaria:** 188

---

## Datos de la Cuenta SIMI

| Campo | Valor |
|-------|-------|
| **ID Inmobiliaria** | `188` |
| **ID Usuario** | `197746` |
| **NIT/Usuario** | `901085031` |
| **Email** | `gerencia@invierta.com.co` |
| **Nombre** | Clara Tatiana Galviz Ramos |

### URLs de APIs SIMI

```
API Pública (para portales web): https://www.simi-api.com
API CRM interno:                 https://api.siminmobiliarias.com
API CRM alternativa:             https://apiblc.siminmobiliarias.com
API ERP:                         http://3.17.98.121:8080
```

---

## API Pública para Portales Web

**Base URL:** `http://simi-api.com/ApiSimiweb/response/`

**Documentación oficial:** https://simi-api.com/ApiSimiDoc/

### Autenticación

> **PENDIENTE:** Solicitar API Key/Token a SIMI

La API requiere autenticación. El formato exacto del header se debe confirmar con SIMI, pero probablemente sea uno de estos:

```
Authorization: Bearer {API_KEY}
Authorization: {API_KEY}
X-Api-Key: {API_KEY}
inmobiliaria: {API_KEY}
```

---

## Endpoints Disponibles

### 1. Catálogos de Ubicación

#### Departamentos
```
GET /v2/departamento
```
Obtiene los departamentos donde la inmobiliaria tiene inmuebles disponibles.

**Respuesta esperada:**
```json
{
  "code": 0,
  "response": [
    { "id": 1, "nombre": "Risaralda" },
    { "id": 2, "nombre": "Quindío" }
  ]
}
```

#### Ciudades
```
GET /v2/ciudad/idDepartamento/:idDepartamento
```
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| idDepartamento | Entero | ID del departamento (opcional, default: 0) |

#### Zonas
```
GET /zonas/idCiudad/:idCiudad
```
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| idCiudad | Entero | ID de la ciudad (obligatorio) |

#### Barrios
```
GET /v2/barrios/idCiudad/:idCiudad/idZona/:idZona
```
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| idCiudad | Entero | ID de la ciudad (obligatorio) |
| idZona | Entero | ID de la zona (opcional, default: 0) |

---

### 2. Catálogos de Inmuebles

#### Tipos de Inmueble
```
GET /v2/tipoInmuebles/unique/1
```
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| unique | Entero | 1 = solo tipos que maneja la inmobiliaria |

**Tipos disponibles en Invierta:**
- Apartamento (1)
- Apartaestudio (11)
- Bodega (6)
- Casa (2)
- Casa campestre (19)
- Casa comercial (20)
- Casa lote (21)
- Casa residencial (22)
- Consultorios (3)
- Edificios (10)
- Fincas (8)
- Habitacion (18)
- Hotel (12)
- Locales (5)
- Lotes (7)
- Oficinas (4)
- Parqueaderos (9)
- Proyecto (13)

#### Gestión Comercial
```
GET /gestion
```
Retorna las gestiones: Arriendo (1), Arriendo/Venta (2), Venta (5)

#### Sedes
```
GET /sedes
```
Obtiene las sedes de la inmobiliaria.

#### Usuarios/Asesores
```
GET /usuarios/limite/:limite/cantidad/:cantidad/asesor/:idasesor
```
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| limite | Entero | Desde donde empezar (default: 0) |
| cantidad | Entero | Total a mostrar (default: 10) |
| asesor | Entero | ID específico de asesor (default: 0) |

---

### 3. Inmuebles

#### Filtro de Inmuebles (Principal)
```
GET /v2.1.1/filtroInmueble/
```

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| limite | Entero | 1 | Página actual (paginación) |
| cantidad | Entero | 1 | Inmuebles por página |
| departamento | Entero | 0 | Filtro por departamento |
| ciudad | Entero | 0 | Filtro por ciudad |
| zona | Entero | 0 | Filtro por zona |
| barrio | Entero | 0 | Filtro por barrio |
| tipoInm | Entero | 0 | Tipo de inmueble |
| tipOper | Entero | 0 | Gestión (1=Arriendo, 5=Venta) |
| areamin | Entero | 0 | Área mínima m² |
| areamax | Entero | 0 | Área máxima m² |
| valmin | Entero | 0 | Precio mínimo |
| valmax | Entero | 0 | Precio máximo |
| order | Texto | "asc" | Ordenamiento: asc/desc |
| campo | Texto | "fecha" | Ordenar por: precio, fecha, area, inmuebles, gestión |
| alcobas | Entero | 0 | Número de alcobas (5 = 5 o más) |
| banios | Entero | 0 | Número de baños |
| garajes | Entero | 0 | Número de garajes |
| sede | Entero | 0 | Filtrar por sede |
| usuario | Entero | 0 | Filtrar por asesor |

**Ejemplo de uso:**
```javascript
// Buscar apartamentos en arriendo, máximo $2.000.000
const url = `${BASE_URL}/v2.1.1/filtroInmueble/?limite=1&cantidad=20&tipoInm=1&tipOper=1&valmax=2000000`;
```

#### Inmuebles Destacados
```
GET /v21/inmueblesDestacados/
```
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| limite | Entero | 1 | Desde donde empezar |
| cantidad | Entero | 10 | Cantidad a mostrar |
| sede | Entero | - | Filtrar por sede (opcional) |

#### Detalle de Inmueble
```
GET /v2/inmueble/codInmueble/:id
```
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | Entero | Código del inmueble en SIMI |

**Respuesta incluye:**
- Datos básicos del inmueble
- Fotos
- Características internas y externas
- Portales donde está publicado

#### Estado de Inmuebles (Cambios recientes)
```
GET http://api.simicrm.app/crm/inmuebles?estado=:estado&gestion=:gestion
```
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| estado | Entero | 1=Nuevos, 2=Retirados, 3=Por actualizar |
| gestion | Entero | Para estado 2: 1=Arriendo, 2=Venta |

Retorna inmuebles con cambios en los últimos 5 días.

---

## Estructura de Datos del Inmueble

Basado en los datos observados en el CRM:

```typescript
interface Inmueble {
  // Identificación
  codigo: string;              // "188-4006" (formato: {idinmmo}-{consecutivo})
  codigoSimi: string;          // Código interno SIMI

  // Clasificación
  tipoInmueble: string;        // "Oficina", "Casa", "Apartamento", etc.
  gestion: string;             // "Arriendo" | "Venta" | "Arriendo/Venta"
  estado: string;              // "Disponible", "Reservado", "Vendido", "Arrendado"
  destinacion: string;         // "Comercio", "Vivienda", "Industrial"

  // Precios
  canon: number;               // Precio arriendo mensual (COP)
  venta: number;               // Precio de venta (COP)
  administracion: number;      // Valor administración mensual
  valorIva: number;            // IVA si aplica

  // Ubicación
  departamento: string;
  ciudad: string;              // "Pereira"
  zona: string;
  localidad: string;
  barrio: string;              // "Circunvalar"
  direccion: string;           // "CR 13 13 40 CC Uniplex Pereira..."

  // Características físicas
  estrato: number;             // 1-6
  areaLote: number;            // m²
  areaConstruida: number;      // m²
  habitaciones: number;
  banos: number;
  parqueaderos: number;

  // Características adicionales
  caracteristicasInternas: string[];  // ["Cocina integral", "Closets", ...]
  caracteristicasExternas: string[];  // ["Piscina", "Gimnasio", ...]

  // Metadata
  fechaConsignacion: string;   // "2026-01-29"
  calidad: number;             // Porcentaje de completitud 0-100
  tieneValla: boolean;
  esInversion: boolean;

  // Multimedia
  fotos: string[];             // URLs de imágenes
  video360?: string;           // URL video 360

  // Portales externos
  portales: {
    metrocuadrado?: string;    // "17914-M6340556"
    ciencuadras?: string;      // "350044-1884006"
    proppit?: string;          // "Publicado"
    zonaHabitat?: string;      // "ZH57004011"
  };

  // Asesores
  promotor: {
    nombre: string;
    telefono: string;
    email: string;
    foto?: string;
  };
  captador?: {
    nombre: string;
    telefono: string;
    email: string;
  };

  // Sede
  sucursal: string;
}
```

---

## Implementación en el Portal

### Archivo: `src/lib/simi.ts`

```typescript
// Cliente API SIMI para el portal Invierta

const SIMI_API_URL = import.meta.env.SIMI_API_URL || 'http://simi-api.com/ApiSimiweb/response';
const SIMI_API_KEY = import.meta.env.SIMI_API_KEY; // PENDIENTE

interface SimiResponse<T> {
  code: number;
  response: T;
}

async function simiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${SIMI_API_URL}${endpoint}`, {
    headers: {
      // TODO: Confirmar header correcto con SIMI
      'Authorization': SIMI_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`SIMI API Error: ${response.status}`);
  }

  const data: SimiResponse<T> = await response.json();
  return data.response;
}

// Obtener departamentos
export async function getDepartamentos() {
  return simiRequest('/v2/departamento');
}

// Obtener ciudades por departamento
export async function getCiudades(idDepartamento: number = 0) {
  return simiRequest(`/v2/ciudad/idDepartamento/${idDepartamento}`);
}

// Obtener tipos de inmueble
export async function getTiposInmueble() {
  return simiRequest('/v2/tipoInmuebles/unique/1');
}

// Filtrar inmuebles
export async function filtrarInmuebles(filtros: {
  limite?: number;
  cantidad?: number;
  tipoInm?: number;
  tipOper?: number;
  ciudad?: number;
  valmin?: number;
  valmax?: number;
  alcobas?: number;
}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== 0) {
      params.append(key, String(value));
    }
  });
  return simiRequest(`/v2.1.1/filtroInmueble/?${params.toString()}`);
}

// Obtener inmuebles destacados
export async function getInmueblesDestacados(cantidad: number = 10) {
  return simiRequest(`/v21/inmueblesDestacados/?limite=1&cantidad=${cantidad}`);
}

// Obtener detalle de inmueble
export async function getInmueble(codigo: string) {
  return simiRequest(`/v2/inmueble/codInmueble/${codigo}`);
}
```

### Variables de Entorno

Agregar a `.env`:

```env
# SIMI API
SIMI_API_URL=http://simi-api.com/ApiSimiweb/response
SIMI_API_KEY=PENDIENTE_SOLICITAR_A_SIMI
SIMI_INMOBILIARIA_ID=188
```

---

## Notas Importantes

1. **La API es de solo lectura** - No permite crear/editar inmuebles desde el portal
2. **Paginación** - Usar `limite` y `cantidad` para paginar resultados
3. **Fotos** - Vienen como URLs completas en el detalle del inmueble
4. **Precios** - Vienen en COP sin formato, formatear en frontend
5. **Códigos** - El código del inmueble tiene formato `{idinmmo}-{consecutivo}` (ej: 188-4006)

---

## Contacto SIMI

Para solicitar el API Key, contactar:
- **Mesa de Ayuda:** Dentro del CRM → Simipedia → Crear Tickets
- **Web:** https://simiinmobiliarias.com
- **Empresa:** Tecnología de Administración Empresarial LTDA

---

## Checklist de Integración

- [ ] Solicitar API Key a SIMI
- [ ] Confirmar header de autenticación correcto
- [ ] Probar endpoints con API Key
- [ ] Implementar cliente `src/lib/simi.ts`
- [ ] Crear API routes proxy en `src/pages/api/`
- [ ] Reemplazar mock data con datos reales
- [ ] Configurar variables de entorno en producción
