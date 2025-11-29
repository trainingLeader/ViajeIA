# 🔥 Guía Paso a Paso: Configurar Firebase para ViajeIA

Esta guía te ayudará a configurar Firebase paso a paso para la autenticación y almacenamiento de datos en ViajeIA.

---

## 📋 Requisitos Previos

- ✅ Una cuenta de Google (para acceder a Firebase)
- ✅ Tu proyecto ViajeIA funcionando localmente

---

## PARTE 1: Crear un Proyecto en Firebase

### Paso 1: Acceder a Firebase Console

1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Agregar proyecto"** o **"Add project"**

### Paso 2: Configurar el Proyecto

1. **Nombre del proyecto**: Escribe `ViajeIA` (o el nombre que prefieras)
2. Haz clic en **"Continuar"**

### Paso 3: Configurar Google Analytics (Opcional)

- Puedes activar o desactivar Google Analytics
- Para este proyecto, es opcional
- Haz clic en **"Continuar"** y luego **"Crear proyecto"**
- Espera 30-60 segundos mientras Firebase crea tu proyecto
- Haz clic en **"Continuar"** cuando esté listo

---

## PARTE 2: Configurar Authentication (Autenticación)

### Paso 1: Activar Authentication

1. En el menú lateral izquierdo, haz clic en **"Authentication"** o **"Autenticación"**
2. Haz clic en **"Comenzar"** o **"Get started"**

### Paso 2: Habilitar Email/Password

1. Haz clic en la pestaña **"Sign-in method"** o **"Método de acceso"**
2. Busca **"Correo electrónico/Contraseña"** o **"Email/Password"**
3. Haz clic en ella
4. Activa el botón en la parte superior
5. Haz clic en **"Guardar"**

¡Listo! Ya tienes la autenticación por correo/contraseña habilitada.

---

## PARTE 3: Configurar Realtime Database

### Paso 1: Crear la Base de Datos

1. En el menú lateral, haz clic en **"Realtime Database"** o **"Base de datos en tiempo real"**
2. Haz clic en **"Crear base de datos"**

### Paso 2: Configurar Ubicación

1. Selecciona una **ubicación** cercana a ti (ej: `us-central1`, `southamerica-east1`)
2. Haz clic en **"Siguiente"**

### Paso 3: Configurar Reglas de Seguridad

**IMPORTANTE**: Para desarrollo inicial, usaremos reglas permisivas. En producción, deberás ajustarlas.

1. Elige **"Modo de prueba"** o **"Test mode"** (temporal)
2. Haz clic en **"Habilitar"**

**⚠️ ADVERTENCIA**: Las reglas de prueba permiten lectura/escritura a cualquiera por 30 días. Después deberás cambiarlas.

### Paso 4: Copiar la URL de la Base de Datos

1. Una vez creada, verás la URL de tu base de datos
2. **COPIA ESTA URL**, será algo como:
   ```
   https://viajeia-default-rtdb.firebaseio.com/
   ```
3. La necesitarás para la configuración

---

## PARTE 4: Obtener las Credenciales de Configuración

### Paso 1: Ir a Configuración del Proyecto

1. En el menú lateral, haz clic en el **ícono de engranaje** ⚙️
2. Selecciona **"Configuración del proyecto"** o **"Project settings"**

### Paso 2: Registrar una App Web

1. Baja hasta la sección **"Tus apps"** o **"Your apps"**
2. Haz clic en el ícono **`</>`** (Web)
3. En **"Apodo de la app"**, escribe: `ViajeIA Web`
4. **NO** marques "También configurar Firebase Hosting" (por ahora)
5. Haz clic en **"Registrar app"**

### Paso 3: Copiar las Credenciales

Verás un código JavaScript con las credenciales de Firebase. **COPIA ESTOS VALORES**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "viajeia.firebaseapp.com",
  databaseURL: "https://viajeia-default-rtdb.firebaseio.com",
  projectId: "viajeia",
  storageBucket: "viajeia.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Paso 4: Configurar en tu Código

