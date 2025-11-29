# 🔒 Guía de Privacidad y Protección de Datos - ViajeIA

Esta guía explica cómo ViajeIA protege tu privacidad y maneja tus datos personales.

---

## 📋 Principios de Privacidad

### 1. **Minimización de Datos**
Solo recopilamos los datos estrictamente necesarios para brindar el servicio.

### 2. **Consentimiento Explícito**
Siempre pedimos tu consentimiento antes de guardar cualquier dato personal.

### 3. **Seguridad**
Todos los datos se almacenan y transmiten de forma segura.

### 4. **Transparencia**
Te informamos claramente qué datos recopilamos y cómo los usamos.

---

## 🔐 Seguridad de Contraseñas

### ⚠️ IMPORTANTE: Firebase Auth ya encripta las contraseñas automáticamente

**No necesitas hacer nada adicional.** Firebase Authentication:
- ✅ Encripta automáticamente todas las contraseñas
- ✅ Usa algoritmos seguros (bcrypt, scrypt, etc.)
- ✅ Nunca almacena contraseñas en texto plano
- ✅ Ni siquiera los desarrolladores pueden ver las contraseñas

### ¿Cómo funciona internamente?

Firebase Auth usa estos métodos de seguridad:

1. **Hashing con Salt**: Cada contraseña se "hashea" con un valor único (salt)
2. **Algoritmos seguros**: Usa bcrypt o scrypt (dependiendo de la configuración)
3. **Múltiples rondas**: Aplica el algoritmo múltiples veces para mayor seguridad

### Ejemplo conceptual (para entender):

```javascript
// ❌ NUNCA hagas esto (Firebase lo hace automáticamente):
// const contraseñaEnTexto = "miContraseña123"  // MAL

// ✅ Lo que Firebase hace internamente (simplificado):
// const salt = generarSaltUnico()
// const hash = bcrypt.hash(contraseña + salt, 10)  // 10 rondas
// Guarda: { hash: "abc123...", salt: "xyz789..." }
// Nunca guarda la contraseña original
```

**En tu código, simplemente usa Firebase Auth:**
```javascript
// Firebase Auth maneja todo automáticamente
await createUserWithEmailAndPassword(auth, email, password)
// ✅ La contraseña se encripta automáticamente
```

---

## 📝 Datos que Recopilamos

### Datos Obligatorios (para crear cuenta):
- ✅ **Nombre completo**: Para personalizar la experiencia
- ✅ **Correo electrónico**: Para autenticación y comunicación
- ✅ **Contraseña**: Encriptada automáticamente por Firebase (nunca en texto plano)

### Datos Opcionales (solo si los compartes):
- ✅ **Destino de viaje**: Para recomendaciones personalizadas
- ✅ **Fechas de viaje**: Para sugerencias según temporada
- ✅ **Presupuesto**: Para recomendaciones acordes a tu presupuesto
- ✅ **Preferencias**: Aventura, cultura, relajación, etc.

### Datos que NO Recopilamos:
- ❌ Información de tarjetas de crédito
- ❌ Dirección física completa
- ❌ Número de teléfono
- ❌ Información de redes sociales
- ❌ Datos biométricos

---

## 🛡️ Cómo Protegemos tus Datos

### 1. Encriptación en Tránsito
- ✅ Todas las comunicaciones usan HTTPS (SSL/TLS)
- ✅ Los datos se transmiten de forma encriptada

### 2. Encriptación en Reposo
- ✅ Firebase encripta todos los datos almacenados
- ✅ Las contraseñas nunca se almacenan en texto plano

### 3. Control de Acceso
- ✅ Solo tú puedes acceder a tus propios datos
- ✅ Reglas de seguridad de Firebase protegen tus datos
- ✅ Ni siquiera los desarrolladores pueden ver tus contraseñas

### 4. Minimización de Datos
- ✅ Solo guardamos lo necesario
- ✅ Eliminamos datos antiguos automáticamente
- ✅ Puedes eliminar tu cuenta y todos tus datos en cualquier momento

---

## ✅ Consentimiento Implementado

### En el Registro:

1. **Checkbox de Consentimiento**:
   ```jsx
   <input type="checkbox" />
   Acepto la Política de Privacidad y consiento el procesamiento de mis datos
   ```

2. **Política de Privacidad Completa**:
   - Se muestra en un modal antes de registrarse
   - Debe ser leída y aceptada explícitamente
   - No se puede crear cuenta sin aceptar

3. **Información Clara**:
   - Explica qué datos se recopilan
   - Explica cómo se usan
   - Explica tus derechos

---

## 🔧 Implementación Técnica

### Estructura de Datos en Firebase:

```
usuarios/
  └── [userId]/
      ├── nombre: "Juan Pérez"          ✅ Solo nombre
      ├── email: "juan@ejemplo.com"      ✅ Solo email
      └── fechaRegistro: "2024-01-15"    ✅ Fecha de registro

consultas/
  └── [userId]/
      └── [consultaId]/
          ├── pregunta: "..."            ✅ Solo la pregunta
          ├── destino: "París"           ✅ Solo el destino
          └── fechaViaje: "2024-06-15"   ✅ Solo la fecha

rateLimiting/
  └── [userId]/
      └── consultas/
          └── [consultaId]/
              └── timestamp: 1234567890  ✅ Solo timestamp
```

