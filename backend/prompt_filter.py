"""
Sistema de Filtrado de Prompts Peligrosos

Protege el asistente contra prompts maliciosos o fuera de contexto
"""

import re
from typing import Tuple, List, Optional

# Lista de palabras y frases peligrosas o sospechosas
PALABRAS_PELIGROSAS = [
    # Intentos de jailbreak o manipulación del sistema
    'ignora las instrucciones anteriores',
    'forget all previous',
    'act as if',
    'pretend to be',
    'you are now',
    'from now on',
    'disregard',
    'ignore',
    'bypass',
    'override',
    'hack',
    'exploit',
    'vulnerability',
    'security flaw',
    
    # Comandos del sistema
    'elimina mi historial',
    'delete my history',
    'clear cache',
    'reset system',
    'shutdown',
    'restart',
    'format',
    'erase',
    'destroy',
    
    # Intentos de hacer que el asistente actúe como otra cosa
    'act as',
    'you are',
    'pretend you are',
    'roleplay as',
    'simulate',
    'imitate',
    'celebrity',
    'famous person',
    'famous actor',
    'famous singer',
    
    # Contenido inapropiado
    'inappropriate',
    'offensive',
    'illegal',
    'harmful',
    'dangerous',
    
    # Intentos de acceso a información del sistema
    'show me your',
    'what is your',
    'tell me your',
    'reveal your',
    'system prompt',
    'instructions',
    'configuration',
    'settings',
    'api key',
    'password',
    'credentials',
    
    # Comandos de programación
    'execute',
    'run code',
    'run command',
    'system(',
    'eval(',
    'exec(',
    'import os',
    'subprocess',
    
    # Otros intentos sospechosos
    'jailbreak',
    'dan mode',
    'developer mode',
    'god mode',
    'unrestricted',
    'unlimited'
]

# Frases que deben estar presentes para que sea sobre viajes
PALABRAS_VIAJES = [
    'viaje', 'travel', 'trip', 'vacation', 'vacaciones',
    'destino', 'destination', 'lugar', 'place', 'ciudad', 'city',
    'hotel', 'alojamiento', 'accommodation', 'hostal', 'hostel',
    'vuelo', 'flight', 'avión', 'plane', 'aeropuerto', 'airport',
    'itinerario', 'itinerary', 'plan', 'planificar', 'planning',
    'recomendación', 'recommendation', 'sugerencia', 'suggestion',
    'presupuesto', 'budget', 'gasto', 'cost', 'precio', 'price',
    'restaurante', 'restaurant', 'comida', 'food', 'gastronomía',
    'atracción', 'attraction', 'turismo', 'tourism', 'turista',
    'playa', 'beach', 'montaña', 'mountain', 'museo', 'museum',
    'cultura', 'culture', 'aventura', 'adventure', 'relajación',
    'visitar', 'visit', 'conocer', 'know', 'explorar', 'explore',
    'país', 'country', 'continente', 'continent'
]

def normalizar_texto(texto: str) -> str:
    """
    Normaliza el texto para comparación (minúsculas, sin acentos básicos)
    
    Args:
        texto: Texto a normalizar
        
    Returns:
        Texto normalizado
    """
    if not texto:
        return ""
    
    texto = texto.lower().strip()
    
    # Reemplazar caracteres especiales comunes
    reemplazos = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'ñ': 'n', 'ü': 'u'
    }
    
    for original, reemplazo in reemplazos.items():
        texto = texto.replace(original, reemplazo)
    
    return texto

def detectar_palabras_peligrosas(texto: str) -> List[str]:
    """
    Detecta palabras o frases peligrosas en el texto
    
    Args:
        texto: Texto a analizar
        
    Returns:
        Lista de palabras peligrosas encontradas
    """
    texto_normalizado = normalizar_texto(texto)
    palabras_encontradas = []
    
    for palabra_peligrosa in PALABRAS_PELIGROSAS:
        # Buscar la palabra completa (no solo como substring)
        # Usar regex para buscar palabras completas
        pattern = r'\b' + re.escape(palabra_peligrosa.lower()) + r'\b'
        if re.search(pattern, texto_normalizado, re.IGNORECASE):
            palabras_encontradas.append(palabra_peligrosa)
    
    return palabras_encontradas