1. Abre el archivo: `frontend/src/firebase/config.js`
2. Reemplaza los valores en `firebaseConfig` con los que copiaste:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_REAL",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "TU_APP_ID_REAL"
}
```

---

## PARTE 5: Configurar Reglas de Seguridad (IMPORTANTE)

### Paso 1: Ir a Realtime Database → Reglas

1. Ve a **Realtime Database** en el menú lateral
2. Haz clic en la pestaña **"Reglas"** o **"Rules"**

### Paso 2: Configurar Reglas de Seguridad

Reemplaza las reglas temporales con estas (permiten que solo usuarios autenticados lean/escriban sus propios datos):

```json
{
  "rules": {
    "usuarios": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "consultas": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

**Explicación de las reglas:**
- `usuarios`: Solo el usuario autenticado puede leer/escribir sus propios datos
- `consultas`: Solo el usuario autenticado puede leer/escribir sus propias consultas
- `auth.uid`: ID único del usuario autenticado

3. Haz clic en **"Publicar"** o **"Publish"**

---

## PARTE 6: Instalar Dependencias

Ejecuta en la terminal (dentro de la carpeta `frontend`):

```bash
npm install
```

Esto instalará Firebase y otras dependencias necesarias.

---

## ✅ Verificar que Todo Funciona

1. **Inicia tu aplicación localmente:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Abre tu navegador** en `http://localhost:3000`

3. **Prueba registrar un usuario:**
   - Haz clic en "Regístrate aquí"
   - Completa el formulario
   - Deberías poder crear una cuenta

4. **Verifica en Firebase Console:**
   - Ve a **Authentication** → **Users**
   - Deberías ver el usuario recién creado
   - Ve a **Realtime Database** → **Data**
   - Deberías ver la estructura con `usuarios` y datos del usuario

---

## 🔒 Seguridad en Producción

Cuando despliegues a producción:

1. **Ajusta las reglas de Realtime Database** para ser más restrictivas
2. **Configura dominios autorizados** en Authentication → Settings → Authorized domains
3. **Revisa los logs** regularmente para detectar actividad sospechosa

---

## 📊 Estructura de Datos en Firebase

Tu base de datos tendrá esta estructura:

```
viajeia-default-rtdb/
├── usuarios/
│   └── [userId]/
│       ├── nombre: "Juan Pérez"
│       ├── email: "juan@ejemplo.com"
│       └── fechaRegistro: "2024-01-15T10:30:00.000Z"
│
└── consultas/
    └── [userId]/
        └── [consultaId]/
            ├── pregunta: "¿Qué hacer en París?"
            ├── destino: "París"
            ├── fechaViaje: "2024-06-15"
            ├── presupuesto: "2000"
            ├── preferencias: ["cultura", "gastronomía"]
            ├── fechaConsulta: "2024-01-15T10:35:00.000Z"
            └── usuarioEmail: "juan@ejemplo.com"
```

---

## 🆘 Solución de Problemas

### ❌ Error: "Firebase: Error (auth/invalid-api-key)"
- **Solución**: Verifica que copiaste correctamente el `apiKey` en `config.js`

### ❌ Error: "Firebase: Error (auth/unauthorized-domain)"
- **Solución**: Ve a Authentication → Settings → Authorized domains y agrega tu dominio

### ❌ No se guardan datos en Realtime Database
- **Solución**: Verifica las reglas de seguridad y que el usuario esté autenticado

### ❌ Error de CORS
- **Solución**: Firebase maneja CORS automáticamente, pero verifica que `databaseURL` sea correcto

---

## 📚 Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Realtime Database](https://firebase.google.com/docs/database)

---

¡Listo! Tu aplicación ahora está conectada a Firebase y lista para usar autenticación y almacenamiento de datos. 🎉