**Lo que NO guardamos:**
- ❌ Contraseñas (Firebase Auth las maneja por separado, encriptadas)
- ❌ Información de pago
- ❌ Direcciones físicas
- ❌ Números de teléfono

---

## 📜 Política de Privacidad

La política de privacidad incluye:

1. **Información que recopilamos** - Qué datos guardamos
2. **Cómo usamos tu información** - Para qué se usa
3. **Seguridad de tus datos** - Cómo los protegemos
4. **Compartir información** - Con quién compartimos (spoiler: casi nadie)
5. **Tus derechos** - Qué puedes hacer con tus datos
6. **Retención de datos** - Cuánto tiempo guardamos tus datos
7. **Cookies** - Qué tecnologías usamos
8. **Contacto** - Cómo contactarnos

---

## 🎯 Buenas Prácticas Implementadas

### ✅ Consentimiento Explícito
- Checkbox obligatorio antes de registrarse
- Política de privacidad visible y accesible
- No se puede crear cuenta sin aceptar

### ✅ Minimización de Datos
- Solo pedimos lo necesario
- Los campos opcionales están claramente marcados
- No recopilamos datos innecesarios

### ✅ Seguridad
- Contraseñas encriptadas automáticamente (Firebase)
- Datos transmitidos por HTTPS
- Reglas de seguridad en Firebase

### ✅ Transparencia
- Política de privacidad clara y completa
- Explicación de qué datos se usan y por qué
- Información sobre derechos del usuario

---

## 🔍 Verificación de Seguridad

### ¿Cómo verificar que tu contraseña está segura?

1. **En Firebase Console**:
   - Ve a Authentication → Users
   - Verás el email del usuario
   - **NO verás la contraseña** (solo un indicador de que está encriptada)

2. **En el código**:
   ```javascript
   // ✅ CORRECTO - Firebase maneja la encriptación
   await createUserWithEmailAndPassword(auth, email, password)
   
   // ❌ INCORRECTO - Nunca hagas esto
   // await set(ref(database, `usuarios/${uid}/password`), password)
   ```

---

## 📊 Comparación: Antes vs Después

### ❌ ANTES (Inseguro):
```javascript
// Guardar contraseña en texto plano (NUNCA hacer esto)
await set(ref(database, `usuarios/${uid}`), {
  nombre: nombre,
  email: email,
  password: password  // ⚠️ PELIGROSO - Contraseña en texto plano
})
```

### ✅ DESPUÉS (Seguro):
```javascript
// Firebase Auth maneja la contraseña automáticamente
await createUserWithEmailAndPassword(auth, email, password)
// ✅ La contraseña se encripta automáticamente

// Solo guardamos datos no sensibles
await set(ref(database, `usuarios/${uid}`), {
  nombre: nombre,
  email: email
  // ✅ NO guardamos la contraseña
})
```

---

## 🛠️ Si Necesitaras Encriptar Manualmente (No necesario con Firebase)

**Nota**: Con Firebase Auth NO necesitas hacer esto, pero aquí está cómo sería:

### Usando bcrypt (solo para referencia):

```javascript
// Instalar: npm install bcryptjs
import bcrypt from 'bcryptjs'

// Al crear usuario
const saltRounds = 10
const hash = await bcrypt.hash(password, saltRounds)
// Guardar hash, nunca la contraseña original

// Al verificar login
const isValid = await bcrypt.compare(password, hash)
```

**Pero con Firebase Auth, esto ya está hecho automáticamente.** ✅

---

## 📋 Checklist de Privacidad

- [x] Consentimiento explícito antes de recopilar datos
- [x] Política de privacidad clara y accesible
- [x] Solo recopilar datos necesarios
- [x] Contraseñas encriptadas (Firebase Auth)
- [x] Datos transmitidos por HTTPS
- [x] Reglas de seguridad en Firebase
- [x] Usuario puede eliminar sus datos
- [x] Información clara sobre uso de datos

---

## 🎯 Derechos del Usuario

Como usuario de ViajeIA, tienes derecho a:

1. **Acceso**: Ver qué datos tenemos sobre ti
2. **Rectificación**: Corregir datos incorrectos
3. **Eliminación**: Eliminar tu cuenta y todos tus datos
4. **Portabilidad**: Exportar tus datos (próximamente)
5. **Oposición**: Retirar tu consentimiento en cualquier momento

---

## 📚 Archivos Relacionados

- `frontend/src/components/PoliticaPrivacidad.jsx` - Componente de política
- `frontend/src/components/Registro.jsx` - Formulario con consentimiento
- `FIREBASE_RULES_SEGURAS.json` - Reglas de seguridad

---

## 🔒 Resumen de Seguridad

### Contraseñas:
- ✅ Encriptadas automáticamente por Firebase Auth
- ✅ Nunca almacenadas en texto plano
- ✅ Ni los desarrolladores pueden verlas

### Datos Personales:
- ✅ Solo lo necesario (nombre, email)
- ✅ Con consentimiento explícito
- ✅ Protegidos por reglas de Firebase

### Transmisión:
- ✅ HTTPS en todas las comunicaciones
- ✅ Datos encriptados en tránsito

---

¡Tu aplicación ahora cumple con los principios de privacidad y protección de datos! 🔒

