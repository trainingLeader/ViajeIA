# 🚀 Guía Rápida: Configurar OpenAI en ViajeIA

Esta guía te ayudará a conectar tu aplicación con ChatGPT paso a paso.

## Paso 1: Obtener tu API Key de OpenAI

1. Ve a https://platform.openai.com/
2. Crea una cuenta o inicia sesión si ya tienes una
3. Una vez dentro, ve a: https://platform.openai.com/api-keys
4. Haz clic en **"Create new secret key"**
5. Dale un nombre (ej: "ViajeIA")
6. **IMPORTANTE:** Copia la API Key inmediatamente (solo se muestra una vez)
   - Se verá algo así: `sk-proj-xxxxxxxxxxxxxxxxxxxxx`

## Paso 2: Configurar el archivo .env

1. Ve a la carpeta `backend/` de tu proyecto
2. Crea un archivo nuevo llamado **`.env`** (con el punto al inicio)
3. Abre el archivo `.env` y escribe:
   ```
   OPENAI_API_KEY=tu-api-key-aqui
   ```
4. Reemplaza `tu-api-key-aqui` con la API Key que copiaste en el paso anterior
5. Guarda el archivo

   ✅ Ejemplo de cómo debería verse:
   ```
   OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
   ```

## Paso 3: Instalar las nuevas dependencias

1. Asegúrate de estar en la carpeta `backend/`
2. Si tu entorno virtual está activado (verás `(venv)` al inicio de la línea), ejecuta:
   ```bash
   pip install -r requirements.txt
   ```

   Esto instalará las librerías necesarias para conectar con OpenAI.

## Paso 4: Probar que funciona

1. Inicia el backend:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

2. Si ves un mensaje como "Application startup complete", ¡está funcionando! 🎉

3. Si ves un error sobre `OPENAI_API_KEY`, verifica:
   - Que el archivo `.env` existe en la carpeta `backend/`
   - Que el nombre de la variable es exactamente `OPENAI_API_KEY`
   - Que tu API Key está correctamente copiada (sin espacios extra)

## Paso 5: Probar en la aplicación

1. Inicia el frontend (en otra terminal):
   ```bash
   cd frontend
   npm run dev
   ```

2. Abre http://localhost:3000 en tu navegador

3. Escribe una pregunta como: "¿Qué lugares debo visitar en París?"

4. Haz clic en "Planificar mi viaje"

5. ¡Deberías ver una respuesta inteligente generada por ChatGPT! ✨

## 🔧 Solución de Problemas

### Error: "Por favor, configura OPENAI_API_KEY en tu archivo .env"
- Verifica que el archivo `.env` está en la carpeta `backend/` (no en la raíz del proyecto)
- Verifica que el nombre del archivo es exactamente `.env` (con el punto)
- Reinicia el servidor después de crear/modificar el archivo `.env`

### Error: "Incorrect API key provided"
- Verifica que copiaste la API Key completa
- Asegúrate de no tener espacios antes o después de la API Key
- Verifica que la API Key sigue siendo válida en tu cuenta de OpenAI

### La respuesta tarda mucho o da error
- Verifica tu conexión a internet
- Revisa que tienes créditos disponibles en tu cuenta de OpenAI
- Revisa la consola del backend para ver el error específico

## 💰 Costos

⚠️ **Nota importante:** OpenAI cobra por el uso de su API. Los precios son por cada 1000 tokens (palabras aproximadamente). 

- GPT-3.5-turbo es económico: ~$0.001 por cada 1000 tokens
- Cada pregunta/respuesta típica cuesta menos de $0.01
- Puedes revisar tu uso y límites en: https://platform.openai.com/usage

## 📚 Más Información

- Documentación de OpenAI: https://platform.openai.com/docs
- Dashboard de OpenAI: https://platform.openai.com/

---

¡Listo! Ya tienes tu asistente de viajes conectado con ChatGPT. 🎉

