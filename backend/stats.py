"""
Sistema de estadísticas simple para ViajeIA
Almacena estadísticas en un archivo JSON
"""
import json
import os
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional

STATS_FILE = "stats.json"

def load_stats() -> Dict:
    """Cargar estadísticas desde el archivo JSON"""
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            # Si hay error, retornar estructura por defecto
            pass
    return {
        "total_usuarios": 0,
        "usuarios_unicos": set(),
        "consultas_por_dia": {},
        "destinos_consultados": {},
        "total_consultas": 0
    }

def save_stats(stats: Dict):
    """Guardar estadísticas en el archivo JSON"""
    # Convertir set a list para JSON
    stats_to_save = stats.copy()
    if "usuarios_unicos" in stats_to_save and isinstance(stats_to_save["usuarios_unicos"], set):
        stats_to_save["usuarios_unicos"] = list(stats_to_save["usuarios_unicos"])
    
    try:
        with open(STATS_FILE, 'w', encoding='utf-8') as f:
            json.dump(stats_to_save, f, indent=2, ensure_ascii=False)
    except IOError as e:
        print(f"Error al guardar estadísticas: {e}")

def extraer_destino_simple(texto: str) -> Optional[str]:
    """Extraer destino de un texto (versión simplificada)"""
    if not texto:
        return None
    
    texto_lower = texto.lower()
    destinos_comunes = [
        'parís', 'paris', 'tokio', 'tokyo', 'nueva york', 'new york',
        'londres', 'london', 'roma', 'rome', 'barcelona', 'madrid',
        'berlín', 'berlin', 'amsterdam', 'atenas', 'athens', 'dubai',
        'singapur', 'singapore', 'sydney', 'sídney', 'melbourne',
        'toronto', 'montreal', 'vancouver', 'miami', 'los angeles',
        'san francisco', 'chicago', 'boston', 'lisboa', 'lisbon',
        'prague', 'praga', 'viena', 'vienna', 'budapest', 'cracovia',
        'krakow', 'bangkok', 'seúl', 'seoul', 'hong kong',
        'shanghai', 'pekin', 'beijing', 'moscú', 'moscow',
        'sao paulo', 'rio de janeiro', 'buenos aires', 'santiago',
        'lima', 'bogotá', 'bogota', 'cancún', 'cancun', 'tulum',
        'cartagena', 'medellín', 'medellin', 'guadalajara', 'queretaro'
    ]
    
    for dest in destinos_comunes:
        if dest in texto_lower:
            # Capitalizar correctamente
            palabras = dest.split(' ')
            return ' '.join(word.capitalize() for word in palabras)
    return None

def registrar_consulta(usuario_id: str = None, destino: str = None, pregunta: str = None):
    """
    Registrar una nueva consulta en las estadísticas
    
    Args:
        usuario_id: ID único del usuario (opcional, se genera si no se proporciona)
        destino: Nombre del destino consultado (opcional)
        pregunta: Texto de la pregunta (opcional, para extraer destino)
    """
    stats = load_stats()
    
    # Convertir set de usuarios únicos a list si es necesario
    if isinstance(stats.get("usuarios_unicos"), list):
        stats["usuarios_unicos"] = set(stats["usuarios_unicos"])
    elif "usuarios_unicos" not in stats:
        stats["usuarios_unicos"] = set()
    
    # Generar ID de usuario si no se proporciona (basado en timestamp)
    if not usuario_id:
        usuario_id = f"user_{datetime.now().timestamp()}"
    
    # Agregar usuario único
    stats["usuarios_unicos"].add(usuario_id)
    stats["total_usuarios"] = len(stats["usuarios_unicos"])
    
    # Registrar consulta por día
    fecha_actual = date.today().isoformat()
    if fecha_actual not in stats["consultas_por_dia"]:
        stats["consultas_por_dia"][fecha_actual] = 0
    stats["consultas_por_dia"][fecha_actual] += 1
    
    # Intentar obtener destino si no se proporciona
    if not destino and pregunta:
        destino = extraer_destino_simple(pregunta)
    
    # Registrar destino consultado
    if destino:
        destino_normalizado = destino.lower().strip()
        if destino_normalizado not in stats["destinos_consultados"]:
            stats["destinos_consultados"][destino_normalizado] = 0
        stats["destinos_consultados"][destino_normalizado] += 1
    
    # Incrementar total de consultas
    stats["total_consultas"] = stats.get("total_consultas", 0) + 1
    
    # Guardar estadísticas
    save_stats(stats)

def obtener_estadisticas() -> Dict:
    """
    Obtener estadísticas formateadas para la API
    
    Returns:
        Diccionario con estadísticas formateadas
    """
    stats = load_stats()
    
    # Convertir set a list
    if isinstance(stats.get("usuarios_unicos"), set):
        usuarios_unicos_list = list(stats["usuarios_unicos"])
    else:
        usuarios_unicos_list = stats.get("usuarios_unicos", [])
    
    # Obtener destinos más consultados (top 10)
    destinos_consultados = stats.get("destinos_consultados", {})
    destinos_ordenados = sorted(
        destinos_consultados.items(),
        key=lambda x: x[1],
        reverse=True
    )[:10]
    
    # Obtener consultas por día (últimos 30 días)
    consultas_por_dia = stats.get("consultas_por_dia", {})
    
    # Filtrar últimos 30 días
    fecha_actual = date.today()
    consultas_recientes = {}
    for i in range(30):
        fecha = (fecha_actual - timedelta(days=i)).isoformat()
        consultas_recientes[fecha] = consultas_por_dia.get(fecha, 0)
    
    # Obtener consultas de hoy
    consultas_hoy = consultas_por_dia.get(fecha_actual.isoformat(), 0)
    
    return {
        "total_usuarios": len(usuarios_unicos_list),
        "total_consultas": stats.get("total_consultas", 0),
        "consultas_hoy": consultas_hoy,
        "destinos_mas_consultados": [
            {"destino": destino.capitalize(), "consultas": count}
            for destino, count in destinos_ordenados
        ],
        "consultas_por_dia": [
            {"fecha": fecha, "consultas": count}
            for fecha, count in sorted(consultas_recientes.items(), reverse=True)
            if count > 0
        ]
    }