def es_sobre_viajes(texto: str) -> Tuple[bool, Optional[str]]:
    """
    Verifica si el texto es sobre viajes
    
    Args:
        texto: Texto a verificar
        
    Returns:
        Tupla (es_sobre_viajes, razon_si_no)
    """
    if not texto or len(texto.strip()) < 10:
        return False, "El texto es muy corto para determinar el tema"
    
    texto_normalizado = normalizar_texto(texto)
    
    # Contar cuántas palabras relacionadas con viajes aparecen
    coincidencias = 0
    for palabra_viaje in PALABRAS_VIAJES:
        if palabra_viaje.lower() in texto_normalizado:
            coincidencias += 1
    
    # Si hay al menos 1 palabra relacionada con viajes, probablemente es sobre viajes
    if coincidencias >= 1:
        return True, None
    
    # Si no hay palabras de viajes, verificar si es claramente sobre otra cosa
    indicadores_no_viajes = [
        'programming', 'código', 'code', 'software', 'aplicación',
        'matemáticas', 'mathematics', 'física', 'physics',
        'historia del mundo', 'world history', 'política', 'politics',
        'medicina', 'medicine', 'salud', 'health', 'enfermedad'
    ]
    
    for indicador in indicadores_no_viajes:
        if indicador.lower() in texto_normalizado:
            return False, f"Esta pregunta parece ser sobre '{indicador}', no sobre viajes"
    
    # Si no hay indicadores claros, pero tampoco palabras de viajes, ser más estricto
    return False, "Por favor, haz una pregunta relacionada con viajes y planificación de viajes"

def validar_prompt(pregunta: str) -> Tuple[bool, Optional[str], Optional[List[str]]]:
    """
    Valida un prompt antes de enviarlo a OpenAI
    
    Args:
        pregunta: Pregunta del usuario
        
    Returns:
        Tupla (es_valido, mensaje_error, palabras_peligrosas_encontradas)
    """
    if not pregunta or len(pregunta.strip()) < 5:
        return False, "La pregunta es muy corta. Por favor, proporciona más detalles.", None
    
    # 1. Verificar que sea sobre viajes
    es_viaje, razon = es_sobre_viajes(pregunta)
    if not es_viaje:
        return False, razon or "Por favor, haz una pregunta relacionada con viajes", None
    
    # 2. Detectar palabras peligrosas
    palabras_peligrosas = detectar_palabras_peligrosas(pregunta)
    if palabras_peligrosas:
        mensaje = (
            "Lo siento, tu pregunta contiene instrucciones que no puedo procesar. "
            "Por favor, haz una pregunta relacionada con planificación de viajes, "
            "destinos, recomendaciones turísticas, o información sobre viajes."
        )
        return False, mensaje, palabras_peligrosas
    
    # 3. Verificar longitud máxima (prevenir prompts muy largos que podrían contener código)
    if len(pregunta) > 2000:
        return False, "La pregunta es demasiado larga. Por favor, sé más conciso (máximo 2000 caracteres).", None
    
    # 4. Verificar que no sea principalmente código o comandos
    lineas_codigo = pregunta.count('\n')
    if lineas_codigo > 5:
        # Si tiene muchas líneas, podría ser código
        caracteres_especiales = sum(1 for c in pregunta if c in '{}[]();=<>')
        if caracteres_especiales > len(pregunta) * 0.1:  # Más del 10% son caracteres especiales
            return False, "Por favor, haz una pregunta sobre viajes, no código de programación.", None
    
    # Si pasa todas las validaciones
    return True, None, None

def sanitizar_prompt(pregunta: str) -> str:
    """
    Sanitiza un prompt removiendo caracteres peligrosos pero manteniendo el contenido válido
    
    Args:
        pregunta: Pregunta a sanitizar
        
    Returns:
        Pregunta sanitizada
    """
    if not pregunta:
        return ""
    
    # Remover caracteres de control
    pregunta = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', pregunta)
    
    # Limitar longitud
    if len(pregunta) > 2000:
        pregunta = pregunta[:2000]
    
    # Remover múltiples espacios
    pregunta = re.sub(r'\s+', ' ', pregunta)
    
    return pregunta.strip()

