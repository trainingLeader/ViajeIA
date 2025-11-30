# 🏗️ Arquitectura del Proyecto - ViajeIA

**Versión:** 1.0.0  
**Última actualización:** Enero 2024

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Flujo de Datos](#flujo-de-datos)
5. [Arquitectura de Componentes](#arquitectura-de-componentes)
6. [Comunicación entre Capas](#comunicación-entre-capas)
7. [Servicios Externos](#servicios-externos)
8. [Seguridad y Validación](#seguridad-y-validación)

---

## Visión General

ViajeIA es una aplicación web full-stack que proporciona recomendaciones personalizadas de viajes utilizando inteligencia artificial. La arquitectura sigue un patrón de separación de responsabilidades con frontend y backend completamente independientes.

### Principios Arquitectónicos

- ✅ **Separación de Frontend y Backend**: Comunicación vía API REST
- ✅ **Validación en múltiples capas**: Frontend (UX) y Backend (seguridad)
- ✅ **Seguridad por diseño**: Validación, sanitización y rate limiting
- ✅ **Escalabilidad**: Arquitectura modular y desacoplada
- ✅ **Mantenibilidad**: Código organizado y documentado

---

## Estructura del Proyecto

### Árbol de Directorios Completo

```
ViajeIA/
│
├── backend/                          # Backend Python (FastAPI)
│   ├── __pycache__/                 # Cache de Python (generado)
│   ├── logs/                        # Logs de la aplicación
│   │   └── viajeia_YYYYMMDD.log    # Logs diarios
│   │
│   ├── main.py                      # Aplicación principal FastAPI
│   ├── security.py                  # Validación y sanitización
│   ├── prompt_filter.py             # Filtrado de prompts peligrosos
│   ├── openai_config.py             # Configuración de OpenAI
│   ├── rate_limiter.py              # Rate limiting
│   ├── logger_config.py             # Configuración de logging
│   ├── stats.py                     # Estadísticas de uso
│   ├── ejemplo_bcrypt.py            # Ejemplo de encriptación
│   │
│   ├── requirements.txt             # Dependencias Python
│   ├── .env                         # Variables de entorno (crear)
│   ├── env.example.txt              # Ejemplo de variables de entorno
│   ├── start.sh                     # Script de inicio
│   ├── README.md                    # Documentación del backend
│   │
│   └── INSTRUCCIONES_*.md           # Guías de configuración
│
├── frontend/                         # Frontend React
│   ├── node_modules/                # Dependencias npm (generado)
│   ├── public/                      # Archivos estáticos
│   │
│   ├── src/                         # Código fuente
│   │   ├── main.jsx                 # Punto de entrada
│   │   ├── App.jsx                  # Componente principal
│   │   ├── App.css                  # Estilos globales
│   │   ├── index.css                # Estilos base
│   │   │
│   │   ├── components/              # Componentes React
│   │   │   ├── Asistente.jsx        # Componente principal del asistente
│   │   │   ├── Login.jsx            # Formulario de login
│   │   │   ├── Registro.jsx         # Formulario de registro
│   │   │   ├── FormularioPreferencias.jsx  # Formulario de preferencias
│   │   │   ├── MensajeError.jsx     # Componente de mensajes de error
│   │   │   ├── AlertaRespuestaCortada.jsx  # Alerta de respuesta truncada
│   │   │   ├── LimiteAlcanzado.jsx  # Modal de límite de consultas
│   │   │   ├── ContadorConsultas.jsx # Contador de consultas restantes
│   │   │   ├── PoliticaPrivacidad.jsx # Modal de política de privacidad
│   │   │   │
│   │   │   └── *.css                # Estilos de componentes
│   │   │
│   │   ├── context/                 # Context API de React
│   │   │   └── AuthContext.jsx      # Contexto de autenticación
│   │   │
│   │   ├── utils/                   # Utilidades
│   │   │   ├── validacion.js        # Validación frontend
│   │   │   ├── promptFilter.js      # Filtrado de prompts
│   │   │   └── rateLimiter.js       # Rate limiting frontend
│   │   │
│   │   └── firebase/                # Configuración Firebase
│   │       └── config.js            # Configuración de Firebase
│   │
│   ├── index.html                   # HTML principal
│   ├── package.json                 # Dependencias npm
│   ├── package-lock.json            # Lock file de dependencias
│   ├── vite.config.js               # Configuración de Vite
│   └── vercel.json                  # Configuración de Vercel
│
├── docs/                             # Documentación
│   ├── API_DOCUMENTATION.md         # Documentación de la API
│   └── ARQUITECTURA.md              # Este archivo
│
├── README.md                         # Documentación principal
├── render.yaml                       # Configuración de Render
│
├── FIREBASE_RULES_SEGURAS.json      # Reglas de seguridad Firebase
│
└── GUIA_*.md                        # Guías y documentación
    ├── GUIA_SEGURIDAD.md
    ├── GUIA_VALIDACION.md
    ├── GUIA_RATE_LIMITING.md
    ├── GUIA_PRIVACIDAD.md
    ├── GUIA_CONFIGURACION_OPENAI.md
    └── ...
```

---

## Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Python** | 3.8+ | Lenguaje de programación |
| **FastAPI** | Latest | Framework web moderno y rápido |
| **OpenAI API** | Latest | Integración con ChatGPT (gpt-3.5-turbo, gpt-4) |
| **Pydantic** | Latest | Validación de datos y modelos |
| **slowapi** | 0.1.9 | Rate limiting |
| **python-dotenv** | Latest | Gestión de variables de entorno |
| **requests** | Latest | Cliente HTTP para APIs externas |
| **uvicorn** | Latest | Servidor ASGI |

**Nota:** El proyecto actualmente usa **FastAPI**, aunque la arquitectura es compatible con **Flask** como alternativa. Para usar Flask, simplemente reemplazar FastAPI con Flask manteniendo la misma estructura de endpoints.

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.2.0 | Biblioteca de UI |
| **JavaScript (ES6+)** | Latest | Lenguaje de programación |
| **Vite** | 5.0.8 | Build tool y dev server |
| **Axios** | 1.6.0 | Cliente HTTP para API |
| **Firebase SDK** | 10.14.1 | Autenticación y base de datos |
| **jsPDF** | 3.0.4 | Generación de PDFs |
| **CSS3** | Latest | Estilos |

### Servicios Externos y APIs

| Servicio | Propósito |
|----------|-----------|
| **OpenAI (ChatGPT)** | Generación de recomendaciones de viajes usando IA |
| **Google Gemini 2.0 Flash** | Alternativa a OpenAI (configurable) |
| **Firebase Authentication** | Autenticación de usuarios |
| **Firebase Realtime Database** | Almacenamiento de datos de usuarios y consultas |
| **OpenWeatherMap API** | Información del clima en tiempo real |
| **Unsplash API** | Fotos de destinos de viaje |
| **ExchangeRate API** | Información de tipos de cambio |

### Comunicación

| Protocolo | Propósito |
|-----------|-----------|
| **HTTP/HTTPS** | Protocolo de comunicación |
| **REST** | Estilo arquitectónico de API |
| **JSON** | Formato de intercambio de datos |
| **WebSockets** | (Opcional) Para funcionalidades en tiempo real |

---

## Flujo de Datos

### Flujo Completo: Usuario → Respuesta

```
┌─────────────┐
│   Usuario   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Usuario escribe pregunta
       │    "¿Qué hacer en París?"
       ▼
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│                                         │
│  ┌───────────────────────────────┐     │
│  │  Componente: Asistente.jsx    │     │
│  │                               │     │
│  │  • Validación frontend        │     │
│  │  • Filtrado de prompts        │     │
│  │  • Rate limiting check        │     │
│  └───────────┬───────────────────┘     │
│              │                          │
│              │ 2. POST /api/planificar │
│              │    {                    │
│              │      "pregunta": "...", │
│              │      "contexto": {...}  │
│              │    }                    │
│              ▼                          │
└─────────────────────────────────────────┘
       │
       │ HTTP/JSON
       │ Content-Type: application/json
       ▼
┌─────────────────────────────────────────┐
│      Backend (FastAPI/Python)           │
│                                         │
│  ┌───────────────────────────────┐     │
│  │  Endpoint: /api/planificar    │     │
│  │                               │     │
│  │  3. Rate Limiting Check       │     │
│  │     • Verificar límites       │     │
│  │     • Bloquear si excede      │     │
│  └───────────┬───────────────────┘     │
│              │                          │
│  ┌───────────▼───────────────────┐     │
│  │  4. Validación Backend        │     │
│  │     • Formato básico          │     │
│  │     • Longitud (10-500 chars) │     │
│  │     • Truncamiento automático │     │
│  └───────────┬───────────────────┘     │
│              │                          │
│  ┌───────────▼───────────────────┐     │
│  │  5. Filtrado de Seguridad     │     │
│  │     • Verificar contexto      │     │
│  │     • Detectar palabras       │     │
│  │       peligrosas              │     │
│  │     • Validar que sea sobre   │     │
│  │       viajes                  │     │
│  └───────────┬───────────────────┘     │
│              │                          │
│  ┌───────────▼───────────────────┐     │
│  │  6. Sanitización              │     │
│  │     • Escapar HTML            │     │
│  │     • Limpiar caracteres      │     │
│  │       peligrosos              │     │
│  └───────────┬───────────────────┘     │
│              │                          │
│  ┌───────────▼───────────────────┐     │
│  │  7. Obtener Info Adicional    │     │
│  │     • Clima (OpenWeatherMap)  │     │
│  │     • Fotos (Unsplash)        │     │
│  │     • Moneda (ExchangeRate)   │     │
│  └───────────┬───────────────────┘     │
│              │                          │
│  ┌───────────▼───────────────────┐     │
│  │  8. Preparar Prompt para IA   │     │
│  │     • System message          │     │
│  │     • Contexto usuario        │     │
│  │     • Info clima              │     │
│  │     • Limitar historial       │     │
│  └───────────┬───────────────────┘     │
│              │                          │
└──────────────┼──────────────────────────┘
               │
               │ 9. HTTP Request
               │    POST https://api.openai.com/v1/chat/completions
               │    {
               │      "model": "gpt-3.5-turbo",
               │      "messages": [...],
               │      "max_tokens": 1500
               │    }
               ▼
┌─────────────────────────────────────────┐
│      OpenAI API / Gemini API            │
│                                         │
│  • Procesa el prompt                    │
│  • Genera respuesta estructurada        │
│  • Retorna JSON con respuesta           │
│                                         │
│  Response:                              │
│  {                                      │
│    "choices": [{                        │
│      "message": {                       │
│        "content": "» ALOJAMIENTO: ..."  │
│      },                                 │
│      "finish_reason": "stop"            │
│    }],                                  │
│    "usage": {                           │
│      "total_tokens": 850                │
│    }                                    │
│  }                                      │
└───────────┬─────────────────────────────┘
            │
            │ 10. HTTP Response
            │     JSON con respuesta
            ▼
┌─────────────────────────────────────────┐
│      Backend (Procesamiento)            │
│                                         │
│  ┌───────────────────────────────┐     │
│  │  11. Procesar Respuesta       │     │
│  │     • Extraer contenido       │     │
│  │     • Detectar si se cortó    │     │
│  │     • Obtener tokens usados   │     │
│  └───────────┬───────────────────┘     │
│              │                          │
│  ┌───────────▼───────────────────┐     │
│  │  12. Registrar en BD          │     │
│  │     • Guardar consulta        │     │
│  │     • Actualizar estadísticas │     │
│  │     • Registrar en Firebase   │     │
│  └───────────┬───────────────────┘     │
│              │                          │
│  ┌───────────▼───────────────────┐     │
│  │  13. Formatear Response       │     │
│  │     {                          │     │
│  │       "respuesta": "...",      │     │
│  │       "fotos": [...],          │     │
│  │       "info_destino": {...},   │     │
│  │       "respuesta_cortada": ... │     │
│  │       "tokens_usados": ...     │     │
│  │     }                          │     │
│  └───────────┬───────────────────┘     │
│              │                          │
└──────────────┼──────────────────────────┘
               │
               │ 14. HTTP Response
               │     Status: 200 OK
               │     Content-Type: application/json
               ▼
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│                                         │
│  ┌───────────────────────────────┐     │
│  │  15. Recibir Respuesta        │     │
│  │     • Parsear JSON            │     │
│  │     • Extraer datos           │     │
│  └───────────┬───────────────────┘     │
│              │                          │
│  ┌───────────▼───────────────────┐     │
│  │  16. Procesar Respuesta       │     │
│  │     • Detectar si se cortó    │     │
│  │     • Guardar en historial    │     │
│  │     • Registrar en Firebase   │     │
│  └───────────┬───────────────────┘     │
│              │                          │
│  ┌───────────▼───────────────────┐     │
│  │  17. Renderizar UI            │     │
│  │     • Mostrar respuesta       │     │
│  │     • Mostrar fotos           │     │
│  │     • Mostrar info destino    │     │
│  │     • Alerta si se cortó      │     │
│  └───────────┬───────────────────┘     │
│              │                          │
└──────────────┼──────────────────────────┘
               │
               ▼
       ┌───────────────┐
       │    Usuario    │
       │  Ve respuesta │
       └───────────────┘
```

---

## Arquitectura de Componentes

### Frontend (React)

```
┌──────────────────────────────────────┐
│          App.jsx                     │
│  (Componente Raíz)                   │
└──────────────┬───────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐ ┌──────▼──────┐
│ AuthContext │ │  Asistente  │
│  (Context)  │ │  (Main UI)  │
└──────┬──────┘ └──────┬──────┘
       │               │
       │      ┌────────┴────────┐
       │      │                 │
┌──────▼──────▼──┐    ┌─────────▼──────────┐
│   Login.jsx    │    │  Formulario        │
│   Registro.jsx │    │  Preferencias.jsx  │
└────────────────┘    └─────────┬──────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
            ┌───────▼───┐  ┌────▼────┐  ┌──▼───────────┐
            │ Mensaje   │  │ Alerta  │  │ Contador     │
            │ Error.jsx │  │ Cortada │  │ Consultas    │
            └───────────┘  └─────────┘  └──────────────┘
```

### Backend (FastAPI/Python)

```
┌──────────────────────────────────────┐
│          main.py                     │
│  (FastAPI Application)               │
└──────────┬───────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼─────┐  ┌───▼─────────┐
│ Routes  │  │ Middleware  │
│ (APIs)  │  │ (CORS, etc) │
└───┬─────┘  └─────────────┘
    │
    ├─── GET /
    ├─── GET /api/health
    ├─── GET /api/estadisticas
    └─── POST /api/planificar
           │
    ┌──────┴──────────────┐
    │                     │
┌───▼──────────┐  ┌───────▼────────┐
│ Validación   │  │ Rate Limiting  │
│ (security.py)│  │(rate_limiter.py)│
└───┬──────────┘  └────────────────┘
    │
┌───▼──────────────┐
│ Filtrado Prompts │
│(prompt_filter.py)│
└───┬──────────────┘
    │
┌───▼─────────────────┐
│ Generar Respuesta   │
│(generar_respuesta_  │
│ _con_chatgpt)       │
└───┬─────────────────┘
    │
┌───▼──────────────┐
│ OpenAI Config    │
│(openai_config.py)│
└───┬──────────────┘
    │
    └───► OpenAI API
```

---

## Comunicación entre Capas

### Protocolo de Comunicación

```
Frontend (React)  ←────HTTP/JSON────→  Backend (FastAPI)
     │                                      │
     │                                      │
     ▼                                      ▼
Firebase                              OpenAI API
(BD + Auth)                           (IA)
```

### Formato de Datos

**Request (Frontend → Backend):**
```json
{
  "pregunta": "¿Qué hacer en París?",
  "contexto": {
    "destino": "París",
    "fecha": "15/06/2024",
    "presupuesto": "2000",
    "preferencia": "cultura"
  }
}
```

**Response (Backend → Frontend):**
```json
{
  "respuesta": "» ALOJAMIENTO: ...",
  "fotos": ["url1", "url2", "url3"],
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

---

## Servicios Externos

### OpenAI API (ChatGPT)

**Uso Actual:**
- **Modelo por defecto:** `gpt-3.5-turbo`
- **Modelos soportados:** `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo`, etc.
- **Endpoint:** `https://api.openai.com/v1/chat/completions`

**Configuración:**
- Variable de entorno: `OPENAI_API_KEY`
- Configurable en: `backend/openai_config.py`

### Google Gemini 2.0 Flash (Alternativa)

**Para usar Gemini en lugar de OpenAI:**

1. Instalar SDK de Google:
```bash
pip install google-generativeai
```

2. Modificar `backend/main.py`:
```python
import google.generativeai as genai

# Reemplazar OpenAI con Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')
```

3. Adaptar la función de generación de respuestas

**Ventajas de Gemini:**
- ✅ Más económico
- ✅ Respuestas más rápidas
- ✅ Mejor soporte para español

### Firebase

**Servicios utilizados:**
- **Authentication:** Login y registro de usuarios
- **Realtime Database:** Almacenamiento de datos

**Estructura de datos:**
```
firebase/
├── usuarios/
│   └── [userId]/
│       ├── nombre
│       ├── email
│       └── fechaRegistro
├── consultas/
│   └── [userId]/
│       └── [consultaId]/
│           ├── pregunta
│           ├── destino
│           └── fechaConsulta
└── rateLimiting/
    └── [userId]/
        └── consultas/
```

### OpenWeatherMap

**Propósito:** Información del clima en tiempo real

**Endpoint:** `http://api.openweathermap.org/data/2.5/weather`

### Unsplash

**Propósito:** Fotos de destinos de viaje

**Endpoint:** `https://api.unsplash.com/search/photos`

---

## Seguridad y Validación

### Capas de Seguridad

```
┌─────────────────────────────────────┐
│  1. Frontend Validation             │
│     • Validación básica             │
│     • UX inmediata                  │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│  2. Backend Validation              │
│     • Validación exhaustiva         │
│     • Seguridad real                │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│  3. Prompt Filtering                │
│     • Detección de palabras         │
│       peligrosas                    │
│     • Verificación de contexto      │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│  4. Rate Limiting                   │
│     • Límites por usuario           │
│     • Prevención de abuso           │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│  5. Sanitization                    │
│     • Escapar HTML                  │
│     • Limpiar caracteres            │
└─────────────────────────────────────┘
```

### Validaciones Implementadas

| Capa | Validación | Implementación |
|------|------------|----------------|
| **Frontend** | Longitud mínima/máxima | `validacion.js` |
| **Frontend** | Formato de email | `validacion.js` |
| **Frontend** | Filtrado de prompts | `promptFilter.js` |
| **Backend** | Validación exhaustiva | `security.py` |
| **Backend** | Filtrado de seguridad | `prompt_filter.py` |
| **Backend** | Rate limiting | `rate_limiter.py` |
| **Backend** | Sanitización | `security.py` |

---

## Diagrama de Flujo Detallado

### Proceso de Validación

```
Usuario Input
    │
    ▼
┌──────────────────┐
│ Frontend Check   │
│ • 10-500 chars?  │
│ • Es sobre       │
│   viajes?        │
└────────┬─────────┘
    ✅  │  ❌
    │   └───► Mostrar error
    │
    ▼
┌──────────────────┐
│ HTTP POST        │
│ /api/planificar  │
└────────┬─────────┘
    │
    ▼
┌──────────────────┐
│ Rate Limiting    │
│ • 5/min check    │
└────────┬─────────┘
    ✅  │  ❌
    │   └───► 429 Error
    │
    ▼
┌──────────────────┐
│ Backend          │
│ Validation       │
│ • Format         │
│ • Length         │
│ • Content        │
└────────┬─────────┘
    ✅  │  ❌
    │   └───► 400 Error
    │
    ▼
┌──────────────────┐
│ Security Filter  │
│ • Dangerous words│
│ • Context check  │
└────────┬─────────┘
    ✅  │  ❌
    │   └───► 400 Error
    │
    ▼
┌──────────────────┐
│ Sanitization     │
│ • HTML escape    │
│ • Clean chars    │
└────────┬─────────┘
    │
    ▼
┌──────────────────┐
│ OpenAI API       │
│ Processing       │
└────────┬─────────┘
    │
    ▼
┌──────────────────┐
│ Response         │
│ Processing       │
└────────┬─────────┘
    │
    ▼
Response to Frontend
```

---

## Resumen de Tecnologías

### Stack Principal

- **Backend:** FastAPI (Python 3.8+)
- **Frontend:** React 18.2.0 (JavaScript ES6+)
- **IA:** OpenAI ChatGPT (gpt-3.5-turbo, gpt-4) / Google Gemini 2.0 Flash
- **Comunicación:** HTTP/JSON (REST API)
- **Base de Datos:** Firebase Realtime Database
- **Autenticación:** Firebase Authentication

### Build Tools

- **Frontend:** Vite 5.0.8
- **Backend:** uvicorn (ASGI server)

### Servicios de Terceros

- **OpenAI API** - Generación de IA
- **Google Gemini API** - Alternativa de IA
- **OpenWeatherMap** - Clima
- **Unsplash** - Fotos
- **ExchangeRate API** - Monedas

---

## Notas de Implementación

### Configuración Actual

El proyecto actualmente usa:
- ✅ **FastAPI** (no Flask) para el backend
- ✅ **OpenAI** (no Gemini) para la IA

### Migración a Flask

Para migrar a Flask:
1. Reemplazar FastAPI con Flask
2. Adaptar los decoradores de endpoints
3. Usar Flask-CORS en lugar de CORSMiddleware
4. Mantener la misma estructura de carpetas

### Migración a Gemini

Para migrar a Google Gemini 2.0 Flash:
1. Instalar `google-generativeai`
2. Reemplazar `OpenAI()` con `genai.GenerativeModel()`
3. Adaptar el formato de mensajes
4. Actualizar configuración en `.env`

---

**Última actualización:** Enero 2024  
**Mantenido por:** Equipo ViajeIA

