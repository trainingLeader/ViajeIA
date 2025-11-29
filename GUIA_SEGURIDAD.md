# 🔒 Guía Completa de Seguridad y Buenas Prácticas - ViajeIA

Esta guía te enseñará paso a paso cómo mejorar la seguridad de tu aplicación, explicando cada concepto de forma simple y aplicándolo directamente a tu código.

---

## 📚 Tabla de Contenidos

1. [Validación de Datos](#1-validación-de-datos)
2. [Sanitización de Entrada](#2-sanitización-de-entrada)
3. [Manejo Seguro de Contraseñas](#3-manejo-seguro-de-contraseñas)
4. [Protección contra Ataques Comunes](#4-protección-contra-ataques-comunes)
5. [Rate Limiting](#5-rate-limiting)
6. [Manejo Seguro de Errores](#6-manejo-seguro-de-errores)
7. [Variables de Entorno](#7-variables-de-entorno)
8. [Reglas de Seguridad Firebase](#8-reglas-de-seguridad-firebase)
9. [Headers de Seguridad](#9-headers-de-seguridad)
10. [Logging y Monitoreo](#10-logging-y-monitoreo)

---

## 1. Validación de Datos

### ¿Qué es?
Validar datos significa verificar que la información que recibe tu aplicación es correcta y segura antes de usarla.

### ¿Por qué es importante?
Sin validación, un usuario malintencionado podría enviar datos peligrosos que rompan tu aplicación o comprometan la seguridad.

### Ejemplo práctico en tu código:

**❌ ANTES (Inseguro):**
```javascript
// En Registro.jsx - línea 31
if (!nombre.trim()) {
  setError('El nombre es obligatorio')
  return
}
```

**✅ DESPUÉS (Seguro):**
```javascript
// Validación mejorada
function validarNombre(nombre) {
  // Eliminar espacios al inicio y final
  nombre = nombre.trim()
  
  // Verificar que no esté vacío
  if (!nombre) {
    return { valido: false, error: 'El nombre es obligatorio' }
  }
  
  // Verificar longitud mínima y máxima
  if (nombre.length < 2) {
    return { valido: false, error: 'El nombre debe tener al menos 2 caracteres' }
  }
  
  if (nombre.length > 50) {
    return { valido: false, error: 'El nombre no puede exceder 50 caracteres' }
  }
  
  // Verificar que solo contenga letras, espacios y algunos caracteres especiales
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/
  if (!regex.test(nombre)) {
    return { valido: false, error: 'El nombre solo puede contener letras y espacios' }
  }
  
  return { valido: true, nombre: nombre }
}
```

---

## 2. Sanitización de Entrada

### ¿Qué es?
Sanitizar significa limpiar los datos de entrada para eliminar caracteres peligrosos que podrían ejecutar código malicioso.

### ¿Por qué es importante?
Previene ataques XSS (Cross-Site Scripting) donde un atacante inyecta código JavaScript malicioso.

### Ejemplo práctico:

**❌ ANTES (Vulnerable a XSS):**
```javascript
// Si muestras directamente lo que el usuario escribió:
<div>{pregunta}</div>  // Peligroso si pregunta contiene <script>alert('hack')</script>
```

**✅ DESPUÉS (Seguro):**
```javascript
// React automáticamente escapa el HTML, pero es mejor ser explícito
function sanitizarTexto(texto) {
  if (!texto) return ''
  
  // Eliminar etiquetas HTML peligrosas
  return texto
    .replace(/</g, '&lt;')  // Reemplazar < por &lt;
    .replace(/>/g, '&gt;')  // Reemplazar > por &gt;
    .replace(/"/g, '&quot;') // Reemplazar " por &quot;
    .replace(/'/g, '&#x27;') // Reemplazar ' por &#x27;
    .replace(/\//g, '&#x2F;') // Reemplazar / por &#x2F;
    .trim()
    .substring(0, 1000) // Limitar longitud máxima
}

// Usar en el componente:
<div>{sanitizarTexto(pregunta)}</div>
```

---

## 3. Manejo Seguro de Contraseñas

### ¿Qué es?
Asegurarse de que las contraseñas sean fuertes y nunca se almacenen en texto plano.

### ¿Por qué es importante?
Las contraseñas débiles son fáciles de adivinar. Las contraseñas en texto plano pueden ser robadas.

### Ejemplo práctico:

**❌ ANTES (Contraseña débil aceptada):**
```javascript
if (password.length < 6) {
  setError('La contraseña debe tener al menos 6 caracteres')
  return
}
```

**✅ DESPUÉS (Contraseña fuerte requerida):**
```javascript
function validarContraseña(password) {
  const errores = []
  
  // Longitud mínima
  if (password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres')
  }
  
  // Longitud máxima (prevenir ataques de fuerza bruta con contraseñas muy largas)
  if (password.length > 128) {
    errores.push('La contraseña no puede exceder 128 caracteres')
  }
  
  // Debe tener al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    errores.push('La contraseña debe contener al menos una letra mayúscula')
  }
  
  // Debe tener al menos una letra minúscula
  if (!/[a-z]/.test(password)) {
    errores.push('La contraseña debe contener al menos una letra minúscula')
  }
  
  // Debe tener al menos un número
  if (!/[0-9]/.test(password)) {
    errores.push('La contraseña debe contener al menos un número')
  }
  
  // Debe tener al menos un carácter especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errores.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*)')
  }
  
  // Verificar contraseñas comunes (lista de las 100 más comunes)
  const contraseñasComunes = ['password', '12345678', 'qwerty', 'abc123', 'password123']
  if (contraseñasComunes.includes(password.toLowerCase())) {
    errores.push('Esta contraseña es muy común. Por favor elige una más segura')
  }
  
  return {
    valida: errores.length === 0,
    errores: errores
  }
}
```

**✅ IMPORTANTE:** Firebase Auth ya encripta las contraseñas automáticamente, así que no necesitas hacerlo manualmente. ¡Eso está bien!

---

## 4. Protección contra Ataques Comunes

### 4.1 SQL Injection (No aplica directamente, pero importante entender)

**¿Qué es?** Intentar ejecutar código SQL malicioso a través de formularios.

**En tu caso:** Como usas Firebase (NoSQL), no hay riesgo de SQL Injection, pero siempre valida la entrada.

### 4.2 XSS (Cross-Site Scripting)

**¿Qué es?** Inyectar código JavaScript malicioso en tu aplicación.

**Protección en tu código:**

```javascript
// En el backend (main.py)
from html import escape

@app.post("/api/planificar")
async def planificar_viaje(request: PreguntaRequest):
    # Sanitizar la pregunta antes de procesarla
    pregunta_sanitizada = escape(request.pregunta)
    # ... resto del código
```

### 4.3 CSRF (Cross-Site Request Forgery)

**¿Qué es?** Hacer que un usuario autenticado ejecute acciones sin su conocimiento.

**Protección:** FastAPI tiene protección CSRF incorporada. Asegúrate de usar tokens en formularios críticos.

---

## 5. Rate Limiting

### ¿Qué es?
Limitar la cantidad de peticiones que un usuario puede hacer en un período de tiempo.

### ¿Por qué es importante?
Previene ataques de fuerza bruta y abuso del sistema.

### Ejemplo práctico:

**Instalar dependencia:**
```bash
cd backend
pip install slowapi
```

**Implementar en backend:**

```python
# En main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configurar rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Aplicar límites a los endpoints
@app.post("/api/planificar")
@limiter.limit("10/minute")  # Máximo 10 peticiones por minuto
async def planificar_viaje(request: Request, pregunta_request: PreguntaRequest):
    # ... código existente
```

---

## 6. Manejo Seguro de Errores

### ¿Qué es?
No revelar información sensible cuando ocurre un error.

### ❌ ANTES (Revela información sensible):
```python
except Exception as e:
    raise HTTPException(
        status_code=500,
        detail=f"Error al procesar: {str(e)}"  # ⚠️ Revela detalles del error
    )
```

### ✅ DESPUÉS (Seguro):
```python
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/api/planificar")
async def planificar_viaje(request: PreguntaRequest):
    try:
        # ... código
    except Exception as e:
        # Log el error completo (solo en servidor, no al usuario)
        logger.error(f"Error al procesar consulta: {str(e)}", exc_info=True)
        
        # Mensaje genérico al usuario
        raise HTTPException(
            status_code=500,
            detail="Error al procesar tu solicitud. Por favor intenta más tarde."
        )
```

---

## 7. Variables de Entorno

### ¿Qué es?
Almacenar información sensible (como API keys) fuera del código.

### ✅ Ya lo tienes bien implementado:

```python
# En main.py - línea 18
openai_api_key = os.getenv("OPENAI_API_KEY")
```

### ⚠️ Mejoras adicionales:

```python
# Validar que las variables críticas existan
required_env_vars = {
    "OPENAI_API_KEY": "OpenAI API Key es requerida"
}

for var, mensaje in required_env_vars.items():
    if not os.getenv(var):
        raise ValueError(f"Error de configuración: {mensaje}")
```

**NUNCA hagas esto:**
```python
# ❌ MAL - Nunca hardcodees API keys
api_key = "sk-1234567890abcdef"
```

---

## 8. Reglas de Seguridad Firebase

### ¿Qué es?
Reglas que controlan quién puede leer y escribir datos en Firebase.

### ✅ Reglas seguras para tu proyecto:

```json
{
  "rules": {
    "usuarios": {
      "$userId": {
        // Solo el usuario autenticado puede leer/escribir sus propios datos
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        // Validar que el email coincida con el usuario autenticado
        "email": {
          ".validate": "newData.val() === auth.token.email"
        },
        // Validar formato del nombre
        "nombre": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 50"
        }
      }
    },
    "consultas": {
      "$userId": {
        // Solo el usuario puede ver sus propias consultas
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        "$consultaId": {
          // Validar que la consulta pertenezca al usuario
          "usuarioId": {
            ".validate": "newData.val() === auth.uid"
          },
          // Validar longitud de la pregunta
          "pregunta": {
            ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 1000"
          }
        }
      }
    }
  }
}
```

---

## 9. Headers de Seguridad

### ¿Qué es?
Headers HTTP que le dicen al navegador cómo comportarse de forma segura.

### Implementar en backend:

```python
# En main.py
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Agregar headers de seguridad
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response
```

---

## 10. Logging y Monitoreo

### ¿Qué es?
Registrar eventos importantes para detectar problemas y ataques.

### Implementar logging mejorado:

```python
# Crear archivo: backend/logger.py
import logging
import os
from datetime import datetime

def setup_logger():
    # Crear directorio de logs si no existe
    os.makedirs("logs", exist_ok=True)
    
    # Configurar logger
    logger = logging.getLogger("viajeia")
    logger.setLevel(logging.INFO)
    
    # Formato de los logs
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Handler para archivo
    file_handler = logging.FileHandler(
        f"logs/viajeia_{datetime.now().strftime('%Y%m%d')}.log"
    )
    file_handler.setFormatter(formatter)
    
    # Handler para consola
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Usar en main.py
logger = setup_logger()

@app.post("/api/planificar")
async def planificar_viaje(request: PreguntaRequest):
    logger.info(f"Nueva consulta recibida: {request.pregunta[:50]}...")
    # ... resto del código
```

---

## 📋 Checklist de Seguridad

Usa esta lista para verificar que tu aplicación esté segura:

### Frontend
- [ ] Validación de todos los campos de entrada
- [ ] Sanitización de datos antes de mostrar
- [ ] Validación de contraseñas fuertes
- [ ] Manejo seguro de errores (no revelar información sensible)
- [ ] Variables de entorno para configuración sensible

### Backend
- [ ] Validación de entrada en todos los endpoints
- [ ] Rate limiting implementado
- [ ] Logging de eventos importantes
- [ ] Manejo seguro de errores
- [ ] Variables de entorno para API keys
- [ ] Headers de seguridad configurados

### Firebase
- [ ] Reglas de seguridad configuradas
- [ ] Solo usuarios autenticados pueden acceder a sus datos
- [ ] Validación de datos en las reglas

---

## 🎯 Próximos Pasos

1. Implementa las validaciones mejoradas en el frontend
2. Agrega rate limiting al backend
3. Configura las reglas de seguridad de Firebase
4. Implementa logging mejorado
5. Revisa regularmente los logs para detectar actividad sospechosa

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)

---

¡Recuerda: La seguridad es un proceso continuo, no un destino! 🔒

