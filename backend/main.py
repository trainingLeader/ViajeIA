from fastapi import FastAPI, HTTPException  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel  # pyright: ignore[reportMissingImports]
from typing import Optional, Tuple
import os
import requests  # pyright: ignore[reportMissingImports]
from datetime import datetime, timezone, timedelta
from openai import OpenAI  # pyright: ignore[reportMissingImports]
from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Almacenamiento en memoria del historial de conversaciones por sesión
# En producción, esto debería ser una base de datos
conversaciones_historial: dict[str, list[dict]] = {}
ultimo_destino_por_sesion: dict[str, str] = {}

app = FastAPI(title="ViajeIA API", version="1.0.0")

# Inicializar el cliente de OpenAI
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Por favor, configura OPENAI_API_KEY en tu archivo .env")

client = OpenAI(api_key=openai_api_key)

# API Key de OpenWeatherMap (opcional, no bloquea el inicio si no está)
openweather_api_key = os.getenv("OPENWEATHER_API_KEY")

# API Key de Unsplash (opcional, no bloquea el inicio si no está)
unsplash_api_key = os.getenv("UNSPLASH_API_KEY")

# Configurar CORS para permitir peticiones del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ContextoFormulario(BaseModel):
    destino: Optional[str] = None
    fecha: Optional[str] = None
    presupuesto: Optional[str] = None
    preferencia: Optional[str] = None

class PreguntaRequest(BaseModel):
    pregunta: str
    contexto: Optional[ContextoFormulario] = None
    session_id: Optional[str] = None


class InfoDestino(BaseModel):
    temperatura: Optional[float] = None
    condicion: Optional[str] = None
    diferencia_horaria: Optional[str] = None
    moneda_local: Optional[str] = None
    tipo_cambio_usd: Optional[float] = None
    codigo_moneda: Optional[str] = None

class MensajeHistorial(BaseModel):
    pregunta: str
    respuesta: str
    timestamp: str

class RespuestaResponse(BaseModel):
    respuesta: str
    fotos: Optional[list[str]] = None
    info_destino: Optional[InfoDestino] = None
    historial: Optional[list[MensajeHistorial]] = None


@app.get("/")
async def root():
    return {"message": "ViajeIA API está funcionando"}


@app.post("/api/planificar", response_model=RespuestaResponse)
async def planificar_viaje(request: PreguntaRequest):
    """
    Endpoint para procesar preguntas sobre planificación de viajes usando ChatGPT
    """
    try:
        pregunta = request.pregunta
        contexto = request.contexto
        session_id = request.session_id or "default"
        
        # Obtener historial de conversaciones anteriores para esta sesión
        historial_anterior = conversaciones_historial.get(session_id, [])
        
        # Obtener el destino (del contexto del formulario, historial o intentar extraerlo de la pregunta)
        destino = None
        if contexto and contexto.destino:
            destino = contexto.destino
            # Guardar el destino en el historial de la sesión
            ultimo_destino_por_sesion[session_id] = destino
        else:
            # Primero intentar usar el último destino mencionado en esta sesión
            destino = ultimo_destino_por_sesion.get(session_id)
            if not destino:
                # Intentar extraer el destino de la pregunta (básico)
                destino = extraer_destino_de_pregunta(pregunta)
                if destino:
                    ultimo_destino_por_sesion[session_id] = destino
        
        # Si hay un destino del historial pero no en la pregunta actual, agregarlo al contexto para ChatGPT
        pregunta_con_contexto = pregunta
        if destino and destino not in pregunta.lower():
            # Si la pregunta parece referirse a un destino anterior (usa palabras como "allí", "ahí", "ese lugar")
            referencias_destino = ["allí", "ahí", "ese lugar", "ese destino", "ese sitio", "allá", "esa ciudad"]
            if any(ref in pregunta.lower() for ref in referencias_destino):
                pregunta_con_contexto = f"El usuario pregunta sobre {destino}: {pregunta}"
        
        # Obtener información del clima si hay un destino
        info_clima = None
        if destino and openweather_api_key:
            info_clima = obtener_clima_actual(destino)
        
        # Obtener fotos del destino si está disponible
        fotos = None
        if destino and unsplash_api_key:
            fotos = obtener_fotos_unsplash(destino, cantidad=3)
        
        # Obtener información completa del destino (temperatura, moneda, zona horaria)
        info_destino = None
        if destino:
            info_destino = obtener_info_destino(destino, info_clima)
        
        # Llamar a ChatGPT para obtener la respuesta (incluyendo historial)
        respuesta = generar_respuesta_con_chatgpt(
            pregunta_con_contexto, 
            contexto, 
            info_clima, 
            historial_anterior,
            destino
        )
        
        # Guardar en el historial
        mensaje_historial = {
            "pregunta": pregunta,
            "respuesta": respuesta,
            "timestamp": datetime.now().isoformat()
        }
        historial_anterior.append(mensaje_historial)
        conversaciones_historial[session_id] = historial_anterior
        
        # Preparar historial para enviar al frontend (últimos 10 mensajes)
        historial_respuesta = [
            MensajeHistorial(**msg) for msg in historial_anterior[-10:]
        ]
        
        return RespuestaResponse(
            respuesta=respuesta, 
            fotos=fotos, 
            info_destino=info_destino,
            historial=historial_respuesta
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al procesar la solicitud: {str(e)}"
        )


