# 📜 Especificación de Funcionalidad: Historial de Conversaciones

**Versión:** 1.0.0  
**Estado:** Especificación  
**Última actualización:** Enero 2024

---

## 📋 Índice

1. [Objetivo](#objetivo)
2. [Requisitos del Backend](#requisitos-del-backend)
3. [Requisitos del Frontend](#requisitos-del-frontend)
4. [Estructura de Datos](#estructura-de-datos)
5. [Flujo de Usuario](#flujo-de-usuario)
6. [Casos de Uso](#casos-de-uso)
7. [Consideraciones Técnicas](#consideraciones-técnicas)
8. [Plan de Implementación](#plan-de-implementación)

---

## Objetivo

Permitir a los usuarios autenticados ver su historial de conversaciones anteriores con el asistente de viajes. Esta funcionalidad mejorará la experiencia del usuario al permitirle:

- ✅ Revisar recomendaciones anteriores
- ✅ Acceder rápidamente a información de viajes consultados previamente
- ✅ Continuar conversaciones o hacer preguntas de seguimiento
- ✅ Tener un registro de sus consultas de viajes

---

## Requisitos del Backend

### Endpoint: GET `/api/historial`

**Descripción:** Retorna el historial de conversaciones del usuario autenticado.

#### Request

**URL:** `/api/historial`  
**Method:** `GET`  
**Autenticación:** Requerida (usuario debe estar autenticado)

**Headers:**
```http
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Query Parameters (Opcionales):**
- `limite` (integer, opcional): Número de conversaciones a retornar. Por defecto: 10. Máximo: 50.
- `offset` (integer, opcional): Número de conversaciones a saltar (para paginación). Por defecto: 0.

**Ejemplo de Request:**
```http
GET /api/historial?limite=10&offset=0
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
```

#### Response Exitosa

**Status Code:** `200 OK`

**Estructura de la Response:**
```json
{
  "historial": [
    {
      "id": "consulta_123456",
      "pregunta": "¿Qué hacer en París del 15 al 20 de junio?",
      "respuesta": "» ALOJAMIENTO: Recomendaciones...",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "destino": "París",
      "fecha_viaje": "15/06/2024",
      "presupuesto": "2000"
    },
    {
      "id": "consulta_123455",
      "pregunta": "Recomiéndame hoteles en Barcelona",
      "respuesta": "» ALOJAMIENTO: ...",
      "timestamp": "2024-01-14T15:20:00.000Z",
      "destino": "Barcelona",
      "fecha_viaje": null,
      "presupuesto": null
    }
  ],
  "total": 25,
  "limite": 10,
  "offset": 0,
  "tiene_mas": true
}
```

**Campos de la Response:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `historial` | array | Lista de conversaciones (máximo según `limite`) |
| `historial[].id` | string | ID único de la consulta |
| `historial[].pregunta` | string | Pregunta original del usuario |
| `historial[].respuesta` | string | Respuesta generada por el asistente |
| `historial[].timestamp` | string | Fecha y hora en formato ISO 8601 (UTC) |
| `historial[].destino` | string\|null | Destino consultado (si estaba disponible) |
| `historial[].fecha_viaje` | string\|null | Fecha del viaje (si estaba disponible) |
| `historial[].presupuesto` | string\|null | Presupuesto (si estaba disponible) |
| `total` | integer | Número total de conversaciones del usuario |
| `limite` | integer | Límite aplicado en la consulta |
| `offset` | integer | Offset aplicado en la consulta |
| `tiene_mas` | boolean | Indica si hay más conversaciones disponibles |

#### Códigos de Error

| Código | Descripción | Detalles |
|--------|-------------|----------|
| `401` | Unauthorized | Usuario no autenticado o token inválido |
| `403` | Forbidden | Usuario no tiene permisos para acceder al historial |
| `500` | Internal Server Error | Error al obtener el historial desde Firebase |

**Ejemplo de Error 401:**
```json
{
  "detail": "Usuario no autenticado. Por favor, inicia sesión."
}
```

**Ejemplo de Error 500:**
```json
{
  "detail": "Error al obtener el historial. Por favor intenta más tarde."
}
```

#### Validaciones

1. **Autenticación:** El usuario debe estar autenticado
2. **Límite:** El parámetro `limite` debe estar entre 1 y 50
3. **Offset:** El parámetro `offset` debe ser >= 0
4. **Orden:** Las conversaciones se ordenan por timestamp descendente (más recientes primero)

#### Rate Limiting

- **Límite:** 20 solicitudes por minuto por usuario
- **Razón:** Prevenir abuso y reducir carga en Firebase

---

## Requisitos del Frontend

### Nueva Sección: "Historial"

**Ubicación:** Debajo del formulario principal de preguntas, antes del área de respuesta.

#### Componente: `HistorialConversaciones.jsx`

**Descripción:** Componente React que muestra el historial de conversaciones del usuario.

**Características:**
- ✅ Lista de conversaciones anteriores
- ✅ Botón "Ver Historial" para mostrar/ocultar
- ✅ Visualización ordenada (más recientes primero)
- ✅ Formato legible de fechas
- ✅ Indicador de carga mientras se obtienen datos
- ✅ Manejo de errores

#### Estructura Visual

```
┌─────────────────────────────────────────┐
│  [Formulario de Pregunta]               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📜 Historial de Conversaciones          │
│  [Ver Historial ▼] / [Ocultar Historial ▲] │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🕐 15 Ene 2024, 10:30              │ │
│  │ Q: ¿Qué hacer en París?            │ │
│  │ A: » ALOJAMIENTO: ...              │ │
│  │    [Ver respuesta completa]         │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🕐 14 Ene 2024, 15:20              │ │
│  │ Q: Recomiéndame hoteles en Barcelona│ │
│  │ A: » ALOJAMIENTO: ...              │ │
│  │    [Ver respuesta completa]         │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Cargar más]                            │
└─────────────────────────────────────────┘
```

#### Botón "Ver Historial"

**Comportamiento:**
- Estado inicial: Historial oculto
- Al hacer clic: Muestra el historial y cambia a "Ocultar Historial"
- Al hacer clic nuevamente: Oculta el historial

**Estados:**
- **Oculto:** Botón muestra "Ver Historial"
- **Visible:** Botón muestra "Ocultar Historial"
- **Cargando:** Botón deshabilitado, muestra spinner
- **Error:** Muestra mensaje de error

#### Visualización de Conversaciones

**Formato de cada conversación:**

1. **Encabezado:**
   - Fecha y hora formateada (ej: "15 Ene 2024, 10:30")
   - Destino (si está disponible)

2. **Pregunta:**
   - Texto completo de la pregunta
   - Estilo: Negrita o destacado

3. **Respuesta:**
   - Vista previa truncada (primeros 200 caracteres)
   - Botón "Ver respuesta completa" para expandir
   - O botón "Ver menos" para colapsar

4. **Acciones:**
   - Botón "Usar esta pregunta" (reutilizar la pregunta)
   - Botón "Copiar respuesta" (copiar al portapapeles)

#### Estados del Componente

```javascript
const [historial, setHistorial] = useState([])
const [mostrarHistorial, setMostrarHistorial] = useState(false)
const [cargando, setCargando] = useState(false)
const [error, setError] = useState(null)
const [tieneMas, setTieneMas] = useState(false)
const [offset, setOffset] = useState(0)
```

#### Integración con el Componente Principal

**Ubicación en `Asistente.jsx`:**

```jsx
<main className="main-content">
  {/* Formulario de pregunta */}
  <form onSubmit={handleSubmit}>...</form>
  
  {/* NUEVA SECCIÓN: Historial */}
  <HistorialConversaciones 
    usuarioActual={usuarioActual}
    onReutilizarPregunta={(pregunta) => setPregunta(pregunta)}
  />
  
  {/* Área de respuesta */}
  {respuesta && <div className="response-area">...</div>}
</main>
```

---

## Estructura de Datos

### En Firebase Realtime Database

**Ruta:** `consultas/{userId}/{consultaId}`

**Estructura:**
```json
{
  "consultas": {
    "user_123": {
      "consulta_abc123": {
        "pregunta": "¿Qué hacer en París?",
        "destino": "París",
        "fechaViaje": "15/06/2024",
        "presupuesto": "2000",
        "preferencias": "cultura",
        "fechaConsulta": "2024-01-15T10:30:00.000Z",
        "usuarioId": "user_123",
        "usuarioEmail": "usuario@ejemplo.com"
      },
      "consulta_def456": {
        "pregunta": "Recomiéndame hoteles en Barcelona",
        "destino": "Barcelona",
        "fechaViaje": null,
        "presupuesto": null,
        "preferencias": null,
        "fechaConsulta": "2024-01-14T15:20:00.000Z",
        "usuarioId": "user_123",
        "usuarioEmail": "usuario@ejemplo.com"
      }
    }
  }
}
```

**Nota:** Las respuestas no se guardan en Firebase actualmente. Se deben obtener del historial local del frontend o implementar guardado de respuestas.

### Formato de Timestamp

**Estándar:** ISO 8601 (UTC)

**Ejemplo:** `2024-01-15T10:30:00.000Z`

**Formato en Frontend:** 
- Fecha: "15 Ene 2024"
- Hora: "10:30"
- Combinado: "15 Ene 2024, 10:30"

---

## Flujo de Usuario

### Flujo 1: Ver Historial por Primera Vez

```
1. Usuario está en la página del asistente
   ↓
2. Usuario hace clic en "Ver Historial"
   ↓
3. Frontend muestra indicador de carga
   ↓
4. Frontend hace GET /api/historial
   ↓
5. Backend valida autenticación
   ↓
6. Backend obtiene datos de Firebase
   ↓
7. Backend retorna últimas 10 conversaciones
   ↓
8. Frontend muestra lista de conversaciones
   ↓
9. Usuario puede ver sus conversaciones anteriores
```

### Flujo 2: Reutilizar una Pregunta

```
1. Usuario ve una pregunta en el historial
   ↓
2. Usuario hace clic en "Usar esta pregunta"
   ↓
3. Frontend copia la pregunta al formulario
   ↓
4. Usuario puede modificar o enviar directamente
```

### Flujo 3: Ver Respuesta Completa

```
1. Usuario ve vista previa de respuesta
   ↓
2. Usuario hace clic en "Ver respuesta completa"
   ↓
3. Frontend expande la respuesta completa
   ↓
4. Usuario puede leer toda la respuesta
   ↓
5. Usuario puede hacer clic en "Ver menos" para colapsar
```

---

## Casos de Uso

### Caso 1: Usuario Nuevo (Sin Historial)

**Escenario:** Usuario acaba de registrarse y no tiene conversaciones.

**Comportamiento:**
- El botón "Ver Historial" está visible pero deshabilitado
- O muestra mensaje: "Aún no tienes conversaciones. ¡Haz tu primera pregunta!"
- Al hacer clic, muestra mensaje informativo

### Caso 2: Usuario con Muchas Conversaciones

**Escenario:** Usuario tiene 50+ conversaciones.

**Comportamiento:**
- Muestra las últimas 10 por defecto
- Botón "Cargar más" para obtener las siguientes 10
- Implementa paginación o scroll infinito

### Caso 3: Error al Cargar Historial

**Escenario:** Error de red o Firebase no disponible.

**Comportamiento:**
- Muestra mensaje de error claro
- Botón "Reintentar" para volver a intentar
- No bloquea el uso del asistente

### Caso 4: Usuario No Autenticado

**Escenario:** Usuario intenta ver historial sin estar autenticado.

**Comportamiento:**
- El botón "Ver Historial" no se muestra
- O muestra mensaje: "Inicia sesión para ver tu historial"

---

## Consideraciones Técnicas

### Backend

#### Autenticación

**Implementación:**
- Verificar token de Firebase en el header `Authorization`
- Validar que el `userId` del token coincida con el solicitado
- Rechazar si el token es inválido o expirado

**Código de ejemplo:**
```python
from firebase_admin import auth

async def obtener_historial(request: Request):
    # Obtener token del header
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    # Verificar token
    try:
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    # Obtener historial del usuario
    # ...
```

#### Obtención de Datos desde Firebase

**Implementación:**
- Conectar a Firebase Realtime Database
- Obtener datos de `consultas/{userId}`
- Ordenar por `fechaConsulta` descendente
- Limitar resultados según parámetros
- Formatear timestamps a ISO 8601

#### Optimización

- **Caché:** Considerar caché en memoria para usuarios activos
- **Límites:** Limitar a 50 conversaciones máximo por request
- **Índices:** Asegurar que Firebase tenga índices en `fechaConsulta`

### Frontend

#### Gestión de Estado

**Estrategia:**
- Usar `useState` para estado local del componente
- Considerar `useContext` si se necesita compartir historial
- Implementar `useEffect` para cargar datos al montar

#### Optimización de Rendimiento

- **Lazy Loading:** Cargar historial solo cuando se expande
- **Virtualización:** Para listas largas, usar virtualización
- **Memoización:** Memoizar componentes de conversación individual

#### Manejo de Errores

- **Errores de Red:** Mostrar mensaje y botón de reintentar
- **Errores de Autenticación:** Redirigir a login
- **Errores del Servidor:** Mostrar mensaje genérico

---

## Plan de Implementación

### Fase 1: Backend (Prioridad Alta)

**Tareas:**
1. ✅ Crear endpoint `GET /api/historial`
2. ✅ Implementar autenticación con Firebase
3. ✅ Conectar con Firebase Realtime Database
4. ✅ Implementar ordenamiento y límites
5. ✅ Formatear timestamps a ISO 8601
6. ✅ Agregar rate limiting
7. ✅ Manejo de errores
8. ✅ Testing del endpoint

**Archivos a modificar/crear:**
- `backend/main.py` - Agregar endpoint
- `backend/firebase_service.py` - (nuevo) Servicio de Firebase
- `backend/requirements.txt` - Agregar `firebase-admin` si es necesario

### Fase 2: Frontend (Prioridad Alta)

**Tareas:**
1. ✅ Crear componente `HistorialConversaciones.jsx`
2. ✅ Crear estilos `HistorialConversaciones.css`
3. ✅ Integrar en `Asistente.jsx`
4. ✅ Implementar función para obtener historial
5. ✅ Implementar visualización de conversaciones
6. ✅ Implementar botón "Ver Historial" / "Ocultar"
7. ✅ Formatear fechas legibles
8. ✅ Implementar "Ver respuesta completa"
9. ✅ Implementar "Usar esta pregunta"
10. ✅ Manejo de estados (cargando, error, vacío)
11. ✅ Testing del componente

**Archivos a crear:**
- `frontend/src/components/HistorialConversaciones.jsx`
- `frontend/src/components/HistorialConversaciones.css`

**Archivos a modificar:**
- `frontend/src/components/Asistente.jsx` - Integrar componente

### Fase 3: Mejoras (Prioridad Media)

**Tareas:**
1. Implementar paginación o scroll infinito
2. Agregar filtros (por destino, por fecha)
3. Agregar búsqueda en el historial
4. Agregar opción de eliminar conversaciones
5. Agregar opción de exportar historial
6. Mejorar UX con animaciones

### Fase 4: Optimización (Prioridad Baja)

**Tareas:**
1. Implementar caché en frontend
2. Implementar caché en backend
3. Optimizar consultas a Firebase
4. Implementar virtualización para listas largas

---

## Especificaciones Técnicas Detalladas

### Endpoint Backend: GET `/api/historial`

#### Implementación Python (FastAPI)

```python
from fastapi import FastAPI, HTTPException, Request, Depends
from firebase_admin import auth
import firebase_admin
from firebase_admin import credentials, db

@app.get("/api/historial")
@rate_limit_historial()  # 20 requests per minute
async def obtener_historial(
    request: Request,
    limite: int = 10,
    offset: int = 0
):
    """
    Obtiene el historial de conversaciones del usuario autenticado.
    
    Args:
        request: Request object (para obtener headers)
        limite: Número de conversaciones a retornar (1-50)
        offset: Número de conversaciones a saltar
    
    Returns:
        JSON con historial de conversaciones
    """
    # Validar límites
    if limite < 1 or limite > 50:
        raise HTTPException(status_code=400, detail="limite debe estar entre 1 y 50")
    if offset < 0:
        raise HTTPException(status_code=400, detail="offset debe ser >= 0")
    
    # Obtener y verificar token
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Token de autenticación requerido")
    
    try:
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
    except Exception as e:
        logger.error(f"Error al verificar token: {str(e)}")
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    # Obtener historial de Firebase
    try:
        ref = db.reference(f'consultas/{user_id}')
        snapshot = ref.order_by_child('fechaConsulta').limit_to_last(limite + offset).get()
        
        # Procesar y formatear datos
        historial = []
        total = len(snapshot) if snapshot else 0
        
        if snapshot:
            # Convertir a lista y ordenar
            items = list(snapshot.items())
            items.sort(key=lambda x: x[1].get('fechaConsulta', ''), reverse=True)
            
            # Aplicar offset y límite
            items = items[offset:offset + limite]
            
            for consulta_id, consulta_data in items:
                historial.append({
                    "id": consulta_id,
                    "pregunta": consulta_data.get("pregunta", ""),
                    "respuesta": consulta_data.get("respuesta", ""),  # Si se guarda
                    "timestamp": consulta_data.get("fechaConsulta", ""),
                    "destino": consulta_data.get("destino"),
                    "fecha_viaje": consulta_data.get("fechaViaje"),
                    "presupuesto": consulta_data.get("presupuesto")
                })
        
        return {
            "historial": historial,
            "total": total,
            "limite": limite,
            "offset": offset,
            "tiene_mas": (offset + limite) < total
        }
    
    except Exception as e:
        logger.error(f"Error al obtener historial: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error al obtener el historial. Por favor intenta más tarde."
        )
```

### Componente Frontend: `HistorialConversaciones.jsx`

#### Estructura del Componente

```jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './HistorialConversaciones.css'

function HistorialConversaciones({ onReutilizarPregunta }) {
  const { usuarioActual, obtenerToken } = useAuth()
  const [historial, setHistorial] = useState([])
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [tieneMas, setTieneMas] = useState(false)
  const [offset, setOffset] = useState(0)

  const cargarHistorial = async () => {
    if (!usuarioActual) return

    setCargando(true)
    setError(null)

    try {
      const token = await obtenerToken()
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      
      const response = await axios.get(`${apiUrl}/api/historial`, {
        params: {
          limite: 10,
          offset: offset
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (offset === 0) {
        setHistorial(response.data.historial)
      } else {
        setHistorial(prev => [...prev, ...response.data.historial])
      }

      setTieneMas(response.data.tiene_mas)
      setOffset(response.data.offset + response.data.limite)
    } catch (err) {
      setError('Error al cargar el historial. Por favor intenta de nuevo.')
      console.error('Error al cargar historial:', err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (mostrarHistorial && historial.length === 0) {
      cargarHistorial()
    }
  }, [mostrarHistorial])

  const formatearFecha = (timestamp) => {
    const fecha = new Date(timestamp)
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!usuarioActual) {
    return null
  }

  return (
    <div className="historial-seccion">
      <button
        onClick={() => {
          setMostrarHistorial(!mostrarHistorial)
          if (!mostrarHistorial && historial.length === 0) {
            cargarHistorial()
          }
        }}
        className="historial-boton-toggle"
        disabled={cargando}
      >
        {mostrarHistorial ? '▲ Ocultar Historial' : '▼ Ver Historial'}
      </button>

      {mostrarHistorial && (
        <div className="historial-contenido">
          {cargando && historial.length === 0 && (
            <div className="historial-cargando">
              <div className="spinner"></div>
              <p>Cargando historial...</p>
            </div>
          )}

          {error && (
            <div className="historial-error">
              <p>{error}</p>
              <button onClick={cargarHistorial}>Reintentar</button>
            </div>
          )}

          {!cargando && !error && historial.length === 0 && (
            <div className="historial-vacio">
              <p>📝 Aún no tienes conversaciones.</p>
              <p>¡Haz tu primera pregunta al asistente!</p>
            </div>
          )}

          {historial.length > 0 && (
            <div className="historial-lista">
              {historial.map((consulta) => (
                <ConversacionItem
                  key={consulta.id}
                  consulta={consulta}
                  formatearFecha={formatearFecha}
                  onReutilizarPregunta={onReutilizarPregunta}
                />
              ))}

              {tieneMas && (
                <button
                  onClick={() => cargarHistorial()}
                  className="historial-cargar-mas"
                  disabled={cargando}
                >
                  {cargando ? 'Cargando...' : 'Cargar más'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ConversacionItem({ consulta, formatearFecha, onReutilizarPregunta }) {
  const [mostrarRespuestaCompleta, setMostrarRespuestaCompleta] = useState(false)

  return (
    <div className="conversacion-item">
      <div className="conversacion-header">
        <span className="conversacion-fecha">
          🕐 {formatearFecha(consulta.timestamp)}
        </span>
        {consulta.destino && (
          <span className="conversacion-destino">📍 {consulta.destino}</span>
        )}
      </div>

      <div className="conversacion-pregunta">
        <strong>P:</strong> {consulta.pregunta}
      </div>

      <div className="conversacion-respuesta">
        <strong>R:</strong>{' '}
        {mostrarRespuestaCompleta ? (
          <span>{consulta.respuesta}</span>
        ) : (
          <span>{consulta.respuesta.substring(0, 200)}...</span>
        )}
        <button
          onClick={() => setMostrarRespuestaCompleta(!mostrarRespuestaCompleta)}
          className="conversacion-toggle-respuesta"
        >
          {mostrarRespuestaCompleta ? 'Ver menos' : 'Ver respuesta completa'}
        </button>
      </div>

      <div className="conversacion-acciones">
        <button
          onClick={() => onReutilizarPregunta(consulta.pregunta)}
          className="conversacion-boton-reutilizar"
        >
          🔄 Usar esta pregunta
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(consulta.respuesta)
            // Mostrar notificación de copiado
          }}
          className="conversacion-boton-copiar"
        >
          📋 Copiar respuesta
        </button>
      </div>
    </div>
  )
}

export default HistorialConversaciones
```

---

## Estilos CSS

### `HistorialConversaciones.css`

```css
.historial-seccion {
  margin: 30px 0;
  border-top: 2px solid #e0e0e0;
  padding-top: 20px;
}

.historial-boton-toggle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-bottom: 20px;
}

.historial-boton-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.historial-boton-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.historial-contenido {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.historial-lista {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.conversacion-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.conversacion-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.conversacion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: #666;
}

.conversacion-fecha {
  font-weight: 600;
}

.conversacion-destino {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.conversacion-pregunta {
  margin-bottom: 12px;
  color: #2c3e50;
  line-height: 1.6;
}

.conversacion-respuesta {
  margin-bottom: 15px;
  color: #34495e;
  line-height: 1.6;
}

.conversacion-toggle-respuesta {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.9rem;
  margin-left: 8px;
}

.conversacion-toggle-respuesta:hover {
  color: #764ba2;
}

.conversacion-acciones {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.conversacion-boton-reutilizar,
.conversacion-boton-copiar {
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.conversacion-boton-reutilizar:hover,
.conversacion-boton-copiar:hover {
  background: #667eea;
  color: white;
}

.historial-cargar-mas {
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.historial-cargar-mas:hover {
  background: #667eea;
  color: white;
}

.historial-cargar-mas:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.historial-cargando,
.historial-error,
.historial-vacio {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.historial-vacio p {
  margin: 10px 0;
  font-size: 1.1rem;
}
```

---

## Testing

### Casos de Prueba Backend

1. ✅ Obtener historial con usuario autenticado
2. ✅ Rechazar sin token de autenticación
3. ✅ Rechazar con token inválido
4. ✅ Validar límites (limite > 50, offset < 0)
5. ✅ Retornar máximo 10 conversaciones por defecto
6. ✅ Ordenar por fecha descendente
7. ✅ Formato ISO 8601 en timestamps
8. ✅ Manejo de usuario sin conversaciones

### Casos de Prueba Frontend

1. ✅ Mostrar/ocultar historial
2. ✅ Cargar historial al expandir
3. ✅ Mostrar indicador de carga
4. ✅ Mostrar mensaje cuando no hay conversaciones
5. ✅ Mostrar error y botón de reintentar
5. ✅ Formatear fechas correctamente
6. ✅ Expandir/colapsar respuestas
7. ✅ Reutilizar pregunta
8. ✅ Copiar respuesta al portapapeles
9. ✅ Cargar más conversaciones

---

## Notas de Implementación

### Consideraciones Importantes

1. **Guardado de Respuestas:** Actualmente las respuestas no se guardan en Firebase. Se debe implementar guardado de respuestas o usar el historial local del frontend.

2. **Autenticación:** El backend debe verificar tokens de Firebase. Considerar usar `firebase-admin` en Python.

3. **Performance:** Para usuarios con muchas conversaciones, implementar paginación eficiente.

4. **Privacidad:** Asegurar que los usuarios solo puedan ver su propio historial.

---

**Última actualización:** Dic 2025  
**Estado:** Especificación lista para implementación

