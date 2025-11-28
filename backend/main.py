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


class PreguntaRequest(BaseModel):
    pregunta: str


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
        
        # Llamar a ChatGPT para obtener la respuesta
        respuesta = generar_respuesta_con_chatgpt(pregunta)
        
        return RespuestaResponse(respuesta=respuesta)
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al procesar la solicitud: {str(e)}"
        )


def generar_respuesta_con_chatgpt(pregunta: str) -> str:
    """
    Función simple para generar respuestas usando ChatGPT de OpenAI.
    """
    try:
        # Crear el mensaje del sistema que define el rol del asistente
        system_message = """Eres un asistente experto en viajes llamado ViajeIA. 
        Ayudas a las personas a planificar sus viajes proporcionando consejos útiles, 
        recomendaciones y información práctica sobre destinos, alojamientos, vuelos, 
        itinerarios y presupuestos. Responde siempre en español de manera amigable y profesional."""
        
        # Llamar a la API de OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": pregunta}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        # Extraer la respuesta generada
        respuesta = response.choices[0].message.content
        return respuesta
    
    except Exception as e:
        # Si hay un error, devolver un mensaje amigable
        return f"Lo siento, hubo un problema al comunicarse con ChatGPT. Por favor intenta de nuevo. Error: {str(e)}"

