# 🌤️ Guía: Obtener API Key de OpenWeatherMap

Esta guía te ayudará a obtener tu API key gratuita de OpenWeatherMap para mostrar el clima actual en ViajeIA.

## Paso 1: Crear una cuenta en OpenWeatherMap

1. Ve a la página de OpenWeatherMap: https://openweathermap.org/
2. Haz clic en **"Sign Up"** (Registrarse) en la esquina superior derecha
3. Completa el formulario de registro:
   - Nombre de usuario
   - Email
   - Contraseña
   - Acepta los términos y condiciones
4. Haz clic en **"Create Account"**

## Paso 2: Verificar tu email

1. Revisa tu bandeja de entrada (y spam si no lo encuentras)
2. Abre el email de verificación de OpenWeatherMap
3. Haz clic en el enlace de verificación

## Paso 3: Obtener tu API Key

1. Una vez verificado, inicia sesión en: https://openweathermap.org/
2. Ve a tu perfil haciendo clic en tu nombre de usuario (esquina superior derecha)
3. En el menú desplegable, selecciona **"My API keys"** o ve directamente a: https://home.openweathermap.org/api_keys
4. Verás una sección llamada **"API keys"**
5. Si es tu primera vez, verás una key predeterminada (puede estar marcada como "Default")
6. Si no aparece ninguna, haz clic en **"Create Key"** o **"Generate"**
7. **Copia la API key inmediatamente** (se verá algo como: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

## Paso 4: Configurar la API Key en tu proyecto

1. Abre el archivo `.env` en la carpeta `backend/`
2. Agrega la siguiente línea (si no existe, créala):
   ```
   OPENWEATHER_API_KEY=tu_api_key_aqui
   ```
3. Reemplaza `tu_api_key_aqui` con la API key que copiaste
4. Guarda el archivo

   ✅ Ejemplo:
   ```
   OPENAI_API_KEY=sk-tu-openai-key
   OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

## Paso 5: Reiniciar el servidor

1. Si el backend está corriendo, detenlo (Ctrl+C)
2. Reinícialo:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## 🎉 ¡Listo!

Ahora cuando alguien pregunte sobre un destino, ViajeIA automáticamente buscará y mostrará el clima actual de esa ciudad.

---

## 📋 Información sobre el Plan Gratuito

El plan gratuito de OpenWeatherMap incluye:
- ✅ **60 llamadas por minuto**
- ✅ **1,000,000 llamadas por mes**
- ✅ Acceso a clima actual
- ✅ Acceso a pronóstico de 5 días
- ✅ Acceso a pronóstico horario de 4 días
- ✅ Datos históricos (limitados)

**Más que suficiente para desarrollo y uso personal!** 🚀

---

## 🔧 Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste la API key completa sin espacios
- Asegúrate de que la key está en el archivo `.env` como `OPENWEATHER_API_KEY`
- Espera unos minutos después de crear la key (puede tardar en activarse)

### Error: "City not found"
- Algunas ciudades pueden tener nombres diferentes en la API
- Intenta usar el nombre en inglés
- Verifica que el nombre de la ciudad sea correcto

### No se muestra el clima
- Verifica que la API key está correctamente configurada en `.env`
- Revisa la consola del backend para ver si hay errores
- Asegúrate de haber reiniciado el servidor después de agregar la key

---

## 📚 Recursos

- Documentación de la API: https://openweathermap.org/api
- Soporte: https://openweathermap.org/appid
- Panel de control: https://home.openweathermap.org/

---

**Nota:** Si no configuras la API key, la aplicación seguirá funcionando normalmente, simplemente no mostrará información del clima.

