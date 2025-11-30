# 📢 Ejemplo: Alerta de Respuesta Cortada

Este documento explica cómo funciona la detección y visualización de alertas cuando la respuesta del modelo se corta por límite de tokens.

---

## 🎯 ¿Cuándo se Muestra la Alerta?

La alerta se muestra cuando:
- La respuesta del modelo alcanza el límite de `max_tokens`
- OpenAI retorna `finish_reason: "length"` (indica que se cortó por tokens)

---

## 🔍 Cómo Funciona la Detección

### Backend (Python)

```python
# En generar_respuesta_con_chatgpt()
response = client.chat.completions.create(
    model=modelo_usar,
    messages=mensajes,
    max_tokens=max_tokens_usar,
    temperature=0.8
)

# Detectar si se cortó
finish_reason = response.choices[0].finish_reason
respuesta_cortada = finish_reason == "length"  # "length" = cortada por tokens

# Obtener tokens usados
tokens_usados = response.usage.total_tokens

# Retornar información
return {
    "respuesta": respuesta,
    "respuesta_cortada": respuesta_cortada,
    "tokens_usados": tokens_usados
}
```

### Frontend (React)

```javascript
// En handleSubmit()
const response = await axios.post(`${apiUrl}/api/planificar`, {
  pregunta: preguntaActual
})

// Detectar si la respuesta se cortó
const respuestaCortada = response.data.respuesta_cortada || false
const tokensUsados = response.data.tokens_usados || null

setRespuestaCortada(respuestaCortada)
setTokensUsados(tokensUsados)
```

---

## 🎨 Componente de Alerta

### Uso Básico:

```jsx
import AlertaRespuestaCortada from './components/AlertaRespuestaCortada'

<AlertaRespuestaCortada
  mostrar={respuestaCortada}
  tokensUsados={tokensUsados}
  onCerrar={() => setRespuestaCortada(false)}
/>
```

### Props:

- **`mostrar`** (boolean): Controla si la alerta es visible
- **`tokensUsados`** (number | null): Número de tokens usados (opcional)
- **`onCerrar`** (function): Función que se ejecuta al cerrar la alerta

---

## 📋 Ejemplo Completo

### 1. Estado en el Componente:

```jsx
const [respuestaCortada, setRespuestaCortada] = useState(false)
const [tokensUsados, setTokensUsados] = useState(null)
```

### 2. Detectar en la Respuesta:

```jsx
const response = await axios.post(`${apiUrl}/api/planificar`, {
  pregunta: preguntaActual
})

// Detectar si se cortó
const cortada = response.data.respuesta_cortada || false
const tokens = response.data.tokens_usados || null

setRespuestaCortada(cortada)
setTokensUsados(tokens)
```

### 3. Mostrar la Alerta:

```jsx
{respuesta && (
  <div className="response-area">
    <h2>Respuesta:</h2>
    
    {/* Alerta si se cortó */}
    <AlertaRespuestaCortada
      mostrar={respuestaCortada}
      tokensUsados={tokensUsados}
      onCerrar={() => setRespuestaCortada(false)}
    />
    
    <div className="response-content">
      {respuesta}
    </div>
  </div>
)}
```

---

## 🎯 Casos de Uso

### Caso 1: Respuesta Normal (No Cortada)

```json
{
  "respuesta": "Aquí está tu itinerario completo...",
  "respuesta_cortada": false,
  "tokens_usados": 850
}
```

**Resultado**: No se muestra alerta ✅

### Caso 2: Respuesta Cortada

```json
{
  "respuesta": "Aquí está tu itinerario... [se corta aquí]",
  "respuesta_cortada": true,
  "tokens_usados": 1500
}
```

**Resultado**: Se muestra alerta ⚠️

---

## 🎨 Apariencia de la Alerta

La alerta muestra:

```
⚠️ Respuesta Incompleta

La respuesta se cortó porque alcanzó el límite de tokens. 
Puede que falte información al final de la respuesta.

Tokens usados: 1,500

💡 Sugerencia: Intenta hacer una pregunta más específica 
o divide tu consulta en partes más pequeñas.

[×]
```

**Características:**
- ⚠️ Icono de advertencia animado
- Color amarillo/naranja (advertencia)
- Información sobre tokens usados
- Sugerencia para el usuario
- Botón para cerrar

---

## 🔧 Personalización

### Cambiar el Mensaje:

Edita `frontend/src/components/AlertaRespuestaCortada.jsx`:

```jsx
<p className="alerta-mensaje">
  Tu mensaje personalizado aquí
</p>
```

### Cambiar los Estilos:

Edita `frontend/src/components/AlertaRespuestaCortada.css`:

```css
.alerta-respuesta-cortada {
  background: /* tu color */;
  border-left-color: /* tu color */;
}
```

---

## 📊 Información de Tokens

### ¿Qué son los tokens?

- Los tokens son unidades de texto que OpenAI usa
- Aproximadamente: 4 caracteres = 1 token
- Cada modelo tiene un límite máximo

### Ejemplo:

```
Texto: "¿Qué hacer en París?"
Tokens: ~5-6 tokens

Texto largo: "Necesito un itinerario detallado para 7 días..."
Tokens: ~15-20 tokens
```

---

## ✅ Checklist de Implementación

- [x] Backend detecta `finish_reason: "length"`
- [x] Backend retorna `respuesta_cortada` y `tokens_usados`
- [x] Frontend recibe y procesa la información
- [x] Componente de alerta creado
- [x] Alerta se muestra cuando `respuesta_cortada === true`
- [x] Alerta muestra información de tokens
- [x] Usuario puede cerrar la alerta
- [x] Estilos y animaciones implementados

---

## 🎯 Mejores Prácticas

1. **Siempre mostrar la alerta** cuando `respuesta_cortada === true`
2. **Incluir información de tokens** para ayudar al usuario a entender
3. **Dar sugerencias claras** sobre cómo evitar el problema
4. **Permitir cerrar la alerta** para no interrumpir la lectura
5. **Usar colores de advertencia** (amarillo/naranja) para indicar el problema

---

## 📚 Archivos Relacionados

- `backend/main.py` - Detección en el backend
- `frontend/src/components/AlertaRespuestaCortada.jsx` - Componente de alerta
- `frontend/src/components/AlertaRespuestaCortada.css` - Estilos
- `frontend/src/components/Asistente.jsx` - Integración

---

¡La alerta ahora informa claramente al usuario cuando la respuesta se corta! 📢

