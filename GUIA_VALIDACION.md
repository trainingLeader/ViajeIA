# ✅ Guía de Validación de Entradas - ViajeIA

Esta guía explica cómo funciona la validación de entradas en tu aplicación y cómo se aplica en cada formulario.

---

## 📋 Resumen de Validaciones Implementadas

### ✅ Formulario de Registro
- **Nombre**: Validación de formato, longitud (2-50 caracteres), solo letras
- **Email**: Validación de formato, longitud máxima, caracteres peligrosos
- **Contraseña**: Validación de fuerza (8+ caracteres, mayúsculas, números, símbolos)
- **Confirmar Contraseña**: Verificación de coincidencia

### ✅ Formulario de Login
- **Email**: Validación de formato en tiempo real
- **Contraseña**: Verificación de que no esté vacía

### ✅ Formulario de Preferencias del Viaje
- **Destino**: Validación de formato, longitud (2-100 caracteres)
- **Fecha**: Validación de formato flexible (DD/MM/YYYY o texto)
- **Presupuesto**: Validación de número, rango ($10 - $1,000,000)
- **Preferencias**: Validación de opciones disponibles

### ✅ Formulario de Pregunta al Asistente
- **Pregunta**: Validación de longitud (5-1000 caracteres), contenido válido

---

## 🎯 Características de la Validación

### 1. Validación en Tiempo Real
Los errores se muestran **mientras el usuario escribe**, no solo al enviar el formulario.

**Ejemplo:**
```javascript
onChange={(e) => {
  setEmail(e.target.value)
  if (e.target.value.trim()) {
    const validacion = validarEmail(e.target.value)
    setErroresValidacion(prev => ({ 
      ...prev, 
      email: validacion.valido ? '' : validacion.error 
    }))
  }
}}
```

### 2. Validación al Perder el Foco (onBlur)
Cuando el usuario sale del campo, se valida nuevamente para asegurar que todo esté correcto.

### 3. Mensajes de Error Claros
Cada error tiene un mensaje específico y fácil de entender:
- ❌ "El correo electrónico es obligatorio"
- ❌ "El formato del correo electrónico no es válido"
- ❌ "La contraseña debe tener al menos 8 caracteres"

### 4. Indicadores Visuales
- Campos con error tienen borde rojo
- Mensajes de error aparecen debajo del campo
- El botón de envío se deshabilita si hay errores

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Validar Email

```javascript
import { validarEmail } from '../utils/validacion'

const [email, setEmail] = useState('')
const [errorEmail, setErrorEmail] = useState('')

// En el onChange del input
onChange={(e) => {
  setEmail(e.target.value)
  if (e.target.value.trim()) {
    const validacion = validarEmail(e.target.value)
    setErrorEmail(validacion.valido ? '' : validacion.error)
  }
}}
```

### Ejemplo 2: Validar Presupuesto

```javascript
import { validarPresupuesto } from '../utils/validacion'

const [presupuesto, setPresupuesto] = useState('')
const [errorPresupuesto, setErrorPresupuesto] = useState('')

onChange={(e) => {
  setPresupuesto(e.target.value)
  if (e.target.value.trim()) {
    const validacion = validarPresupuesto(e.target.value)
    setErrorPresupuesto(validacion.valido ? '' : validacion.error)
  }
}}
```

---

## 🔍 Funciones de Validación Disponibles

### `validarNombre(nombre)`
Valida un nombre de usuario.
- ✅ Longitud: 2-50 caracteres
- ✅ Solo letras, espacios y algunos caracteres especiales
- ✅ Retorna: `{ valido: boolean, error?: string, nombre?: string }`

### `validarEmail(email)`
Valida un correo electrónico.
- ✅ Formato válido de email
- ✅ Longitud máxima: 254 caracteres
- ✅ Sin caracteres peligrosos
- ✅ Retorna: `{ valido: boolean, error?: string, email?: string }`

