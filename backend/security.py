"""
Módulo de Seguridad para ViajeIA Backend

Contiene funciones para validación, sanitización y seguridad
"""

import re
import html
from typing import Optional, Tuple
from fastapi import HTTPException

# Importar constantes de configuración
try:
    from config import MIN_QUESTION_LENGTH, MAX_QUESTION_LENGTH
except ImportError:
    # Valores por defecto si config.py no está disponible
    MIN_QUESTION_LENGTH = 10
    MAX_QUESTION_LENGTH = 500


def sanitizar_texto(texto: str, max_length: int = 1000) -> str:
    """
    Sanitiza texto para prevenir XSS y otros ataques
    
    Args:
        texto: Texto a sanitizar
        max_length: Longitud máxima permitida
        
    Returns:
        Texto sanitizado
    """
    if not texto:
        return ""
    
    # Escapar caracteres HTML peligrosos
    texto_sanitizado = html.escape(texto)
    
    # Limitar longitud
    if len(texto_sanitizado) > max_length:
        texto_sanitizado = texto_sanitizado[:max_length]
    
    return texto_sanitizado.strip()


def validar_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    Valida un correo electrónico
    
    Args:
        email: Email a validar
        
    Returns:
        Tupla (es_valido, error_mensaje)
    """
    if not email:
        return False, "El correo electrónico es obligatorio"
    
    email = email.strip().lower()
    
    # Verificar formato básico
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        return False, "El formato del correo electrónico no es válido"
    
    # Verificar longitud máxima
    if len(email) > 254:
        return False, "El correo electrónico es demasiado largo"
    
    # Verificar caracteres peligrosos
    peligrosos = ['<', '>', '"', "'", ';', '%', '(', ')', '&', '+']
    if any(caracter in email for caracter in peligrosos):
        return False, "El correo electrónico contiene caracteres no permitidos"
    
    return True, None


def validar_pregunta(pregunta: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Valida una pregunta del usuario
    
    Args:
        pregunta: Pregunta a validar
        
    Returns:
        Tupla (es_valida, error_mensaje, pregunta_sanitizada)
    """
    if not pregunta:
        return False, "La pregunta es obligatoria", None
    
    pregunta_trim = pregunta.strip()
    
    # Verificar longitud mínima
    if len(pregunta_trim) < MIN_QUESTION_LENGTH:
        return False, f"La pregunta debe tener al menos {MIN_QUESTION_LENGTH} caracteres", None
    
    # Truncamiento automático si excede MAX_QUESTION_LENGTH caracteres
    if len(pregunta_trim) > MAX_QUESTION_LENGTH:
        pregunta_trim = pregunta_trim[:MAX_QUESTION_LENGTH]
    
    # Verificar que no sea solo espacios o caracteres especiales
    if not re.search(r'[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]', pregunta_trim):
        return False, "La pregunta debe contener texto válido", None
    
    # Sanitizar la pregunta (con truncamiento automático si excede MAX_QUESTION_LENGTH caracteres)
    pregunta_sanitizada = sanitizar_texto(pregunta_trim, max_length=MAX_QUESTION_LENGTH)
    
    return True, None, pregunta_sanitizada


def validar_destino(destino: Optional[str]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Valida un nombre de destino
    
    Args:
        destino: Nombre del destino a validar
        
    Returns:
        Tupla (es_valido, error_mensaje, destino_sanitizado)
    """
    if not destino:
        return True, None, None  # Destino es opcional
    
    destino_trim = destino.strip()
    
    # Verificar longitud
    if len(destino_trim) < 2:
        return False, "El destino debe tener al menos 2 caracteres", None
    
    if len(destino_trim) > 100:
        return False, "El destino no puede exceder 100 caracteres", None
    
    # Verificar formato (solo letras, espacios y algunos caracteres especiales)
    if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\'-]+$', destino_trim):
        return False, "El destino contiene caracteres no permitidos", None
    
    return True, None, destino_trim


def validar_presupuesto(presupuesto: Optional[str]) -> Tuple[bool, Optional[str], Optional[float]]:
    """
    Valida un presupuesto
    
    Args:
        presupuesto: Presupuesto a validar (puede ser string o número)
        
    Returns:
        Tupla (es_valido, error_mensaje, presupuesto_numerico)
    """
    if not presupuesto:
        return True, None, None  # Presupuesto es opcional
    
    # Convertir a string y limpiar
    presupuesto_str = str(presupuesto).strip().replace(',', '').replace('$', '')
    
    try:
        presupuesto_num = float(presupuesto_str)
        
        # Verificar que sea positivo
        if presupuesto_num < 0:
            return False, "El presupuesto no puede ser negativo", None
        
        # Verificar límite máximo razonable (ej: 1 millón)
        if presupuesto_num > 1000000:
            return False, "El presupuesto excede el límite máximo permitido", None
        
        return True, None, presupuesto_num
        
    except ValueError:
        return False, "El presupuesto debe ser un número válido", None

