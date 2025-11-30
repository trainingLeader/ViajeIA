# ⚙️ Guía de Configuración - ViajeIA

**Versión:** 1.0.0  
**Última actualización:** Enero 2024

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Variables de Entorno](#variables-de-entorno)
3. [Constantes del Sistema](#constantes-del-sistema)
4. [Configuración por Entorno](#configuración-por-entorno)
5. [Ejemplos de Configuración](#ejemplos-de-configuración)
6. [Validación de Configuración](#validación-de-configuración)

---

## Introducción

Este documento detalla todas las variables de entorno y constantes del sistema que pueden ser configuradas en ViajeIA. La configuración se realiza principalmente a través del archivo `.env` ubicado en la carpeta `backend/`.

### Ubicación del Archivo de Configuración

```
backend/
└── .env          # Archivo de variables de entorno (crear este archivo)
```

**Nota:** El archivo `.env` no debe ser versionado en Git por seguridad. Usa `env.example.txt` como referencia.

---

## Variables de Entorno

### Variables Requeridas

Estas variables son **obligatorias** para que la aplicación funcione correctamente.

#### `OPENAI_API_KEY`

**Descripción:** API Key de OpenAI para acceder a ChatGPT.

**Tipo:** String  
**Requerida:** ✅ Sí  
**Valor por defecto:** Ninguno (debe configurarse)

**Cómo obtenerla:**
1. Ve a https://platform.openai.com/api-keys
2. Inicia sesión o crea una cuenta
3. Crea una nueva API Key
4. Copia la key (solo se muestra una vez)

**Ejemplo:**
```env
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Nota:** Si no está configurada, la aplicación no iniciará.

---

### Variables Opcionales de IA

#### `GEMINI_API_KEY`

**Descripción:** API Key de Google Gemini 2.0 Flash (alternativa a OpenAI).

**Tipo:** String  
**Requerida:** ❌ No (opcional)  
**Valor por defecto:** Ninguno

**Cómo obtenerla:**
1. Ve a https://makersuite.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API Key
4. Copia la key

**Ejemplo:**
```env
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

**Nota:** Si está configurada, puedes usar Gemini en lugar de OpenAI. Requiere modificar el código para usar el SDK de Gemini.

#### `OPENAI_MODEL`

**Descripción:** Modelo de OpenAI a usar por defecto.

**Tipo:** String  
**Requerida:** ❌ No  
**Valor por defecto:** `gpt-3.5-turbo`

**Valores posibles:**
- `gpt-3.5-turbo` (recomendado, económico)
- `gpt-3.5-turbo-16k` (contexto más largo)
- `gpt-4` (más preciso, más caro)
- `gpt-4-turbo` (mejor rendimiento)
- `gpt-4o` (modelo más reciente)
- `gpt-4o-mini` (versión optimizada)

**Ejemplo:**
```env
OPENAI_MODEL=gpt-4
```

#### `OPENAI_MAX_TOKENS`

**Descripción:** Máximo número de tokens para las respuestas generadas.

**Tipo:** Integer  
**Requerida:** ❌ No  
**Valor por defecto:** `1500`

**Rango recomendado:** `500 - 4000`

**Ejemplo:**
```env
OPENAI_MAX_TOKENS=2000
```

**Nota:** Valores más altos permiten respuestas más largas pero consumen más tokens (más costoso).

#### `OPENAI_MAX_CONTEXT_TOKENS`

**Descripción:** Máximo de tokens para el contexto total (incluyendo historial).

**Tipo:** Integer  
**Requerida:** ❌ No  
**Valor por defecto:** `3000`

**Ejemplo:**
```env
OPENAI_MAX_CONTEXT_TOKENS=4000
```

#### `AI_TEMPERATURE`

**Descripción:** Temperature para la generación de respuestas (controla la creatividad).

**Tipo:** Float  
**Requerida:** ❌ No  
**Valor por defecto:** `0.8`

**Rango:** `0.0 - 2.0`
- `0.0`: Más determinista y predecible
- `0.8`: Balance entre creatividad y coherencia (recomendado)
- `2.0`: Máxima creatividad

**Ejemplo:**
```env
AI_TEMPERATURE=0.7
```

---

### Variables de Servidor

#### `PORT`

**Descripción:** Puerto en el que el servidor escuchará las peticiones.

**Tipo:** Integer  
**Requerida:** ❌ No  
**Valor por defecto:** `8000`

**Ejemplo:**
```env
PORT=8080
```

**Nota:** En producción, muchas plataformas (Render, Heroku, etc.) definen esta variable automáticamente.

#### `FLASK_ENV`

**Descripción:** Entorno de ejecución (aunque el proyecto usa FastAPI, esta variable es compatible).

**Tipo:** String  
**Requerida:** ❌ No  
**Valor por defecto:** `development`

**Valores posibles:**
- `development`: Modo desarrollo (con recarga automática)
- `production`: Modo producción (optimizado)

**Ejemplo:**
```env
FLASK_ENV=production
```

**Nota:** Aunque el proyecto usa FastAPI, esta variable puede ser útil para scripts de despliegue y compatibilidad.

---

### Variables de Servicios Externos (Opcionales)

#### `OPENWEATHER_API_KEY`

**Descripción:** API Key de OpenWeatherMap para información del clima.

**Tipo:** String  
**Requerida:** ❌ No  
**Valor por defecto:** Ninguno

**Cómo obtenerla:**
1. Ve a https://openweathermap.org/api
2. Crea una cuenta gratuita
3. Obtén tu API Key

**Ejemplo:**
```env
OPENWEATHER_API_KEY=abc123def456ghi789jkl012mno345pqr
```

**Nota:** Si no está configurada, la aplicación funcionará pero no mostrará información del clima.

#### `UNSPLASH_API_KEY`

**Descripción:** API Key de Unsplash para fotos de destinos.

**Tipo:** String  
**Requerida:** ❌ No  
**Valor por defecto:** Ninguno

**Cómo obtenerla:**
1. Ve a https://unsplash.com/developers
2. Crea una cuenta
3. Crea una nueva aplicación
4. Obtén tu Access Key

**Ejemplo:**
```env
UNSPLASH_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx
```

**Nota:** Si no está configurada, la aplicación funcionará pero no mostrará fotos de destinos.

#### `ALLOWED_ORIGINS`

**Descripción:** Orígenes permitidos para CORS (separados por comas).

**Tipo:** String (separado por comas)  
**Requerida:** ❌ No  
**Valor por defecto:** `http://localhost:3000`

**Ejemplo:**
```env
ALLOWED_ORIGINS=http://localhost:3000,https://viajeia.com,https://www.viajeia.com
```

**Nota:** En producción, asegúrate de incluir todos los dominios desde los que se accederá a la API.

---

### Variables de Constantes del Sistema

#### `MIN_QUESTION_LENGTH`

**Descripción:** Longitud mínima permitida para preguntas del usuario.

**Tipo:** Integer  
**Requerida:** ❌ No  
**Valor por defecto:** `10`

**Ejemplo:**
```env
MIN_QUESTION_LENGTH=10
```

**Nota:** Preguntas más cortas serán rechazadas con error 400.

#### `MAX_QUESTION_LENGTH`

**Descripción:** Longitud máxima permitida para preguntas del usuario. Si se excede, se aplica truncamiento automático.

**Tipo:** Integer  
**Requerida:** ❌ No  
**Valor por defecto:** `500`

**Ejemplo:**
```env
MAX_QUESTION_LENGTH=500
```

**Nota:** Si una pregunta excede este límite, se trunca automáticamente a este valor sin mostrar error.

#### `SYSTEM_PROMPT`

**Descripción:** System prompt personalizado para el asistente de IA.

**Tipo:** String (multilínea)  
**Requerida:** ❌ No  
**Valor por defecto:** Prompt por defecto de ViajeIA (ver sección de constantes)

**Ejemplo:**
```env
SYSTEM_PROMPT="Eres un asistente experto en viajes..."
```

**Nota:** Si se configura, reemplaza completamente el prompt por defecto. Debe incluir todas las instrucciones necesarias.

---

### Variables de Rate Limiting

#### `RATE_LIMIT_PLANIFICAR`

**Descripción:** Número máximo de consultas al endpoint `/api/planificar` por minuto.

**Tipo:** Integer  
**Requerida:** ❌ No  
**Valor por defecto:** `5`

**Ejemplo:**
```env
RATE_LIMIT_PLANIFICAR=10
```

#### `RATE_LIMIT_ESTADISTICAS`

**Descripción:** Número máximo de consultas al endpoint `/api/estadisticas` por minuto.

**Tipo:** Integer  
**Requerida:** ❌ No  
**Valor por defecto:** `10`

**Ejemplo:**
```env
RATE_LIMIT_ESTADISTICAS=20
```

---

## Constantes del Sistema

### Constantes de Validación

Estas constantes definen las reglas de validación para las preguntas del usuario.

#### `MIN_QUESTION_LENGTH`

**Valor por defecto:** `10` caracteres

**Ubicación en código:** `backend/security.py`, `backend/config.py`

**Descripción:** Longitud mínima que debe tener una pregunta para ser procesada.

**Comportamiento:**
- Si la pregunta tiene menos de `MIN_QUESTION_LENGTH` caracteres, se retorna error 400
- Mensaje de error: "La pregunta debe tener al menos {MIN_QUESTION_LENGTH} caracteres"

**Ejemplo:**
```python
# En security.py
if len(pregunta_trim) < MIN_QUESTION_LENGTH:
    return False, f"La pregunta debe tener al menos {MIN_QUESTION_LENGTH} caracteres", None
```

#### `MAX_QUESTION_LENGTH`

**Valor por defecto:** `500` caracteres

**Ubicación en código:** `backend/security.py`, `backend/prompt_filter.py`, `backend/config.py`

**Descripción:** Longitud máxima permitida para preguntas. Si se excede, se aplica truncamiento automático.

**Comportamiento:**
- Si la pregunta excede `MAX_QUESTION_LENGTH` caracteres, se trunca automáticamente
- **No se retorna error** (truncamiento silencioso)
- Se procesa con los primeros `MAX_QUESTION_LENGTH` caracteres

**Ejemplo:**
```python
# En security.py
if len(pregunta_trim) > MAX_QUESTION_LENGTH:
    pregunta_trim = pregunta_trim[:MAX_QUESTION_LENGTH]
```

---

### System Prompt

#### `SYSTEM_PROMPT`

**Valor por defecto:** Prompt completo de ViajeIA (ver abajo)

**Ubicación en código:** `backend/main.py`, `backend/config.py`

**Descripción:** Define la personalidad, comportamiento y formato de respuesta del asistente de IA.

**Estructura del Prompt por Defecto:**

```
Eres ViajeIA, un asistente virtual experto en viajes con más de 15 años de experiencia 
ayudando a viajeros a crear experiencias inolvidables. Tienes una personalidad entusiasta, amigable y 
apasionada por los viajes.

CARACTERÍSTICAS DE TU PERSONALIDAD:
- Eres entusiasta y positivo sobre los viajes
- Haces preguntas inteligentes para entender mejor las necesidades del viajero
- Compartes consejos prácticos basados en experiencia real
- Usas un tono conversacional pero profesional
- Te emocionas cuando alguien planea un viaje especial

ESPECIALIZACIÓN:
- Planificación de itinerarios detallados día por día
- Recomendaciones de destinos según presupuesto, intereses y temporada
- Consejos para encontrar vuelos, hoteles y transporte
- Tips de viajero experimentado (qué llevar, qué evitar, cómo ahorrar)
- Recomendaciones gastronómicas y culturales
- Planificación de presupuestos realistas

FORMATO DE RESPUESTA (OBLIGATORIO):
SIEMPRE debes responder usando EXACTAMENTE esta estructura con estos símbolos:

» ALOJAMIENTO: [recomendaciones de hoteles, hostales, o alojamientos según el presupuesto]

Þ COMIDA LOCAL: [recomendaciones de restaurantes, platos típicos, y experiencias gastronómicas]

LUGARES IMPERDIBLES: [lugares que definitivamente debe visitar el viajero]

ä CONSEJOS LOCALES: [tips especiales, qué evitar, costumbres locales, secretos del destino]

ø ESTIMACIÓN DE COSTOS: [desglose aproximado de gastos por categoría basado en el presupuesto]

REGLAS IMPORTANTES:
- NUNCA cambies estos símbolos (», Þ, , ä, ø)
- SIEMPRE incluye las 5 secciones en este orden exacto
- Si falta información, usa la información del contexto del formulario o haz suposiciones razonables
- Mantén un tono entusiasta pero informativo
- Personaliza cada sección según el destino, presupuesto y preferencias del usuario
- Responde siempre en español
- Si hay información del clima actual, inclúyela naturalmente en tus respuestas, especialmente en los consejos locales
```

**Personalización:**

Puedes personalizar el system prompt configurando la variable de entorno `SYSTEM_PROMPT`:

```env
SYSTEM_PROMPT="Eres un asistente de viajes personalizado. Tu misión es..."
```

**Nota:** Si personalizas el prompt, asegúrate de mantener las instrucciones de formato si quieres conservar la estructura de respuesta.

---

### Constantes de Rate Limiting

#### `RATE_LIMIT_PLANIFICAR`

**Valor por defecto:** `5` consultas por minuto

**Ubicación en código:** `backend/rate_limiter.py`, `backend/config.py`

**Descripción:** Límite de consultas al endpoint `/api/planificar` por minuto por usuario.

#### `RATE_LIMIT_ESTADISTICAS`

**Valor por defecto:** `10` consultas por minuto

**Ubicación en código:** `backend/rate_limiter.py`, `backend/config.py`

**Descripción:** Límite de consultas al endpoint `/api/estadisticas` por minuto.

---

## Configuración por Entorno

### Desarrollo (Development)

**Archivo:** `backend/.env`

```env
# IA
OPENAI_API_KEY=sk-tu-api-key-desarrollo
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1500
AI_TEMPERATURE=0.8

# Servidor
PORT=8000
FLASK_ENV=development

# Validación
MIN_QUESTION_LENGTH=10
MAX_QUESTION_LENGTH=500

# Rate Limiting
RATE_LIMIT_PLANIFICAR=5
RATE_LIMIT_ESTADISTICAS=10

# Servicios Externos (Opcionales)
OPENWEATHER_API_KEY=tu-key-opcional
UNSPLASH_API_KEY=tu-key-opcional

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Producción (Production)

**Archivo:** `backend/.env`

```env
# IA
OPENAI_API_KEY=sk-tu-api-key-produccion
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7

# Servidor
PORT=8080
FLASK_ENV=production

# Validación
MIN_QUESTION_LENGTH=10
MAX_QUESTION_LENGTH=500

# Rate Limiting (más restrictivo en producción)
RATE_LIMIT_PLANIFICAR=3
RATE_LIMIT_ESTADISTICAS=5

# Servicios Externos
OPENWEATHER_API_KEY=tu-key-produccion
UNSPLASH_API_KEY=tu-key-produccion

# CORS
ALLOWED_ORIGINS=https://viajeia.com,https://www.viajeia.com
```

### Testing

**Archivo:** `backend/.env.test`

```env
# IA (puede usar un modelo más económico para testing)
OPENAI_API_KEY=sk-tu-api-key-test
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
AI_TEMPERATURE=0.5

# Servidor
PORT=8001
FLASK_ENV=development

# Validación (más permisivo para testing)
MIN_QUESTION_LENGTH=5
MAX_QUESTION_LENGTH=1000

# Rate Limiting (más permisivo para testing)
RATE_LIMIT_PLANIFICAR=100
RATE_LIMIT_ESTADISTICAS=100
```

---

## Ejemplos de Configuración

### Ejemplo 1: Configuración Mínima

Solo las variables requeridas:

```env
OPENAI_API_KEY=sk-tu-api-key-aqui
```

### Ejemplo 2: Configuración Completa

Todas las variables configuradas:

```env
# IA
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
OPENAI_MAX_CONTEXT_TOKENS=4000
AI_TEMPERATURE=0.8

# Servidor
PORT=8000
FLASK_ENV=development

# Validación
MIN_QUESTION_LENGTH=10
MAX_QUESTION_LENGTH=500
SYSTEM_PROMPT="Eres un asistente experto en viajes..."

# Rate Limiting
RATE_LIMIT_PLANIFICAR=5
RATE_LIMIT_ESTADISTICAS=10

# Servicios Externos
OPENWEATHER_API_KEY=abc123def456ghi789jkl012mno345pqr
UNSPLASH_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://viajeia.com
```

### Ejemplo 3: Usando Gemini en lugar de OpenAI

```env
# Usar Gemini
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567

# OpenAI (opcional, como respaldo)
OPENAI_API_KEY=sk-tu-api-key-aqui

# Configuración
AI_TEMPERATURE=0.8
```

**Nota:** Requiere modificar el código para usar el SDK de Gemini.

---

## Validación de Configuración

### Verificar Variables Requeridas

La aplicación valida automáticamente las variables requeridas al iniciar:

```python
# En main.py
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Por favor, configura OPENAI_API_KEY en tu archivo .env")
```

### Verificar Configuración

Puedes verificar la configuración usando el endpoint de health:

```bash
curl http://localhost:8000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "openai": "operational",
    "openweather": "operational",
    "unsplash": "operational"
  }
}
```

Si un servicio no está configurado, aparecerá como `"not_configured"`.

---

## Tabla Resumen de Variables

| Variable | Tipo | Requerida | Default | Descripción |
|----------|------|-----------|---------|-------------|
| `OPENAI_API_KEY` | String | ✅ Sí | - | API Key de OpenAI |
| `GEMINI_API_KEY` | String | ❌ No | - | API Key de Google Gemini |
| `OPENAI_MODEL` | String | ❌ No | `gpt-3.5-turbo` | Modelo de OpenAI a usar |
| `OPENAI_MAX_TOKENS` | Integer | ❌ No | `1500` | Máximo de tokens por respuesta |
| `OPENAI_MAX_CONTEXT_TOKENS` | Integer | ❌ No | `3000` | Máximo de tokens de contexto |
| `AI_TEMPERATURE` | Float | ❌ No | `0.8` | Temperature para generación |
| `PORT` | Integer | ❌ No | `8000` | Puerto del servidor |
| `FLASK_ENV` | String | ❌ No | `development` | Entorno de ejecución |
| `MIN_QUESTION_LENGTH` | Integer | ❌ No | `10` | Longitud mínima de preguntas |
| `MAX_QUESTION_LENGTH` | Integer | ❌ No | `500` | Longitud máxima de preguntas |
| `SYSTEM_PROMPT` | String | ❌ No | Prompt por defecto | System prompt personalizado |
| `RATE_LIMIT_PLANIFICAR` | Integer | ❌ No | `5` | Límite de consultas/min (planificar) |
| `RATE_LIMIT_ESTADISTICAS` | Integer | ❌ No | `10` | Límite de consultas/min (estadísticas) |
| `OPENWEATHER_API_KEY` | String | ❌ No | - | API Key de OpenWeatherMap |
| `UNSPLASH_API_KEY` | String | ❌ No | - | API Key de Unsplash |
| `ALLOWED_ORIGINS` | String | ❌ No | `http://localhost:3000` | Orígenes permitidos (CORS) |

---

## Mejores Prácticas

### Seguridad

1. **Nunca versiones el archivo `.env`** en Git
2. **Usa diferentes API Keys** para desarrollo y producción
3. **Rota las API Keys** periódicamente
4. **No compartas** tus API Keys públicamente

### Performance

1. **Ajusta `OPENAI_MAX_TOKENS`** según tus necesidades (más alto = más costoso)
2. **Usa `gpt-3.5-turbo`** para desarrollo (más económico)
3. **Usa `gpt-4`** solo cuando necesites máxima precisión

### Desarrollo

1. **Usa `FLASK_ENV=development`** para recarga automática
2. **Configura `ALLOWED_ORIGINS`** correctamente para CORS
3. **Mantén logs activos** en desarrollo para debugging

---

## Solución de Problemas

### Error: "OPENAI_API_KEY no configurada"

**Solución:**
1. Verifica que el archivo `.env` existe en `backend/`
2. Verifica que la variable se llama exactamente `OPENAI_API_KEY`
3. Verifica que no hay espacios extra en el valor
4. Reinicia el servidor después de modificar `.env`

### Error: "Port already in use"

**Solución:**
1. Cambia el `PORT` en `.env` a otro puerto (ej: 8001)
2. O termina el proceso que está usando el puerto

### Variables no se cargan

**Solución:**
1. Verifica que `python-dotenv` está instalado: `pip install python-dotenv`
2. Verifica que `load_dotenv()` se llama al inicio del archivo
3. Reinicia el servidor

---

## Referencias

- [Documentación de OpenAI](https://platform.openai.com/docs)
- [Documentación de Google Gemini](https://ai.google.dev/docs)
- [Documentación de FastAPI](https://fastapi.tiangolo.com/)
- [Documentación de python-dotenv](https://pypi.org/project/python-dotenv/)

---

**Última actualización:** Enero 2024  
**Mantenido por:** Equipo ViajeIA