### `validarContraseña(password)`
Valida una contraseña fuerte.
- ✅ Mínimo 8 caracteres
- ✅ Máximo 128 caracteres
- ✅ Debe tener: mayúsculas, minúsculas, números, símbolos
- ✅ Rechaza contraseñas comunes
- ✅ Retorna: `{ valida: boolean, errores: string[] }`

### `validarDestino(destino)`
Valida un nombre de destino.
- ✅ Longitud: 2-100 caracteres
- ✅ Solo letras y espacios
- ✅ Retorna: `{ valido: boolean, error?: string, destino?: string }`

### `validarFecha(fecha)`
Valida una fecha en formato flexible.
- ✅ Acepta: DD/MM/YYYY, "15 de junio 2024", etc.
- ✅ Verifica que la fecha sea válida
- ✅ Verifica rango razonable (no muy antigua ni muy futura)
- ✅ Retorna: `{ valida: boolean, error?: string, fecha?: string }`

### `validarPresupuesto(presupuesto)`
Valida un presupuesto numérico.
- ✅ Debe ser un número válido
- ✅ Rango: $10 - $1,000,000
- ✅ Acepta formato con $ y comas
- ✅ Retorna: `{ valido: boolean, error?: string, presupuesto?: number }`

### `validarPregunta(pregunta)`
Valida una pregunta del usuario.
- ✅ Longitud: 5-1000 caracteres
- ✅ Debe contener texto válido (no solo símbolos)
- ✅ Retorna: `{ valida: boolean, error?: string, pregunta?: string }`

---

## 🎨 Componente MensajeError

Componente reutilizable para mostrar mensajes de error:

```jsx
import MensajeError from './components/MensajeError'

<MensajeError 
  mensaje={errorEmail} 
  mostrar={!!errorEmail} 
/>
```

**Características:**
- ✅ Animación suave al aparecer
- ✅ Icono de advertencia
- ✅ Estilo consistente en toda la app
- ✅ Accesible (role="alert")

---

## 📱 Formulario de Preferencias

El componente `FormularioPreferencias` incluye:

1. **Validación en tiempo real** de todos los campos
2. **Mensajes de error claros** debajo de cada campo
3. **Ayuda contextual** (ej: formato de fecha esperado)
4. **Indicadores visuales** (bordes rojos en campos con error)
5. **Botón deshabilitado** si el formulario no es válido

**Uso:**
```jsx
<FormularioPreferencias 
  onSubmit={(datos) => {
    console.log('Datos validados:', datos)
    // datos.destino, datos.fecha, datos.presupuesto, datos.preferencias
  }}
  cargando={false}
/>
```

---

## ✅ Checklist de Validación

### Al crear un nuevo formulario:

- [ ] Validar campos obligatorios (no vacíos)
- [ ] Validar formato de email (si aplica)
- [ ] Validar números (si aplica)
- [ ] Validar longitud mínima y máxima
- [ ] Mostrar mensajes de error claros
- [ ] Validar en tiempo real (onChange)
- [ ] Validar al perder foco (onBlur)
- [ ] Deshabilitar botón de envío si hay errores
- [ ] Indicadores visuales (bordes rojos)
- [ ] Usar componente MensajeError

---

## 🐛 Solución de Problemas

### ❌ Los mensajes de error no aparecen
- Verifica que `mostrar={!!error}` esté configurado correctamente
- Verifica que el estado de error se actualice en el onChange

### ❌ La validación no funciona
- Verifica que importaste la función de validación correcta
- Verifica que estés usando el valor validado (ej: `validacion.email`)

### ❌ El botón no se deshabilita
- Verifica que el estado de errores se actualice correctamente
- Verifica la condición del `disabled`: `disabled={!!error || cargando}`

---

## 📚 Archivos Relacionados

- `frontend/src/utils/validacion.js` - Funciones de validación
- `frontend/src/components/MensajeError.jsx` - Componente de mensajes
- `frontend/src/components/FormularioPreferencias.jsx` - Formulario completo
- `frontend/src/components/Registro.jsx` - Ejemplo de uso
- `frontend/src/components/Login.jsx` - Ejemplo de uso

---

¡Tu aplicación ahora tiene validación completa y profesional! 🎉

