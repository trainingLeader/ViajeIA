"""
Configuración de Logging para ViajeIA Backend

Sistema de logging mejorado para registrar eventos y errores
"""

import logging
import os
from datetime import datetime
from pathlib import Path

def setup_logger(name: str = "viajeia") -> logging.Logger:
    """
    Configura un logger con archivo y consola
    
    Args:
        name: Nombre del logger
        
    Returns:
        Logger configurado
    """
    # Crear directorio de logs si no existe
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Crear logger
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Evitar duplicar handlers si ya existen
    if logger.handlers:
        return logger
    
    # Formato de los logs
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Handler para archivo (un archivo por día)
    log_file = log_dir / f"viajeia_{datetime.now().strftime('%Y%m%d')}.log"
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    
    # Handler para consola
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # Agregar handlers al logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Crear logger global
logger = setup_logger()

