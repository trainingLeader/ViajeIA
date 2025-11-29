"""
Rate Limiting para ViajeIA Backend

Limita la cantidad de peticiones que un usuario puede hacer
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException

# Configurar rate limiter
limiter = Limiter(key_func=get_remote_address)


def setup_rate_limiter(app):
    """
    Configura el rate limiter en la aplicación FastAPI
    
    Args:
        app: Instancia de FastAPI
    """
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Decoradores de rate limiting predefinidos
def rate_limit_planificar():
    """Rate limit para el endpoint de planificación (10 por minuto)"""
    return limiter.limit("10/minute")


def rate_limit_estadisticas():
    """Rate limit para el endpoint de estadísticas (30 por minuto)"""
    return limiter.limit("30/minute")


def rate_limit_general():
    """Rate limit general (60 por minuto)"""
    return limiter.limit("60/minute")

