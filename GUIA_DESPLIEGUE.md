# 🚀 Guía Paso a Paso: Desplegar ViajeIA en Internet (GRATIS)

Esta guía te ayudará a desplegar ViajeIA en internet usando **Vercel** (frontend) y **Render** (backend), ambos servicios gratuitos.

## 📋 Requisitos Previos

1. ✅ Una cuenta de GitHub (gratis en github.com)
2. ✅ Una cuenta de Vercel (gratis en vercel.com)
3. ✅ Una cuenta de Render (gratis en render.com)
4. ✅ Tu código de ViajeIA funcionando localmente

---

## 🎯 Estrategia de Despliegue

- **Frontend (React)**: Vercel (excelente para React/Vite)
- **Backend (FastAPI)**: Render (soporta Python/FastAPI)

---

## PARTE 1: Preparar el Proyecto en GitHub

### Paso 1: Crear un repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Nombre del repositorio: `viajeia` (o el que prefieras)
4. Marca como **Private** o **Public** (tu elección)
5. **NO** marques "Initialize with README" (ya tienes código)
6. Haz clic en **"Create repository"**

### Paso 2: Subir tu código a GitHub

Abre PowerShell o Terminal en la carpeta de tu proyecto y ejecuta:

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit - ViajeIA app"

# Conectar con tu repositorio de GitHub
# REEMPLAZA 'tu-usuario' con tu usuario de GitHub
git remote add origin https://github.com/tu-usuario/viajeia.git

# Subir el código
git branch -M main
git push -u origin main
```

**Nota**: Si te pide usuario y contraseña, usa un Personal Access Token:
- Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Genera un nuevo token con permisos de `repo`
- Úsalo como contraseña

---

## PARTE 2: Desplegar el Backend en Render (GRATIS)

### Paso 1: Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Haz clic en **"Get Started for Free"**
3. Registrate con GitHub (es más fácil)

### Paso 2: Crear un nuevo servicio Web Service

1. En el dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub:
   - Selecciona tu repositorio `viajeia`
   - Haz clic en **"Connect"**

### Paso 3: Configurar el servicio

**Configuración básica:**
- **Name**: `viajeia-backend` (o el nombre que prefieras)
- **Environment**: `Python 3`
- **Region**: Elige el más cercano a ti (ej: `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Paso 4: Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```
OPENAI_API_KEY=tu-api-key-de-openai
OPENWEATHER_API_KEY=tu-api-key-de-openweather (opcional)
UNSPLASH_API_KEY=tu-api-key-de-unsplash (opcional)
ALLOWED_ORIGINS=https://tu-frontend.vercel.app,http://localhost:3000
```

**Importante**: 
- Reemplaza `tu-api-key-de-openai` con tu clave real de OpenAI
- Deja `ALLOWED_ORIGINS` por ahora, lo actualizarás después de desplegar el frontend

### Paso 5: Desplegar

1. Haz clic en **"Create Web Service"**
2. Espera 3-5 minutos mientras Render construye y despliega tu backend
3. Cuando termine, verás una URL como: `https://viajeia-backend.onrender.com`
4. **¡COPIA ESTA URL!** La necesitarás para el frontend

**Nota**: La primera vez puede tardar varios minutos. Render "duerme" el servicio gratuito después de 15 minutos de inactividad, así que la primera petición puede tardar ~30 segundos en responder.

---

## PARTE 3: Desplegar el Frontend en Vercel (GRATIS)

### Paso 1: Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Elige **"Continue with GitHub"** (recomendado)

### Paso 2: Importar tu proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio `viajeia`
3. Haz clic en **"Import"**

### Paso 3: Configurar el proyecto

**Configuración:**
- **Framework Preset**: Vite (se detecta automáticamente)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (se completa automáticamente)
- **Output Directory**: `dist` (se completa automáticamente)
- **Install Command**: `npm install` (se completa automáticamente)

### Paso 4: Configurar Variables de Entorno

En **"Environment Variables"**, agrega:

```
VITE_API_URL=https://viajeia-backend.onrender.com
```

**Importante**: Reemplaza `viajeia-backend.onrender.com` con la URL real de tu backend en Render.

### Paso 5: Desplegar

1. Haz clic en **"Deploy"**
2. Espera 1-2 minutos mientras Vercel construye y despliega tu frontend
3. Cuando termine, verás una URL como: `https://viajeia.vercel.app`
4. **¡Tu app está en línea!** 🎉

---

## PARTE 4: Actualizar CORS del Backend

Ahora que tienes la URL del frontend en Vercel, necesitas actualizar el backend:

1. Ve al dashboard de Render
2. Selecciona tu servicio `viajeia-backend`
3. Ve a **"Environment"** → **"Environment Variables"**
4. Actualiza `ALLOWED_ORIGINS` con tu URL de Vercel:

```
ALLOWED_ORIGINS=https://viajeia.vercel.app,http://localhost:3000
```

5. Haz clic en **"Save Changes"**
6. Render reiniciará automáticamente el servicio

---

## ✅ Verificar que Todo Funciona

1. Abre tu URL de Vercel en el navegador (ej: `https://viajeia.vercel.app`)
2. Prueba hacer una pregunta sobre un viaje
3. Si todo funciona correctamente, ¡felicidades! Tu app está en línea 🚀

---

## 🔧 Solución de Problemas

### ❌ Error: "CORS policy"
- **Solución**: Verifica que `ALLOWED_ORIGINS` en Render incluya tu URL de Vercel

### ❌ Error: "Cannot connect to backend"
- **Solución**: Verifica que `VITE_API_URL` en Vercel sea la URL correcta de Render

### ❌ Backend tarda mucho en responder la primera vez
- **Solución**: Es normal en el plan gratuito de Render. El servicio "duerme" después de 15 minutos de inactividad. La primera petición puede tardar ~30 segundos.

### ❌ El backend no inicia
- **Solución**: Revisa los logs en Render para ver errores. Verifica que:
  - Todas las variables de entorno estén configuradas
  - El `requirements.txt` esté correcto
  - El `start command` sea correcto

---

## 📊 Límites de los Planes Gratuitos

### Vercel (Frontend)
- ✅ Ilimitado para proyectos personales
- ✅ Despliegues automáticos desde GitHub
- ✅ HTTPS incluido
- ✅ CDN global

### Render (Backend)
- ✅ 750 horas/mes gratis (suficiente para siempre activo)
- ✅ El servicio "duerme" después de 15 minutos de inactividad
- ✅ La primera petición después de dormir tarda ~30 segundos
- ✅ HTTPS incluido

---

## 🎯 Próximos Pasos

1. **Actualizar URLs**: Cada vez que cambies el código y hagas `git push`, Vercel y Render se actualizarán automáticamente
2. **Dominio personalizado**: Puedes agregar tu propio dominio en Vercel (gratis)
3. **Monitoreo**: Revisa los logs en ambos servicios para ver cómo funciona tu app

---

## 📝 Resumen de URLs

Después del despliegue, tendrás:

- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend**: `https://tu-backend.onrender.com`

¡Tu aplicación estará disponible para cualquiera en internet! 🌍

