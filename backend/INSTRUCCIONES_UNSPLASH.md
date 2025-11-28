# 📸 Guía: Obtener API Key de Unsplash

Esta guía te ayudará a obtener tu API key gratuita de Unsplash para mostrar fotos hermosas del destino en ViajeIA.

## Paso 1: Crear una cuenta en Unsplash

1. Ve a la página de Unsplash: https://unsplash.com/
2. Haz clic en **"Join"** o **"Sign up"** (Registrarse) en la esquina superior derecha
3. Puedes registrarte con:
   - Email y contraseña
   - Tu cuenta de Google
   - Tu cuenta de Apple
   - Tu cuenta de Facebook
4. Completa el formulario de registro
5. Verifica tu email si es necesario

## Paso 2: Acceder a la sección de desarrolladores

1. Una vez que hayas iniciado sesión, ve a: https://unsplash.com/developers
2. También puedes acceder desde el menú de tu perfil → **"Developers"** o **"API"**

## Paso 3: Crear una aplicación

1. En la página de desarrolladores, haz clic en **"Your apps"** o **"New Application"**
2. Si es tu primera vez, haz clic en **"Register as a developer"** o **"Accept the terms"**
3. Acepta los términos de servicio de la API
4. Haz clic en **"New Application"**
5. Completa el formulario:
   - **Application name**: "ViajeIA" (o el nombre que prefieras)
   - **Description**: "Aplicación de asistente de viajes que muestra fotos de destinos"
   - **Application website** (opcional): Puedes dejar tu URL o dejarlo vacío
   - Acepta los términos de uso
6. Haz clic en **"Create application"** o **"Accept terms"**

## Paso 4: Obtener tu Access Key

1. Una vez creada la aplicación, serás redirigido al dashboard de tu aplicación
2. Aquí verás dos keys importantes:
   - **Access Key** (esta es la que necesitamos)
   - **Secret Key** (no la necesitamos para esta implementación)
3. **Copia tu Access Key** inmediatamente
   - Se verá algo como: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

## Paso 5: Configurar la API Key en tu proyecto

1. Abre el archivo `.env` en la carpeta `backend/`
2. Agrega la siguiente línea (si no existe, créala):
   ```
   UNSPLASH_API_KEY=tu_access_key_aqui
   ```
3. Reemplaza `tu_access_key_aqui` con el Access Key que copiaste
4. Guarda el archivo

   ✅ Ejemplo:
   ```
   OPENAI_API_KEY=sk-tu-openai-key
   OPENWEATHER_API_KEY=tu-openweather-key
   UNSPLASH_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
   ```

## Paso 6: Reiniciar el servidor

1. Si el backend está corriendo, detenlo (Ctrl+C)
2. Reinícialo:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## 🎉 ¡Listo!

Ahora cuando alguien pregunte sobre un destino, ViajeIA automáticamente mostrará 3 fotos hermosas del lugar en la respuesta.

---

## 📋 Información sobre el Plan Gratuito

El plan gratuito de Unsplash incluye:
- ✅ **50 llamadas por hora** (más que suficiente para uso normal)
- ✅ Acceso completo a todas las fotos
- ✅ Fotos de alta calidad
- ✅ Búsqueda de fotos
- ✅ Uso comercial permitido (con atribución)

**Perfecto para desarrollo y uso personal!** 🚀

---

## 🔧 Solución de Problemas

### Error: "Unauthorized" o 401
- Verifica que copiaste el **Access Key** completo (no el Secret Key)
- Asegúrate de que la key está en el archivo `.env` como `UNSPLASH_API_KEY`
- Verifica que no hay espacios antes o después de la key

### Error: "Rate limit exceeded"
- Has excedido el límite de 50 llamadas por hora
- Espera una hora y vuelve a intentar
- Para uso en producción, considera el plan de pago

### No se muestran las fotos
- Verifica que la API key está correctamente configurada en `.env`
- Revisa la consola del backend para ver si hay errores
- Asegúrate de haber reiniciado el servidor después de agregar la key
- Verifica que el nombre del destino sea correcto (Unsplash busca por nombre de ciudad)

### Las fotos no coinciden con el destino
- Unsplash busca fotos basándose en el nombre de la ciudad
- Si el nombre está en otro idioma, intenta usar el nombre en inglés
- Ejemplo: "París" vs "Paris", "Tokio" vs "Tokyo"

---

## 💡 Tips

- **Búsqueda inteligente**: La API busca con el término "{ciudad} travel destination" para obtener mejores resultados
- **Orientación**: Las fotos se obtienen en orientación horizontal (landscape) que se ven mejor en la web
- **Calidad**: Se usa el tamaño "regular" (1080px) que es un buen balance entre calidad y velocidad de carga
- **Lazy loading**: Las fotos se cargan de forma diferida para mejorar el rendimiento

---

## 📚 Recursos

- Documentación de la API: https://unsplash.com/documentation
- Dashboard de aplicaciones: https://unsplash.com/oauth/applications
- Soporte: https://unsplash.com/support
- Términos de uso: https://unsplash.com/api-terms

---

**Nota:** Si no configuras la API key, la aplicación seguirá funcionando normalmente, simplemente no mostrará las fotos del destino.

## FASE 4: Funcionalidades Pro

"Lo convertimos en una app profesional"

### Objetivo Visual

Ahora tiene historial de conversaciones, puede exportar itinerarios a PDF y guardar viajes favoritos.
Funcionalidades avanzadas:

### Historial y Memoria:

" Cursor, quiero que el asistente recuerde las conversaciones. Si alguien pregunta 'y qué tal el transporte allí?'
debe saber que se refiere al último destino consultado. También quiero ver el historial de preguntas anteriores"  
