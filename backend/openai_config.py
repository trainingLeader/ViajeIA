"""
Configuración y Gestión de OpenAI

Permite configurar el modelo, max_tokens y gestionar el historial de mensajes
para evitar superar los límites de tokens.
"""

import os
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración por defecto
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
DEFAULT_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "1500"))
DEFAULT_MAX_CONTEXT_TOKENS = int(os.getenv("OPENAI_MAX_CONTEXT_TOKENS", "3000"))

# Límites de tokens por modelo (límite de contexto total)
MODEL_TOKEN_LIMITS = {
    "gpt-3.5-turbo": 4096,
    "gpt-3.5-turbo-16k": 16385,
    "gpt-4": 8192,
    "gpt-4-turbo": 128000,
    "gpt-4-turbo-preview": 128000,
    "gpt-4-32k": 32768,
    "gpt-4o": 128000,
    "gpt-4o-mini": 128000,
}

# Tasa de aproximación: aproximadamente 4 caracteres = 1 token (para español)
# Esto es una estimación, OpenAI usa un tokenizer más sofisticado
CHARS_PER_TOKEN = 4


def estimar_tokens(texto: str) -> int:
    """
    Estima el número de tokens en un texto.
    
    Nota: Esta es una estimación aproximada. OpenAI usa un tokenizer más sofisticado,
    pero esta aproximación es suficiente para limitar el historial.
    
    Args:
        texto: Texto a estimar
        
    Returns:
        Número estimado de tokens
    """
    if not texto:
        return 0
    
    # Aproximación: 4 caracteres = 1 token (más preciso para español/inglés)
    # Agregamos un pequeño buffer para ser conservadores
    return len(texto) // CHARS_PER_TOKEN + 10  # +10 como buffer


def estimar_tokens_mensajes(mensajes: List[Dict[str, str]]) -> int:
    """
    Estima el número total de tokens en una lista de mensajes.
    
    Args:
        mensajes: Lista de mensajes en formato OpenAI (con 'role' y 'content')
        
    Returns:
        Número total estimado de tokens
    """
    total_tokens = 0
    
    for mensaje in mensajes:
        # Cada mensaje tiene overhead: role + estructura JSON (~10 tokens)
        total_tokens += 10
        # Contar tokens del contenido
        contenido = mensaje.get("content", "")
        total_tokens += estimar_tokens(contenido)
    
    return total_tokens


