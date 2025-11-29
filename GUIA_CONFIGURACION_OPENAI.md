# ⚙️ Guía de Configuración de OpenAI

Esta guía explica cómo configurar el modelo de OpenAI, `max_tokens` y gestionar el historial de mensajes para evitar superar los límites de tokens.

---

## 📋 Características Implementadas

### 1. **Configuración del Modelo**
Puedes elegir qué modelo de OpenAI usar (gpt-3.5-turbo, gpt-4, etc.)

### 2. **Configuración de max_tokens**
Controla cuántos tokens máximo puede generar la IA en su respuesta

### 3. **Gestión Inteligente del Historial**
Limita automáticamente el historial de mensajes para no superar los límites de tokens del modelo

---

## 🔧 Configuración Básica

### Variables de Entorno

Crea o edita tu archivo `.env` en la carpeta `backend/`:

```env
# Modelo de OpenAI a usar por defecto
OPENAI_MODEL=gpt-3.5-turbo

# Máximo de tokens para las respuestas (por defecto)
OPENAI_MAX_TOKENS=1500

# Máximo de tokens para el contexto (por defecto)
OPENAI_MAX_CONTEXT_TOKENS=3000
```

### Modelos Soportados

| Modelo | Límite de Contexto | Uso Recomendado |
|--------|-------------------|-----------------|
| `gpt-3.5-turbo` | 4,096 tokens | Uso general, rápido y económico |
| `gpt-3.5-turbo-16k` | 16,385 tokens | Contextos más largos, económico |
| `gpt-4` | 8,192 tokens | Respuestas más precisas |
| `gpt-4-turbo` | 128,000 tokens | Contextos muy largos |
| `gpt-4o` | 128,000 tokens | Modelo más reciente, mejor rendimiento |
| `gpt-4o-mini` | 128,000 tokens | Versión optimizada de gpt-4o |

---

## 💻 Uso en el Código

### Función Principal: `generar_respuesta_con_chatgpt()`

La función ahora acepta parámetros opcionales para configurar el modelo y max_tokens:

```python
respuesta = generar_respuesta_con_chatgpt(
    pregunta="¿Qué hacer en París?",
    contexto=contexto_formulario,
    info_clima=info_clima,
    modelo="gpt-4",  # Opcional: especificar modelo
    max_tokens=2000,  # Opcional: especificar max_tokens
    historial=[  # Opcional: incluir historial de conversación
        {"role": "user", "content": "Hola"},
        {"role": "assistant", "content": "¡Hola! ¿Cómo puedo ayudarte?"},
        {"role": "user", "content": "Quiero viajar a París"}
    ]
)
```

### Parámetros:

1. **`modelo`** (opcional):
   - Especifica qué modelo usar
   - Si es `None`, usa `OPENAI_MODEL` del `.env` o `"gpt-3.5-turbo"` por defecto

2. **`max_tokens`** (opcional):
   - Limita cuántos tokens puede generar la IA
   - Si es `None`, usa `OPENAI_MAX_TOKENS` del `.env` o `1500` por defecto

3. **`historial`** (opcional):
   - Lista de mensajes anteriores en formato OpenAI
   - Se limitan automáticamente para no exceder el límite de tokens del modelo

---

## 🔍 Gestión Automática del Historial

### ¿Cómo Funciona?

La función `limitar_historial_por_tokens()`:

1. **Mantiene siempre**:
   - El mensaje del sistema (si existe)
   - El mensaje del usuario más reciente

2. **Agrega mensajes anteriores**:
   - Desde el más reciente hasta el más antiguo
   - Hasta alcanzar el límite de tokens disponible

3. **Calcula tokens disponibles**:
   ```
   Tokens disponibles = Límite del modelo - max_tokens_respuesta - tokens_sistema
   ```

### Ejemplo:

```python
# Historial original (muy largo)
historial = [
    {"role": "user", "content": "Mensaje 1 muy largo..."},
    {"role": "assistant", "content": "Respuesta 1 muy larga..."},
    {"role": "user", "content": "Mensaje 2 muy largo..."},
    {"role": "assistant", "content": "Respuesta 2 muy larga..."},
    {"role": "user", "content": "Mensaje 3 muy largo..."},
    {"role": "assistant", "content": "Respuesta 3 muy larga..."},
    {"role": "user", "content": "Mensaje actual (este sí se incluye siempre)"}
]

# Usando gpt-3.5-turbo (límite: 4,096 tokens)
# max_tokens: 1,500
# Tokens disponibles para historial: ~2,500

# Resultado: Se incluyen solo los mensajes más recientes que quepan
historial_limitado = limitar_historial_por_tokens(
    mensajes=historial + [{"role": "system", "content": "..."}],
    modelo="gpt-3.5-turbo",
    max_tokens_respuesta=1500
)
```

---

## 📊 Estimación de Tokens

### Función: `estimar_tokens()`

Se usa una aproximación simple pero efectiva:

```python
# Aproximación: 4 caracteres = 1 token
tokens = len(texto) // 4 + 10  # +10 como buffer de seguridad
```

**Nota**: Esta es una estimación. OpenAI usa un tokenizer más sofisticado, pero esta aproximación es suficiente para limitar el historial de forma segura.

### Ejemplo:

