# ⚡ Instrucciones Rápidas de Despliegue

## 🔗 Enlaces Importantes

- **Vercel**: https://vercel.com (Frontend)
- **Render**: https://render.com (Backend)
- **GitHub**: https://github.com (Repositorio)

## 📋 Checklist de Despliegue

### 1️⃣ Preparar GitHub
- [ ] Crear cuenta en GitHub
- [ ] Crear repositorio nuevo
- [ ] Subir código: `git init`, `git add .`, `git commit -m "Initial commit"`, `git push`

### 2️⃣ Desplegar Backend en Render
- [ ] Crear cuenta en Render (con GitHub)
- [ ] New → Web Service
- [ ] Conectar repositorio
- [ ] Configurar:
  - **Root Directory**: `backend`
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Agregar variables de entorno:
  - `OPENAI_API_KEY` = tu clave de OpenAI
  - `ALLOWED_ORIGINS` = `http://localhost:3000` (actualizar después)
- [ ] Copiar URL del backend (ej: `https://xxx.onrender.com`)

### 3️⃣ Desplegar Frontend en Vercel
- [ ] Crear cuenta en Vercel (con GitHub)
- [ ] Add New → Project
- [ ] Seleccionar repositorio
- [ ] Configurar:
  - **Root Directory**: `frontend`
  - Framework: Vite (auto-detectado)
- [ ] Agregar variable de entorno:
  - `VITE_API_URL` = URL de tu backend en Render
- [ ] Copiar URL del frontend (ej: `https://xxx.vercel.app`)

### 4️⃣ Actualizar CORS
- [ ] Ir a Render → Environment Variables
- [ ] Actualizar `ALLOWED_ORIGINS`:
  - `https://tu-frontend.vercel.app,http://localhost:3000`

### 5️⃣ Probar
- [ ] Abrir URL de Vercel
- [ ] Hacer una pregunta de prueba
- [ ] ¡Funciona! 🎉

## 🔑 Variables de Entorno

### Backend (Render)
```
OPENAI_API_KEY=sk-...
OPENWEATHER_API_KEY=... (opcional)
UNSPLASH_API_KEY=... (opcional)
ALLOWED_ORIGINS=https://tu-frontend.vercel.app,http://localhost:3000
```

### Frontend (Vercel)
```
VITE_API_URL=https://tu-backend.onrender.com
```

## ⚠️ Notas Importantes

- **Render**: El servicio gratuito "duerme" después de 15 min de inactividad
- **Primera petición**: Puede tardar ~30 segundos si el backend estaba dormido
- **Actualizaciones**: Cada `git push` actualiza automáticamente ambos servicios
- **HTTPS**: Incluido automáticamente en ambos servicios

## 📚 Guía Completa

Para instrucciones detalladas, ve a [GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md)

