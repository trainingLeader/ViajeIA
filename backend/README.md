# ViajeIA Backend

Backend API para ViajeIA desarrollado con FastAPI e integrado con OpenAI (ChatGPT).

## Instalación

1. Crear un entorno virtual (recomendado):
```bash
python -m venv venv
```

2. Activar el entorno virtual:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

## ⚙️ Configuración de OpenAI

1. **Obtén tu API Key de OpenAI:**
   - Ve a https://platform.openai.com/api-keys
   - Inicia sesión o crea una cuenta
   - Crea una nueva API Key

2. **Crea el archivo .env:**
   - En la carpeta `backend/`, crea un archivo llamado `.env`
   - Agrega tu API Key en el archivo:
   ```
   OPENAI_API_KEY=sk-tu-api-key-aqui
   ```

   💡 **Tip:** Puedes usar el archivo `env.example.txt` como referencia.

## Ejecución

```bash
uvicorn main:app --reload --port 8000
```

El servidor estará disponible en: http://localhost:8000

## Endpoints

- `GET /` - Verificar que la API está funcionando
- `POST /api/planificar` - Procesar preguntas sobre viajes usando ChatGPT

## Documentación

Una vez que el servidor esté corriendo, puedes acceder a:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🤖 Integración con OpenAI

La aplicación usa **ChatGPT (gpt-3.5-turbo)** para generar respuestas inteligentes sobre viajes. Cada pregunta del usuario se envía a OpenAI y la respuesta se muestra en tiempo real en el frontend.

