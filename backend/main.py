from fastapi import FastAPI, HTTPException  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel  # pyright: ignore[reportMissingImports]
from typing import Optional
import os
from openai import OpenAI  # pyright: ignore[reportMissingImports]
from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]

# Cargar variables de entorno desde el archivo .env
load_dotenv()

app = FastAPI(title="ViajeIA API", version="1.0.0")

# Inicializar el cliente de OpenAI
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Por favor, configura OPENAI_API_KEY en tu archivo .env")

client = OpenAI(api_key=openai_api_key)

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


class RespuestaResponse(BaseModel):
    respuesta: str


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
        
        # Llamar a ChatGPT para obtener la respuesta
        respuesta = generar_respuesta_con_chatgpt(pregunta, contexto)
        
        return RespuestaResponse(respuesta=respuesta)
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al procesar la solicitud: {str(e)}"
        )


def generar_respuesta_con_chatgpt(pregunta: str, contexto: Optional[ContextoFormulario] = None) -> str:
    """
    Función para generar respuestas especializadas usando ChatGPT con personalidad de experto en viajes.
    """
    try:
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

        ESTILO DE RESPUESTAS:
        - Usa formato estructurado con listas numeradas cuando sea apropiado
        - Haz preguntas de seguimiento relevantes para personalizar las recomendaciones
        - Incluye detalles específicos y prácticos
        - Usa emojis ocasionalmente para hacer la conversación más amigable (✈️ 🗺️ 🏨 🌍)
        - Responde siempre en español

        EJEMPLO DE INTERACCIÓN:
        Usuario: "Quiero viajar a París"
        Tú: "¡Excelente elección! París es una ciudad mágica. Para ayudarte mejor, necesito saber:
        
        🗓️ ¿Cuándo planeas viajar? (esto afecta precios y clima)
        👥 ¿Cuántas personas viajan?
        💰 ¿Cuál es tu presupuesto aproximado?
        ⏱️ ¿Cuántos días estarás en París?
        🎯 ¿Qué te interesa más? (museos, gastronomía, compras, vida nocturna, etc.)
        
        Con esta información, puedo crear un itinerario perfecto para ti. ¿Qué te gustaría hacer primero?"
        """ + contexto_usuario
        
        # Llamar a la API de OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": pregunta}
            ],
            max_tokens=800,  # Aumentado para respuestas más detalladas
            temperature=0.8  # Aumentado para respuestas más creativas y con personalidad
        )
        
        # Extraer la respuesta generada
        respuesta = response.choices[0].message.content
        return respuesta
    
    except Exception as e:
        # Si hay un error, devolver un mensaje amigable con personalidad
        return f"¡Ups! 😅 Hubo un pequeño problema técnico mientras procesaba tu solicitud. Por favor, intenta de nuevo en un momento. Si el problema persiste, verifica tu conexión a internet. Error: {str(e)}"

