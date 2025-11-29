# 🛡️ Guía de Rate Limiting y Protección contra Abuso

Esta guía explica cómo funciona el sistema de protección contra uso excesivo implementado en ViajeIA.

---

## 📋 ¿Qué es Rate Limiting?

**Rate Limiting** (limitación de velocidad) es una técnica que controla cuántas veces un usuario puede hacer una acción en un período de tiempo determinado.

### ¿Por qué es importante?

1. **Previene abuso**: Evita que alguien haga miles de consultas y sature el sistema
2. **Controla costos**: Limita el uso de APIs pagas (como OpenAI)
3. **Mejora la experiencia**: Asegura que el servicio esté disponible para todos
4. **Protege la seguridad**: Dificulta ataques de fuerza bruta

---

## 🎯 Límites Implementados en ViajeIA

### Límites por Usuario Autenticado:

- **5 consultas por minuto** - Previene spam rápido
- **50 consultas por día** - Previene uso excesivo diario

### ¿Por qué estos números?

- **5 por minuto**: Suficiente para uso normal, pero evita spam
- **50 por día**: Más que suficiente para planificar varios viajes

---

## 🔧 Cómo Funciona

### 1. Estructura en Firebase

Los límites se guardan en Firebase Realtime Database con esta estructura:

```
rateLimiting/
  └── [userId]/
      ├── consultas/
      │   └── [consultaId]/
      │       ├── timestamp: 1234567890
      │       └── fecha: "2024-01-15T10:30:00.000Z"
      └── estadisticas/
          └── "2024-01-15": 5
```

### 2. Flujo de Verificación

```
Usuario hace consulta
    ↓
¿Está autenticado?
    ↓ SÍ
Verificar límites en Firebase
    ↓
¿Puede consultar?
    ↓ SÍ                    ↓ NO
Procesar consulta    Mostrar mensaje de límite
    ↓
Registrar consulta en Firebase
```

---

## 💻 Código Explicado

### Función: `verificarLimiteConsulta(userId)`

Esta función verifica si el usuario puede hacer una consulta:

```javascript
// 1. Obtiene todas las consultas del usuario
const snapshot = await get(consultasRef)
const consultas = snapshot.exists() ? snapshot.val() : {}

// 2. Filtra consultas del último minuto
const consultasUltimoMinuto = consultasArray.filter(
  consulta => consulta.timestamp >= ahora - 60
)

// 3. Filtra consultas del día actual
const consultasHoy = consultasArray.filter(
  consulta => consulta.timestamp >= inicioDia
)

// 4. Verifica límites
if (consultasUltimoMinuto.length >= 5) {
  return { puedeConsultar: false, mensaje: "..." }
}

if (consultasHoy.length >= 50) {
  return { puedeConsultar: false, mensaje: "..." }
}

// 5. Si pasa, puede consultar
return { puedeConsultar: true }
```

### Función: `registrarConsulta(userId)`

Registra una nueva consulta después de que se procesa:

```javascript
// 1. Crea nueva entrada de consulta
await set(nuevaConsultaRef, {
  timestamp: ahora,
  fecha: new Date().toISOString()
})

// 2. Actualiza estadísticas del día
stats[fechaHoy] += 1

// 3. Limpia consultas antiguas (más de 1 día)
// Para mantener la base de datos limpia
```

---

## 🎨 Componentes Visuales

### 1. ContadorConsultas

Muestra al usuario cuántas consultas ha hecho:

```
📊 Tus Consultas
Hoy: 15 / 50 [=====     ]
Último minuto: 2 / 5 [==      ]
```

**Características:**
- Se actualiza automáticamente cada 10 segundos
- Barras de progreso visuales
- Cambia de color cuando se acerca al límite

### 2. LimiteAlcanzado

Modal que aparece cuando se alcanza el límite:

```
⏱️ Límite de Consultas Alcanzado

Has alcanzado el límite de 5 consultas por minuto.
Espera 45 segundos.

Tiempo restante: 45 segundos

💡 ¿Por qué hay límites?
- Prevenir abuso del sistema
- Mantener el servicio disponible
- Controlar los costos
```

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Usuario hace 6 consultas en 1 minuto

```
Consulta 1-5: ✅ Permitidas
Consulta 6: ❌ Bloqueada
Mensaje: "Has alcanzado el límite de 5 consultas por minuto. Espera 30 segundos."
```