def limitar_historial_por_tokens(
    mensajes: List[Dict[str, str]],
    modelo: str = DEFAULT_MODEL,
    max_tokens_respuesta: int = DEFAULT_MAX_TOKENS,
    reservar_tokens_sistema: int = 500  # Tokens para system message y overhead
) -> List[Dict[str, str]]:
    """
    Limita el historial de mensajes para que no supere el límite de tokens del modelo.
    
    Mantiene siempre:
    - El mensaje del sistema (si existe)
    - El mensaje del usuario más reciente
    
    Luego agrega mensajes anteriores desde el más reciente hasta el más antiguo,
    hasta que se alcance el límite.
    
    Args:
        mensajes: Lista completa de mensajes (puede incluir system, user, assistant)
        modelo: Modelo de OpenAI a usar
        max_tokens_respuesta: Tokens máximos para la respuesta
        reservar_tokens_sistema: Tokens a reservar para system message y overhead
        
    Returns:
        Lista de mensajes limitada que cabe dentro del límite de tokens
    """
    if not mensajes:
        return []
    
    # Obtener límite de tokens del modelo
    max_context_tokens = MODEL_TOKEN_LIMITS.get(modelo, 4096)
    
    # Calcular tokens disponibles para el historial
    # Reservamos espacio para: system message, respuesta, y overhead
    tokens_disponibles = max_context_tokens - max_tokens_respuesta - reservar_tokens_sistema
    
    if tokens_disponibles < 0:
        # Si el límite es muy bajo, solo devolver el último mensaje
        return mensajes[-1:] if mensajes else []
    
    # Separar mensaje del sistema (si existe) y otros mensajes
    mensaje_sistema = None
    otros_mensajes = []
    
    for mensaje in mensajes:
        if mensaje.get("role") == "system":
            mensaje_sistema = mensaje
        else:
            otros_mensajes.append(mensaje)
    
    # Si no hay otros mensajes, devolver solo el sistema
    if not otros_mensajes:
        return [mensaje_sistema] if mensaje_sistema else []
    
    # Asegurarnos de tener al menos el último mensaje del usuario
    mensajes_limitados = []
    
    # Agregar mensaje del sistema primero (si existe)
    if mensaje_sistema:
        mensajes_limitados.append(mensaje_sistema)
        tokens_usados = estimar_tokens_mensajes(mensajes_limitados)
    else:
        tokens_usados = 0
    
    # Agregar mensajes desde el más reciente hasta el más antiguo
    # hasta alcanzar el límite
    for mensaje in reversed(otros_mensajes):
        tokens_mensaje = estimar_tokens_mensajes([mensaje])
        
        if tokens_usados + tokens_mensaje <= tokens_disponibles:
            # Insertar al principio (para mantener orden cronológico)
            mensajes_limitados.insert(1 if mensaje_sistema else 0, mensaje)
            tokens_usados += tokens_mensaje
        else:
            # Si este mensaje no cabe, detener (ya tenemos los más recientes)
            break
    
    # Si no pudimos agregar ningún mensaje (excepto system), al menos agregar el último
    if len(mensajes_limitados) == (1 if mensaje_sistema else 0) and otros_mensajes:
        # Agregar solo el último mensaje del usuario
        mensajes_limitados.append(otros_mensajes[-1])
    
    return mensajes_limitados


def obtener_configuracion_openai(
    modelo: Optional[str] = None,
    max_tokens: Optional[int] = None
) -> Dict[str, any]:
    """
    Obtiene la configuración de OpenAI con valores por defecto.
    
    Args:
        modelo: Modelo a usar (si no se especifica, usa el de configuración)
        max_tokens: Máximo de tokens para la respuesta (si no se especifica, usa el de configuración)
        
    Returns:
        Diccionario con la configuración: {modelo, max_tokens}
    """
    return {
        "modelo": modelo or DEFAULT_MODEL,
        "max_tokens": max_tokens or DEFAULT_MAX_TOKENS,
        "max_context_tokens": MODEL_TOKEN_LIMITS.get(modelo or DEFAULT_MODEL, 4096)
    }


def validar_configuracion(
    modelo: str,
    max_tokens: int,
    historial: Optional[List[Dict[str, str]]] = None
) -> tuple[bool, Optional[str]]:
    """
    Valida que la configuración sea válida antes de hacer la llamada a OpenAI.
    
    Args:
        modelo: Modelo a usar
        max_tokens: Máximo de tokens para la respuesta
        historial: Historial de mensajes (opcional)
        
    Returns:
        Tupla (es_valido, mensaje_error)
    """
    # Validar modelo
    if modelo not in MODEL_TOKEN_LIMITS:
        return False, f"Modelo '{modelo}' no es válido o no está soportado"
    
    # Validar max_tokens
    if max_tokens <= 0:
        return False, "max_tokens debe ser mayor que 0"
    
    max_context = MODEL_TOKEN_LIMITS[modelo]
    
    if max_tokens > max_context:
        return False, f"max_tokens ({max_tokens}) no puede ser mayor que el límite del modelo ({max_context})"
    
    # Validar historial si se proporciona
    if historial:
        tokens_historial = estimar_tokens_mensajes(historial)
        tokens_totales = tokens_historial + max_tokens
        
        if tokens_totales > max_context:
            return False, (
                f"El historial y max_tokens exceden el límite del modelo. "
                f"Historial: ~{tokens_historial} tokens, "
                f"max_tokens: {max_tokens}, "
                f"Total: ~{tokens_totales} tokens, "
                f"Límite: {max_context} tokens"
            )
    
    return True, None

