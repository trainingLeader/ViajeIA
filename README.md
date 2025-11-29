# ViajeIA - Tu Asistente Personal de Viajes

Aplicación web moderna para asistencia en planificación de viajes, con arquitectura separada entre frontend (React) y backend (Python/FastAPI).

## 🚀 Características

- **Frontend moderno**: React con Vite
- **Backend robusto**: FastAPI con Python
- **IA integrada**: ChatGPT de OpenAI para respuestas inteligentes
- **Diseño elegante**: Interfaz moderna con colores azules y blancos
- **Arquitectura separada**: Frontend y backend independientes

## 📁 Estructura del Proyecto

```
ViajeIA/
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/           # API FastAPI
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
└── README.md
```

## 🛠️ Instalación y Configuración

### Frontend

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en: http://localhost:3000

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Crear entorno virtual (recomendado):
```bash
python -m venv venv
```

3. Activar el entorno virtual:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

4. Instalar dependencias:
```bash
pip install -r requirements.txt
```

5. **Configurar OpenAI (IMPORTANTE):**
   - Obtén tu API Key en: https://platform.openai.com/api-keys
   - Crea un archivo `.env` en la carpeta `backend/`
   - Agrega tu API Key:
     ```
     OPENAI_API_KEY=sk-tu-api-key-aqui
     ```
   - 💡 Revisa el archivo `backend/env.example.txt` para más detalles

6. Ejecutar el servidor:
```bash
uvicorn main:app --reload --port 8000
```

El backend estará disponible en: http://localhost:8000

## 📖 Uso

1. Inicia el backend (puerto 8000)
2. Inicia el frontend (puerto 3000)
3. Abre tu navegador en http://localhost:3000
4. Escribe tu pregunta sobre viajes
5. Haz clic en "Planificar mi viaje"

## 🎨 Diseño

La aplicación utiliza un diseño moderno con:
- Gradientes azules y púrpura
- Transiciones suaves
- Interfaz responsive
- Animaciones elegantes

## 🔧 Tecnologías

- **Frontend**: React 18, Vite, Axios
- **Backend**: FastAPI, Python 3.8+
- **IA**: OpenAI GPT-3.5-turbo (ChatGPT)
- **Estilos**: CSS puro con diseño moderno

## 🤖 Cómo Funciona

1. El usuario escribe una pregunta sobre viajes en el frontend
2. El frontend envía la pregunta al backend a través de una API
3. El backend se conecta a OpenAI (ChatGPT) para generar una respuesta inteligente
4. La respuesta se devuelve al frontend y se muestra al usuario

## 🌐 Desplegar en Producción (Internet)

¿Quieres que tu aplicación esté disponible para todos en internet? ¡Es gratis y fácil!

📖 **Lee la [Guía Completa de Despliegue](./GUIA_DESPLIEGUE.md)** para aprender cómo:
- Desplegar el frontend en **Vercel** (gratis)
- Desplegar el backend en **Render** (gratis)
- Configurar variables de entorno
- Solucionar problemas comunes

En resumen:
1. Sube tu código a GitHub
2. Conecta el repositorio a Vercel (frontend)
3. Conecta el repositorio a Render (backend)
4. Configura las variables de entorno
5. ¡Tu app estará en línea! 🚀

## 📝 Próximos Pasos

- ✅ Guardado de itinerarios favoritos (implementado)
- Integración con APIs de viajes (vuelos, hoteles)
- Autenticación de usuarios
- Selección de diferentes modelos de IA