### Ejemplo 2: Usuario hace 51 consultas en un día

```
Consultas 1-50: ✅ Permitidas
Consulta 51: ❌ Bloqueada
Mensaje: "Has alcanzado el límite de 50 consultas por día. Podrás hacer más consultas en 3 horas."
```

---

## 🔧 Configurar Límites Diferentes

Puedes cambiar los límites editando `frontend/src/utils/rateLimiter.js`:

```javascript
const LIMITES = {
  POR_MINUTO: 10,    // Cambiar a 10 por minuto
  POR_DIA: 100       // Cambiar a 100 por día
}
```

---

## 🛠️ Integración en el Código

### En el componente Asistente:

```javascript
// ANTES de procesar la consulta
const verificacionLimite = await verificarLimiteConsulta(usuarioActual.uid)

if (!verificacionLimite.puedeConsultar) {
  // Mostrar mensaje de límite alcanzado
  setLimiteAlcanzado({
    mensaje: verificacionLimite.mensaje,
    tiempoRestante: verificacionLimite.tiempoRestante
  })
  return // No procesar la consulta
}

// DESPUÉS de procesar exitosamente
await registrarConsulta(usuarioActual.uid)
```

---

## 📈 Estadísticas de Uso

Puedes obtener estadísticas de uso de un usuario:

```javascript
import { obtenerEstadisticasUso } from '../utils/rateLimiter'

const stats = await obtenerEstadisticasUso(userId)
// Retorna:
// {
//   consultasHoy: 15,
//   consultasUltimoMinuto: 2,
//   consultasRestantesDia: 35,
//   consultasRestantesMinuto: 3
// }
```

---

## 🔒 Seguridad en Firebase

Las reglas de Firebase aseguran que:

1. **Solo el usuario puede ver sus propios límites**
   ```json
   ".read": "$userId === auth.uid"
   ```

2. **Solo el usuario puede registrar sus propias consultas**
   ```json
   ".write": "$userId === auth.uid"
   ```

3. **Los datos se validan antes de guardar**
   ```json
   "timestamp": {
     ".validate": "newData.isNumber() && newData.val() > 0"
   }
   ```

---

## 🎯 Casos de Uso

### Caso 1: Usuario Normal
- Hace 2-3 consultas por sesión
- ✅ Nunca alcanza los límites
- ✅ Experiencia fluida

### Caso 2: Usuario Activo
- Hace 10-15 consultas por día
- ✅ Está dentro de los límites
- ✅ Puede usar el servicio normalmente

### Caso 3: Usuario que Abusa
- Intenta hacer 100 consultas en 5 minutos
- ❌ Bloqueado después de 5 consultas
- ⏱️ Debe esperar antes de continuar

---

## 🐛 Solución de Problemas

### ❌ Los límites no funcionan
- Verifica que el usuario esté autenticado
- Verifica las reglas de Firebase
- Revisa la consola del navegador para errores

### ❌ El contador no se actualiza
- Verifica que `obtenerEstadisticasUso` se llame correctamente
- El contador se actualiza cada 10 segundos automáticamente

### ❌ Se permite más consultas de las permitidas
- Verifica que `verificarLimiteConsulta` se llame ANTES de procesar
- Verifica que `registrarConsulta` se llame DESPUÉS de procesar

---

## 📚 Archivos Relacionados

- `frontend/src/utils/rateLimiter.js` - Lógica de rate limiting
- `frontend/src/components/LimiteAlcanzado.jsx` - Modal de límite
- `frontend/src/components/ContadorConsultas.jsx` - Contador visual
- `frontend/src/components/Asistente.jsx` - Integración
- `FIREBASE_RULES_SEGURAS.json` - Reglas de seguridad

---

## ✅ Checklist de Implementación

- [x] Sistema de rate limiting con Firebase
- [x] Límites por minuto y por día
- [x] Verificación antes de procesar consultas
- [x] Registro de consultas después de procesar
- [x] Componente visual de límite alcanzado
- [x] Contador de consultas restantes
- [x] Limpieza automática de datos antiguos
- [x] Reglas de seguridad en Firebase

---

¡Tu aplicación ahora está protegida contra uso excesivo! 🛡️

