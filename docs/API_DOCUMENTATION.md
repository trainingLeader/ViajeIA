# 📚 Documentación de la API - ViajeIA

**Versión:** 1.0.0  
**Base URL:** `http://localhost:8000` (desarrollo) o tu dominio de producción

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Endpoints](#endpoints)
   - [GET /](#get-)
   - [GET /api/health](#get-apihealth)
   - [GET /api/estadisticas](#get-apiestadisticas)
   - [POST /api/planificar](#post-apiplanificar)
4. [Modelos de Datos](#modelos-de-datos)
5. [Códigos de Estado HTTP](#códigos-de-estado-http)
6. [Reglas de Validación](#reglas-de-validación)
7. [Rate Limiting](#rate-limiting)
8. [Errores y Manejo de Excepciones](#errores-y-manejo-de-excepciones)
9. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Introducción

ViajeIA API es una API REST que proporciona recomendaciones personalizadas de viajes utilizando inteligencia artificial. La API procesa preguntas sobre planificación de viajes y genera respuestas detalladas con recomendaciones de destinos, alojamientos, restaurantes y más.

### Características Principales

- ✅ Recomendaciones personalizadas de viajes
- ✅ Información del clima en tiempo real
- ✅ Fotos de destinos
- ✅ Información de monedas y zonas horarias
- ✅ Validación y sanitización de entrada
- ✅ Rate limiting para prevenir abuso
- ✅ Protección contra prompts peligrosos

---

## Autenticación

Actualmente, la API no requiere autenticación para la mayoría de los endpoints. Sin embargo, algunas funcionalidades pueden requerir autenticación en el futuro.

### Headers Requeridos

```http
Content-Type: application/json
```

---

## Endpoints

### GET /

Endpoint básico para verificar que la API está funcionando.

**Descripción:** Retorna un mensaje simple confirmando que la API está operativa.

#### Request

```http
GET /
```

#### Response Exitosa

**Status Code:** `200 OK`

```json
{
  "message": "ViajeIA API está funcionando"
}
```

---

### GET /api/health

Endpoint de monitoreo de salud de la API.

**Descripción:** Retorna el estado de la API y sus dependencias principales. Útil para sistemas de monitoreo, load balancers y health checks.

#### Request

```http
GET /api/health
```

#### Response Exitosa

**Status Code:** `200 OK`

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "api": "operational",
    "openai": "operational",
    "openweather": "operational",
    "unsplash": "operational"
  }
}
```

#### Posibles Valores de Status

- `healthy`: Todos los servicios están operativos
- `degraded`: Algunos servicios no están configurados pero la API funciona

#### Estados de Servicios

- `operational`: Servicio funcionando correctamente
- `not_configured`: Servicio no configurado (no bloquea la API)

#### Ejemplo de Response con Servicio No Configurado

```json
{
  "status": "degraded",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "message": "OpenAI API key no configurada",
  "services": {
    "api": "operational",
    "openai": "not_configured",
    "openweather": "operational",
    "unsplash": "operational"
  }
}
```

---

### GET /api/estadisticas

Endpoint para obtener estadísticas de uso de ViajeIA.

**Descripción:** Retorna estadísticas agregadas sobre el uso de la API, incluyendo número total de consultas, destinos más consultados, etc.

#### Request

```http
GET /api/estadisticas
```

#### Response Exitosa

**Status Code:** `200 OK`

```json
{
  "total_consultas": 1250,
  "destinos_populares": [
    {
      "destino": "París",
      "consultas": 145
    },
    {
      "destino": "Tokio",
      "consultas": 98
    }
  ],
  "consultas_por_dia": 42
}
```

#### Códigos de Error

| Código | Descripción |
|--------|-------------|
| `500` | Error interno del servidor al obtener estadísticas |

---

### POST /api/planificar

Endpoint principal para procesar preguntas sobre planificación de viajes.

**Descripción:** Procesa una pregunta del usuario sobre planificación de viajes y genera una respuesta detallada con recomendaciones personalizadas usando ChatGPT. Incluye información del clima, fotos del destino, y detalles sobre moneda y zona horaria.

#### Request

**URL:** `/api/planificar`  
**Method:** `POST`  
**Content-Type:** `application/json`

##### Estructura del Cuerpo de la Solicitud

```json
{
  "pregunta": "string (requerido, 10-500 caracteres)",
  "contexto": {
    "destino": "string (opcional, 2-100 caracteres)",
    "fecha": "string (opcional)",
    "presupuesto": "string (opcional)",
    "preferencia": "string (opcional, 1-200 caracteres)"
  }
}
```

##### Campos Detallados

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|------------|
| `pregunta` | string | ✅ Sí | Pregunta del usuario sobre planificación de viajes | Mínimo 10 caracteres, máximo 500 caracteres. Se aplica truncamiento automático si excede. |
| `contexto` | object | ❌ No | Información adicional del viaje | Objeto opcional con información de contexto |
| `contexto.destino` | string | ❌ No | Nombre del destino de viaje | 2-100 caracteres, solo letras y espacios |
| `contexto.fecha` | string | ❌ No | Fecha del viaje | Formato flexible (ej: "15/06/2024", "15 de junio 2024") |
| `contexto.presupuesto` | string | ❌ No | Presupuesto para el viaje | Número válido entre $10 y $1,000,000 |
| `contexto.preferencia` | string | ❌ No | Preferencias de viaje | 1-200 caracteres |

##### Ejemplo de Request

```json
{
  "pregunta": "¿Qué hacer en París del 15 al 20 de junio con un presupuesto de $2000?",
  "contexto": {
    "destino": "París",
    "fecha": "15/06/2024",
    "presupuesto": "2000",
    "preferencia": "cultura"
  }
}
```

##### Ejemplo de Request Mínimo

```json
{
  "pregunta": "Recomiéndame lugares para visitar en Barcelona"
}
```

#### Response Exitosa

**Status Code:** `200 OK`

```json
{
  "respuesta": "» ALOJAMIENTO: Recomendaciones...\n\nÞ COMIDA LOCAL: ...\n\nLUGARES IMPERDIBLES: ...\n\nä CONSEJOS LOCALES: ...\n\nø ESTIMACIÓN DE COSTOS: ...",
  "fotos": [
    "https://images.unsplash.com/photo-...",
    "https://images.unsplash.com/photo-...",
    "https://images.unsplash.com/photo-..."
  ],
  "info_destino": {
    "temperatura": 22.0,
    "condicion": "Despejado",
    "diferencia_horaria": "UTC+1",
    "moneda_local": "Euro",
    "tipo_cambio_usd": 0.92,
    "codigo_moneda": "EUR"
  },
  "respuesta_cortada": false,
  "tokens_usados": 850
}
```

##### Campos de la Response

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `respuesta` | string | Respuesta generada por ChatGPT con recomendaciones estructuradas |
| `fotos` | array[string] | URLs de fotos del destino (máximo 3) |
| `info_destino` | object | Información adicional del destino |
| `info_destino.temperatura` | float | Temperatura actual en grados Celsius |
| `info_destino.condicion` | string | Condición climática actual |
| `info_destino.diferencia_horaria` | string | Diferencia horaria respecto a UTC |
| `info_destino.moneda_local` | string | Nombre de la moneda local |
| `info_destino.tipo_cambio_usd` | float | Tipo de cambio respecto al USD |
| `info_destino.codigo_moneda` | string | Código ISO de la moneda |
| `respuesta_cortada` | boolean | `true` si la respuesta se cortó por límite de tokens |
| `tokens_usados` | integer | Número de tokens usados para generar la respuesta |

#### Códigos de Error

| Código | Descripción | Detalles |
|--------|-------------|----------|
| `400` | Bad Request | Solicitud inválida |
| `400` | Pregunta muy corta | La pregunta tiene menos de 10 caracteres |
| `400` | Pregunta muy larga | La pregunta excede 500 caracteres (aunque se aplica truncamiento automático) |
| `400` | Prompt peligroso | La pregunta contiene instrucciones peligrosas o está fuera de contexto |
| `400` | No es sobre viajes | La pregunta no está relacionada con planificación de viajes |
| `429` | Too Many Requests | Se alcanzó el límite de rate limiting |
| `500` | Internal Server Error | Error interno del servidor al procesar la solicitud |

##### Ejemplos de Errores

**Error 400 - Pregunta muy corta:**
```json
{
  "detail": "La pregunta debe tener al menos 10 caracteres"
}
```

**Error 400 - Pregunta muy larga:**
```json
{
  "detail": "La pregunta no puede exceder 500 caracteres"
}
```

**Error 400 - No es sobre viajes:**
```json
{
  "detail": "Por favor, haz una pregunta relacionada con viajes y planificación de viajes. Puedo ayudarte con destinos, hoteles, vuelos, restaurantes, atracciones turísticas y más."
}
```

**Error 400 - Prompt peligroso:**
```json
{
  "detail": "Lo siento, tu pregunta contiene instrucciones que no puedo procesar. Por favor, haz una pregunta relacionada con planificación de viajes, destinos, recomendaciones turísticas, o información sobre viajes."
}
```

**Error 429 - Rate Limiting:**
```json
{
  "detail": "Rate limit exceeded: 5 requests per minute"
}
```

**Error 500 - Error Interno:**
```json
{
  "detail": "Error al procesar tu solicitud. Por favor intenta más tarde."
}
```

---

## Modelos de Datos

### PreguntaRequest

```typescript
{
  pregunta: string;          // Requerido, 10-500 caracteres
  contexto?: {
    destino?: string;        // Opcional, 2-100 caracteres
    fecha?: string;          // Opcional
    presupuesto?: string;    // Opcional
    preferencia?: string;    // Opcional, 1-200 caracteres
  };
}
```

### RespuestaResponse

```typescript
{
  respuesta: string;
  fotos?: string[];
  info_destino?: {
    temperatura?: number;
    condicion?: string;
    diferencia_horaria?: string;
    moneda_local?: string;
    tipo_cambio_usd?: number;
    codigo_moneda?: string;
  };
  respuesta_cortada?: boolean;
  tokens_usados?: number;
}
```

---

## Códigos de Estado HTTP

| Código | Descripción | Cuándo Ocurre |
|--------|-------------|---------------|
| `200` | OK | Solicitud exitosa |
| `400` | Bad Request | Solicitud inválida (validación fallida) |
| `429` | Too Many Requests | Rate limiting alcanzado |
| `500` | Internal Server Error | Error interno del servidor |

---

## Reglas de Validación

### Campo `pregunta`

| Regla | Valor | Comportamiento |
|-------|-------|----------------|
| **Longitud mínima** | 10 caracteres | Si tiene menos de 10 caracteres, retorna error 400 |
| **Longitud máxima** | 500 caracteres | Si excede 500 caracteres, se aplica **truncamiento automático** |
| **Contenido** | Debe contener texto válido | No puede ser solo espacios o caracteres especiales |
| **Contexto** | Debe ser sobre viajes | Debe contener palabras relacionadas con viajes |
| **Seguridad** | Sin palabras peligrosas | No puede contener instrucciones de jailbreak o comandos |

#### Truncamiento Automático

Si la pregunta excede 500 caracteres:
1. **Se trunca automáticamente** a 500 caracteres
2. **No se retorna error** (a diferencia de la validación mínima)
3. Se procesa con los primeros 500 caracteres
4. El usuario no recibe advertencia (truncamiento silencioso)

**Ejemplo:**

```
Input: "¿Qué hacer en París?" + [490 caracteres adicionales] = 510 caracteres
Output: "¿Qué hacer en París?" + [475 caracteres] = 500 caracteres (truncado)
```

### Campo `contexto.destino`

| Regla | Valor |
|-------|-------|
| Longitud mínima | 2 caracteres |
| Longitud máxima | 100 caracteres |
| Formato | Solo letras, espacios y algunos caracteres especiales |

### Campo `contexto.presupuesto`

| Regla | Valor |
|-------|-------|
| Formato | Número válido |
| Rango | $10 - $1,000,000 |
| Formato aceptado | Puede incluir "$" y comas |

---

## Rate Limiting

La API implementa rate limiting para prevenir abuso:

### Límites

- **POST /api/planificar**: 5 solicitudes por minuto por usuario
- **GET /api/estadisticas**: Límites específicos según configuración

### Headers de Rate Limiting

Cuando se alcanza el límite, la respuesta incluye headers informativos:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642248000
```

### Respuesta al Alcanzar el Límite

**Status Code:** `429 Too Many Requests`

```json
{
  "detail": "Rate limit exceeded: 5 requests per minute"
}
```

---

## Errores y Manejo de Excepciones

### Formato de Error Estándar

Todos los errores siguen este formato:

```json
{
  "detail": "Mensaje de error descriptivo"
}
```

### Categorías de Errores

1. **Errores de Validación (400)**
   - Campos faltantes
   - Formato inválido
   - Valores fuera de rango
   - Validación de contenido

2. **Errores de Rate Limiting (429)**
   - Demasiadas solicitudes
   - Límite temporal alcanzado

3. **Errores del Servidor (500)**
   - Errores internos
   - Servicios externos no disponibles
   - Errores de procesamiento

### Manejo de Errores Recomendado

```javascript
try {
  const response = await fetch('/api/planificar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const error = await response.json();
    switch (response.status) {
      case 400:
        console.error('Error de validación:', error.detail);
        break;
      case 429:
        console.error('Rate limit alcanzado:', error.detail);
        break;
      case 500:
        console.error('Error del servidor:', error.detail);
        break;
    }
  } else {
    const data = await response.json();
    // Procesar respuesta exitosa
  }
} catch (error) {
  console.error('Error de red:', error);
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Pregunta Simple

**Request:**
```bash
curl -X POST "http://localhost:8000/api/planificar" \
  -H "Content-Type: application/json" \
  -d '{
    "pregunta": "¿Qué lugares debo visitar en Tokio?"
  }'
```

**Response:**
```json
{
  "respuesta": "» ALOJAMIENTO: ...",
  "fotos": ["..."],
  "info_destino": {...},
  "respuesta_cortada": false,
  "tokens_usados": 750
}
```

### Ejemplo 2: Pregunta con Contexto Completo

**Request:**
```bash
curl -X POST "http://localhost:8000/api/planificar" \
  -H "Content-Type: application/json" \
  -d '{
    "pregunta": "Necesito recomendaciones para mi viaje",
    "contexto": {
      "destino": "Barcelona",
      "fecha": "15/07/2024",
      "presupuesto": "1500",
      "preferencia": "cultura y gastronomía"
    }
  }'
```

### Ejemplo 3: Health Check

**Request:**
```bash
curl -X GET "http://localhost:8000/api/health"
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "api": "operational",
    "openai": "operational",
    "openweather": "operational",
    "unsplash": "operational"
  }
}
```

### Ejemplo 4: Manejo de Error de Validación

**Request:**
```bash
curl -X POST "http://localhost:8000/api/planificar" \
  -H "Content-Type: application/json" \
  -d '{
    "pregunta": "Hola"
  }'
```

**Response:**
```json
{
  "detail": "La pregunta debe tener al menos 10 caracteres"
}
```

**Status Code:** `400 Bad Request`

### Ejemplo 5: Pregunta con Truncamiento Automático

**Request:**
```bash
curl -X POST "http://localhost:8000/api/planificar" \
  -H "Content-Type: application/json" \
  -d '{
    "pregunta": "¿Qué hacer en París?" + [490 caracteres adicionales] = 510 caracteres
  }'
```

**Procesamiento:**
- La pregunta se trunca automáticamente a 500 caracteres
- Se procesa con los primeros 500 caracteres
- No se retorna error
- Response exitosa con respuesta generada

---

## Notas Adicionales

### Timeouts

- **Request timeout**: Se recomienda configurar un timeout de al menos 30 segundos
- **Response time**: Típicamente 5-15 segundos dependiendo de la complejidad

### CORS

La API está configurada para aceptar solicitudes desde orígenes permitidos. En producción, asegúrate de configurar los orígenes correctos en `ALLOWED_ORIGINS`.

### Versión de la API

La versión actual de la API es **1.0.0**. Los cambios futuros seguirán versionado semántico.

---

## Soporte

Para más información o soporte, consulta la documentación del proyecto o contacta al equipo de desarrollo.

**Última actualización:** Enero 2024