def extraer_destino_de_pregunta(pregunta: str) -> Optional[str]:
    """
    Intenta extraer el nombre de un destino de la pregunta del usuario.
    Esta es una implementación básica que busca palabras clave comunes.
    """
    pregunta_lower = pregunta.lower()
    
    # Lista de destinos comunes (esto se puede expandir)
    destinos_comunes = [
        'parís', 'paris', 'tokio', 'tokyo', 'nueva york', 'new york', 
        'londres', 'london', 'roma', 'rome', 'barcelona', 'madrid',
        'berlín', 'berlin', 'amsterdam', 'atenas', 'athens', 'dubai',
        'singapur', 'singapore', 'sydney', 'sídney', 'melbourne',
        'toronto', 'montreal', 'vancouver', 'miami', 'los angeles',
        'san francisco', 'chicago', 'boston', 'lisboa', 'lisbon',
        'prague', 'praga', 'viena', 'vienna', 'budapest', 'cracovia'
    ]
    
    for destino in destinos_comunes:
        if destino in pregunta_lower:
            return destino.capitalize()
    
    return None


def obtener_fotos_unsplash(ciudad: str, cantidad: int = 3) -> Optional[list[str]]:
    """
    Obtiene fotos hermosas de una ciudad usando Unsplash API.
    
    Args:
        ciudad: Nombre de la ciudad/destino
        cantidad: Número de fotos a obtener (por defecto 3)
        
    Returns:
        Lista de URLs de fotos o None si hay error
    """
    if not unsplash_api_key:
        return None
    
    try:
        # URL de búsqueda de Unsplash
        url = "https://api.unsplash.com/search/photos"
        headers = {
            "Authorization": f"Client-ID {unsplash_api_key}"
        }
        params = {
            "query": f"{ciudad} travel destination",
            "per_page": cantidad,
            "orientation": "landscape",  # Fotos horizontales se ven mejor
            "order_by": "popularity"  # Las más populares suelen ser mejores
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            
            if results:
                # Extraer URLs de las fotos en tamaño regular (óptimo para web)
                fotos = []
                for photo in results[:cantidad]:
                    # Usar 'regular' que es un tamaño medio (1080px de ancho aprox)
                    # Otros tamaños: 'raw', 'full', 'regular', 'small', 'thumb'
                    url_foto = photo.get("urls", {}).get("regular")
                    if url_foto:
                        fotos.append(url_foto)
                
                return fotos if fotos else None
            else:
                return None
        else:
            # Si hay error, retornar None silenciosamente
            print(f"Error al obtener fotos de Unsplash: {response.status_code}")
            return None
    
    except Exception as e:
        # En caso de error, retornar None sin interrumpir el flujo
        print(f"Error al obtener fotos para {ciudad}: {str(e)}")
        return None


def obtener_codigo_moneda(ciudad: str, pais: str = "") -> Tuple[Optional[str], Optional[str]]:
    """
    Obtiene el código de moneda y nombre basado en la ciudad o país.
    Retorna una tupla (codigo_moneda, nombre_moneda).
    """
    # Mapeo de ciudades/países a códigos de moneda (ISO 4217)
    mapeo_monedas = {
        # Países
        "US": ("USD", "Dólar Estadounidense"),
        "GB": ("GBP", "Libra Esterlina"),
        "FR": ("EUR", "Euro"),
        "ES": ("EUR", "Euro"),
        "IT": ("EUR", "Euro"),
        "DE": ("EUR", "Euro"),
        "NL": ("EUR", "Euro"),
        "PT": ("EUR", "Euro"),
        "AT": ("EUR", "Euro"),
        "BE": ("EUR", "Euro"),
        "GR": ("EUR", "Euro"),
        "JP": ("JPY", "Yen Japonés"),
        "CN": ("CNY", "Yuan Chino"),
        "KR": ("KRW", "Won Surcoreano"),
        "SG": ("SGD", "Dólar de Singapur"),
        "AU": ("AUD", "Dólar Australiano"),
        "NZ": ("NZD", "Dólar Neozelandés"),
        "CA": ("CAD", "Dólar Canadiense"),
        "MX": ("MXN", "Peso Mexicano"),
        "BR": ("BRL", "Real Brasileño"),
        "AR": ("ARS", "Peso Argentino"),
        "CL": ("CLP", "Peso Chileno"),
        "CO": ("COP", "Peso Colombiano"),
        "PE": ("PEN", "Sol Peruano"),
        "AE": ("AED", "Dirham de los Emiratos Árabes"),
        "SA": ("SAR", "Riyal Saudí"),
        "TR": ("TRY", "Lira Turca"),
        "RU": ("RUB", "Rublo Ruso"),
        "IN": ("INR", "Rupia India"),
        "TH": ("THB", "Baht Tailandés"),
        "ID": ("IDR", "Rupia Indonesia"),
        "MY": ("MYR", "Ringgit Malayo"),
        "PH": ("PHP", "Peso Filipino"),
        "VN": ("VND", "Dong Vietnamita"),
        "CH": ("CHF", "Franco Suizo"),
        "NO": ("NOK", "Corona Noruega"),
        "SE": ("SEK", "Corona Sueca"),
        "DK": ("DKK", "Corona Danesa"),
        "PL": ("PLN", "Zloty Polaco"),
        "CZ": ("CZK", "Corona Checa"),
        "HU": ("HUF", "Forint Húngaro"),
        "RO": ("RON", "Leu Rumano"),
        "EG": ("EGP", "Libra Egipcia"),
        "ZA": ("ZAR", "Rand Sudafricano"),
        "IL": ("ILS", "Nuevo Shekel Israelí"),
    }
    
    # Mapeo de ciudades específicas (para casos donde el país no es suficiente)
    ciudad_lower = ciudad.lower()
    mapeo_ciudades = {
        "paris": ("EUR", "Euro"),
        "parís": ("EUR", "Euro"),
        "london": ("GBP", "Libra Esterlina"),
        "londres": ("GBP", "Libra Esterlina"),
        "tokyo": ("JPY", "Yen Japonés"),
        "tokio": ("JPY", "Yen Japonés"),
        "new york": ("USD", "Dólar Estadounidense"),
        "nueva york": ("USD", "Dólar Estadounidense"),
        "sydney": ("AUD", "Dólar Australiano"),
        "sídney": ("AUD", "Dólar Australiano"),
        "dubai": ("AED", "Dirham de los Emiratos Árabes"),
        "singapore": ("SGD", "Dólar de Singapur"),
        "singapur": ("SGD", "Dólar de Singapur"),
    }
    
    # Primero buscar por ciudad
    for ciudad_key, moneda_info in mapeo_ciudades.items():
        if ciudad_key in ciudad_lower:
            return moneda_info
    
    # Si no se encuentra, buscar por código de país
    if pais and pais in mapeo_monedas:
        return mapeo_monedas[pais]
    
    # Si no se encuentra, retornar None
    return None, None


def obtener_tipo_cambio_usd(codigo_moneda: str) -> Optional[float]:
    """
    Obtiene el tipo de cambio de una moneda respecto al USD usando exchangerate-api.io (gratuita).
    
    Args:
        codigo_moneda: Código ISO 4217 de la moneda (ej: EUR, GBP, JPY)
        
    Returns:
        Tipo de cambio (cuántas unidades de la moneda = 1 USD) o None si hay error
    """
    if not codigo_moneda or codigo_moneda == "USD":
        return 1.0  # USD respecto a USD siempre es 1
    
    try:
        # API gratuita de exchangerate-api.io
        url = f"https://api.exchangerate-api.com/v4/latest/USD"
        
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            rates = data.get("rates", {})
            
            if codigo_moneda in rates:
                # La API retorna cuántas unidades de la moneda = 1 USD
                # Para invertir: 1 unidad de la moneda = 1/rate USD
                rate = rates[codigo_moneda]
                return 1.0 / rate if rate != 0 else None
        
        return None
    
    except Exception as e:
        print(f"Error al obtener tipo de cambio para {codigo_moneda}: {str(e)}")
        return None


def calcular_diferencia_horaria(timezone_offset: int) -> str:
    """
    Calcula la diferencia horaria respecto a UTC y la formatea.
    
    Args:
        timezone_offset: Offset en segundos desde UTC
        
    Returns:
        String con la diferencia horaria (ej: "UTC+2", "UTC-5")
    """
    horas = timezone_offset // 3600
    minutos = abs((timezone_offset % 3600) // 60)
    
    if horas >= 0:
        if minutos > 0:
            return f"UTC+{horas}:{minutos:02d}"
        return f"UTC+{horas}"
    else:
        if minutos > 0:
            return f"UTC{horas}:{minutos:02d}"
        return f"UTC{horas}"


def obtener_info_destino(ciudad: str, info_clima: Optional[dict] = None) -> Optional[InfoDestino]:
    """
    Obtiene información completa del destino: temperatura, diferencia horaria y tipo de cambio.
    
    Args:
        ciudad: Nombre de la ciudad
        info_clima: Información del clima obtenida previamente (opcional)
        
    Returns:
        Objeto InfoDestino con toda la información o None si hay error
    """
    try:
        # Si no tenemos info_clima, intentar obtenerla
        if not info_clima:
            info_clima = obtener_clima_actual(ciudad)
        
        if not info_clima:
            return None
        
        # Obtener información de temperatura
        temperatura = info_clima.get("temperatura")
        condicion = info_clima.get("descripcion")
        pais = info_clima.get("pais", "")
        timezone_offset = info_clima.get("timezone_offset", 0)
        
        # Calcular diferencia horaria
        diferencia_horaria = calcular_diferencia_horaria(timezone_offset) if timezone_offset else None
        
        # Obtener información de moneda
        codigo_moneda, nombre_moneda = obtener_codigo_moneda(ciudad, pais)
        tipo_cambio_usd = None
        
        if codigo_moneda:
            tipo_cambio_usd = obtener_tipo_cambio_usd(codigo_moneda)
        
        return InfoDestino(
            temperatura=temperatura,
            condicion=condicion,
            diferencia_horaria=diferencia_horaria,
            moneda_local=nombre_moneda,
            tipo_cambio_usd=tipo_cambio_usd,
            codigo_moneda=codigo_moneda
        )
    
    except Exception as e:
        print(f"Error al obtener información del destino {ciudad}: {str(e)}")
        return None


def obtener_clima_actual(ciudad: str) -> Optional[dict]:
    """
    Obtiene el clima actual de una ciudad usando OpenWeatherMap API.
    
    Args:
        ciudad: Nombre de la ciudad
        
    Returns:
        Diccionario con información del clima o None si hay error
    """
    if not openweather_api_key:
        return None
    
    try:
        # URL de la API de OpenWeatherMap
        url = "http://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": ciudad,
            "appid": openweather_api_key,
            "units": "metric",  # Para obtener temperatura en Celsius
            "lang": "es"  # Respuestas en español
        }
        
        response = requests.get(url, params=params, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extraer información relevante incluyendo timezone
            timezone_offset = data.get("timezone", 0)  # Offset en segundos desde UTC
            clima_info = {
                "ciudad": data.get("name", ciudad),
                "pais": data.get("sys", {}).get("country", ""),
                "temperatura": round(data.get("main", {}).get("temp", 0)),
                "sensacion_termica": round(data.get("main", {}).get("feels_like", 0)),
                "descripcion": data.get("weather", [{}])[0].get("description", "").capitalize(),
                "humedad": data.get("main", {}).get("humidity", 0),
                "viento": round(data.get("wind", {}).get("speed", 0) * 3.6),  # Convertir m/s a km/h
                "visibilidad": data.get("visibility", 0) / 1000 if data.get("visibility") else None,  # Convertir m a km
                "timezone_offset": timezone_offset  # Para calcular diferencia horaria
            }
            
            return clima_info
        else:
            # Si no se encuentra la ciudad, retornar None silenciosamente
            return None
    
    except Exception as e:
        # En caso de error, retornar None sin interrumpir el flujo
        print(f"Error al obtener clima para {ciudad}: {str(e)}")
        return None


def generar_respuesta_con_chatgpt(
    pregunta: str, 
    contexto: Optional[ContextoFormulario] = None, 
    info_clima: Optional[dict] = None,
    historial_anterior: list = None,
    destino_actual: Optional[str] = None
) -> str:
    """
    Función para generar respuestas especializadas usando ChatGPT con personalidad de experto en viajes.
    Incluye historial de conversaciones anteriores para mantener contexto.
    """
    try:
        historial_anterior = historial_anterior or []
        
        # Construir el contexto del usuario si está disponible
        contexto_usuario = ""
        if contexto:
            contexto_usuario = f"""
        
        INFORMACIÓN DEL VIAJERO:
        - Destino: {contexto.destino}
        - Fecha del viaje: {contexto.fecha}
        - Presupuesto: {contexto.presupuesto}
        - Preferencia de viaje: {contexto.preferencia}
        
        IMPORTANTE: Usa esta información en todas tus respuestas para personalizar las recomendaciones. 
        Cuando el usuario haga preguntas, siempre ten en cuenta estos detalles sobre su viaje."""
        
        # Agregar información del clima si está disponible
        info_clima_str = ""
        if info_clima:
            visibilidad_str = f", Visibilidad: {info_clima['visibilidad']:.1f} km" if info_clima.get('visibilidad') else ""
            info_clima_str = f"""
        
        CLIMA ACTUAL EN {info_clima['ciudad'].upper()} ({info_clima.get('pais', '')}):
        - Temperatura: {info_clima['temperatura']}°C (sensación térmica: {info_clima['sensacion_termica']}°C)
        - Condición: {info_clima['descripcion']}
        - Humedad: {info_clima['humedad']}%
        - Viento: {info_clima['viento']} km/h{visibilidad_str}
        
        IMPORTANTE: Incluye esta información del clima actual en tu respuesta, especialmente en la sección de 
        "ä CONSEJOS LOCALES" para dar recomendaciones sobre qué ropa llevar y actividades según el clima. 
        Si el clima es extremo (muy frío, muy caliente, lluvioso), destácalo en tus consejos."""
        
        # Construir contexto del historial de conversaciones
        contexto_historial = ""
        if historial_anterior and len(historial_anterior) > 0:
            contexto_historial = "\n\nCONVERSACIONES ANTERIORES:\n"
            for i, msg in enumerate(historial_anterior[-5:], 1):  # Últimas 5 conversaciones
                contexto_historial += f"\n{i}. Usuario: {msg.get('pregunta', '')}\n"
                contexto_historial += f"   ViajeIA: {msg.get('respuesta', '')[:200]}...\n"  # Primeros 200 caracteres
            
            contexto_historial += "\nIMPORTANTE: El usuario puede hacer preguntas de seguimiento sobre destinos o temas mencionados anteriormente. "
            contexto_historial += "Si pregunta 'allí', 'ahí', 'ese lugar', se refiere al último destino mencionado en la conversación."
        
        # Si hay un destino actual pero no está en el contexto, mencionarlo
        contexto_destino_actual = ""
        if destino_actual and (not contexto or contexto.destino != destino_actual):
            contexto_destino_actual = f"\n\nDESTINO ACTUAL DE LA CONVERSACIÓN: {destino_actual}\n"
            contexto_destino_actual += "Si el usuario hace preguntas sobre 'allí', 'ahí', 'ese lugar', se refiere a este destino."
        
        # Crear el mensaje del sistema que define el rol y personalidad del asistente
        system_message = """Eres ViajeIA, un asistente virtual experto en viajes con más de 15 años de experiencia 
        ayudando a viajeros a crear experiencias inolvidables. Tienes una personalidad entusiasta, amigable y 
        apasionada por los viajes.

        CARACTERÍSTICAS DE TU PERSONALIDAD:
        - Eres entusiasta y positivo sobre los viajes
        - Haces preguntas inteligentes para entender mejor las necesidades del viajero
        - Compartes consejos prácticos basados en experiencia real
        - Usas un tono conversacional pero profesional
        - Te emocionas cuando alguien planea un viaje especial

        ESPECIALIZACIÓN:
        - Planificación de itinerarios detallados día por día
        - Recomendaciones de destinos según presupuesto, intereses y temporada
        - Consejos para encontrar vuelos, hoteles y transporte
        - Tips de viajero experimentado (qué llevar, qué evitar, cómo ahorrar)
        - Recomendaciones gastronómicas y culturales
        - Planificación de presupuestos realistas

        FORMATO DE RESPUESTA (OBLIGATORIO):
        SIEMPRE debes responder usando EXACTAMENTE esta estructura con estos símbolos:
        
        » ALOJAMIENTO: [recomendaciones de hoteles, hostales, o alojamientos según el presupuesto]
        
        Þ COMIDA LOCAL: [recomendaciones de restaurantes, platos típicos, y experiencias gastronómicas]
        
        LUGARES IMPERDIBLES: [lugares que definitivamente debe visitar el viajero]
        
        ä CONSEJOS LOCALES: [tips especiales, qué evitar, costumbres locales, secretos del destino]
        
        ø ESTIMACIÓN DE COSTOS: [desglose aproximado de gastos por categoría basado en el presupuesto]
        
        REGLAS IMPORTANTES:
        - NUNCA cambies estos símbolos (», Þ, , ä, ø)
        - SIEMPRE incluye las 5 secciones en este orden exacto
        - Si falta información, usa la información del contexto del formulario o haz suposiciones razonables
        - Mantén un tono entusiasta pero informativo
        - Personaliza cada sección según el destino, presupuesto y preferencias del usuario
        - Responde siempre en español
        - Si hay información del clima actual, inclúyela naturalmente en tus respuestas, especialmente en los consejos locales
        - Si hay conversaciones anteriores, úsalas como contexto para entender referencias como "allí", "ahí", "ese lugar"
        - Mantén coherencia con las respuestas anteriores
        """ + contexto_usuario + info_clima_str + contexto_historial + contexto_destino_actual
        
        # Construir mensajes incluyendo historial si existe
        messages = [{"role": "system", "content": system_message}]
        
        # Agregar historial anterior como mensajes (si existe)
        if historial_anterior:
            for msg in historial_anterior[-10:]:  # Últimos 10 mensajes para contexto
                messages.append({"role": "user", "content": msg.get("pregunta", "")})
                messages.append({"role": "assistant", "content": msg.get("respuesta", "")})
        
        # Agregar la pregunta actual
        messages.append({"role": "user", "content": pregunta})
        
        # Llamar a la API de OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=1000,  # Aumentado para respuestas estructuradas y detalladas
            temperature=0.8  # Aumentado para respuestas más creativas y con personalidad
        )
        
        # Extraer la respuesta generada
        respuesta = response.choices[0].message.content
        return respuesta
    
    except Exception as e:
        # Si hay un error, devolver un mensaje amigable con personalidad
        return f"¡Ups! 😅 Hubo un pequeño problema técnico mientras procesaba tu solicitud. Por favor, intenta de nuevo en un momento. Si el problema persiste, verifica tu conexión a internet. Error: {str(e)}"