```python
texto = "Hola, ¿cómo estás?"  # 18 caracteres
tokens_estimados = estimar_tokens(texto)  # ~4-5 tokens
```

---

## ✅ Validación de Configuración

La función `validar_configuracion()` verifica que:

1. El modelo sea válido y esté soportado
2. `max_tokens` sea mayor que 0
3. `max_tokens` no exceda el límite del modelo
4. El historial + max_tokens no exceda el límite del modelo

### Ejemplo de Error:

```python
# Error: max_tokens excede el límite del modelo
validar_configuracion(
    modelo="gpt-3.5-turbo",  # Límite: 4,096 tokens
    max_tokens=5000  # ❌ Mayor que el límite
)
# Retorna: (False, "max_tokens (5000) no puede ser mayor que el límite del modelo (4096)")
```

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Usar Modelo Específico

```python
respuesta = generar_respuesta_con_chatgpt(
    pregunta="Necesito un itinerario detallado para 7 días en Tokio",
    modelo="gpt-4",  # Usar GPT-4 para respuestas más precisas
    max_tokens=2500  # Respuestas más largas
)
```

### Ejemplo 2: Incluir Historial de Conversación

```python
# Primera pregunta
respuesta1 = generar_respuesta_con_chatgpt(
    pregunta="¿Qué hacer en París?"
)

# Segunda pregunta (con historial)
respuesta2 = generar_respuesta_con_chatgpt(
    pregunta="¿Y qué restaurantes recomiendas?",
    historial=[
        {"role": "user", "content": "¿Qué hacer en París?"},
        {"role": "assistant", "content": respuesta1}
    ]
)
```

### Ejemplo 3: Configuración por Defecto

```python
# Usa la configuración del .env o valores por defecto
respuesta = generar_respuesta_con_chatgpt(
    pregunta="¿Cuál es el mejor momento para visitar Barcelona?"
)
# Usa: modelo="gpt-3.5-turbo", max_tokens=1500 (o lo configurado en .env)
```

---

## 🔧 Funciones Disponibles

### `obtener_configuracion_openai(modelo, max_tokens)`

Obtiene la configuración con valores por defecto:

```python
config = obtener_configuracion_openai(
    modelo="gpt-4",
    max_tokens=2000
)
# Retorna: {"modelo": "gpt-4", "max_tokens": 2000, "max_context_tokens": 8192}
```

### `limitar_historial_por_tokens(mensajes, modelo, max_tokens_respuesta)`

Limita el historial para que no exceda los límites:

```python
historial_limitado = limitar_historial_por_tokens(
    mensajes=mensajes_completos,
    modelo="gpt-3.5-turbo",
    max_tokens_respuesta=1500
)
```

### `validar_configuracion(modelo, max_tokens, historial)`

Valida que la configuración sea válida:

```python
es_valido, error = validar_configuracion(
    modelo="gpt-3.5-turbo",
    max_tokens=1500,
    historial=mensajes
)
```

### `estimar_tokens(texto)`

Estima el número de tokens en un texto:

```python
tokens = estimar_tokens("Hola, ¿cómo estás?")
```

---

## 📝 Logging

El sistema registra información útil:

```
INFO: Usando modelo: gpt-3.5-turbo, max_tokens: 1500
INFO: Historial limitado: 10 mensajes originales -> 5 mensajes después del límite. Tokens estimados: ~2500
```

Esto te ayuda a:
- Ver qué configuración se está usando
- Entender cómo se está limitando el historial
- Monitorear el uso de tokens

---

## ⚠️ Consideraciones Importantes

### 1. Límites de Tokens

Cada modelo tiene un límite de contexto total:

- **gpt-3.5-turbo**: 4,096 tokens
- **gpt-4**: 8,192 tokens
- **gpt-4-turbo**: 128,000 tokens

Este límite incluye:
- Mensaje del sistema
- Historial de mensajes
- Pregunta actual
- Respuesta generada

### 2. Estimación de Tokens

La estimación es aproximada:
- **Aproximación**: ~4 caracteres = 1 token
- **Precisión**: Suficiente para limitar el historial de forma segura
- **Buffer**: Se incluye un buffer de seguridad (+10 tokens por mensaje)

### 3. Costos

Modelos más potentes cuestan más:

- **gpt-3.5-turbo**: Más económico
- **gpt-4**: Más caro, pero mejor calidad
- **gpt-4-turbo**: Más caro, pero contexto mucho más largo

---

## 🎯 Mejores Prácticas

1. **Usa gpt-3.5-turbo para uso general**:
   - Rápido y económico
   - Suficiente para la mayoría de casos

2. **Usa gpt-4 para respuestas críticas**:
   - Cuando necesites máxima precisión
   - Para tareas complejas

3. **Configura max_tokens apropiadamente**:
   - Muy bajo: Respuestas cortas o truncadas
   - Muy alto: Puede exceder el límite o ser costoso

4. **Mantén el historial relevante**:
   - El sistema lo limita automáticamente
   - Pero mantener solo lo necesario es más eficiente

---

## 📚 Archivos Relacionados

- `backend/openai_config.py` - Módulo de configuración
- `backend/main.py` - Uso de la configuración
- `backend/.env` - Variables de entorno (crear si no existe)

---

¡Ahora tienes control total sobre el modelo, tokens y historial! ⚙️

