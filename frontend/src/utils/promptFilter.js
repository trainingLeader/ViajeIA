/**
 * Filtro de Prompts en el Frontend
 * 
 * Validación básica en el cliente antes de enviar al backend
 * (La validación principal está en el backend)
 */

// Lista básica de palabras peligrosas (versión simplificada para el frontend)
const PALABRAS_PELIGROSAS = [
  'ignora las instrucciones',
  'forget all previous',
  'act as if',
  'pretend to be',
  'you are now',
  'elimina mi historial',
  'delete my history',
  'act as',
  'you are',
  'jailbreak',
  'bypass',
  'override'
]

// Palabras que deben estar presentes para que sea sobre viajes
const PALABRAS_VIAJES = [
  'viaje', 'travel', 'trip', 'vacation', 'vacaciones',
  'destino', 'destination', 'lugar', 'place', 'ciudad', 'city',
  'hotel', 'alojamiento', 'vuelo', 'flight',
  'itinerario', 'itinerary', 'plan', 'planificar',
  'recomendación', 'recommendation', 'presupuesto', 'budget',
  'restaurante', 'restaurant', 'comida', 'food',
  'atracción', 'attraction', 'turismo', 'tourism',
  'visitar', 'visit', 'conocer', 'explorar'
]

/**
 * Normaliza el texto para comparación
 */
function normalizarTexto(texto) {
  if (!texto) return ''
  return texto.toLowerCase().trim()
}

/**
 * Verifica si el prompt contiene palabras peligrosas
 */
export function contienePalabrasPeligrosas(texto) {
  const textoNormalizado = normalizarTexto(texto)
  
  for (const palabra of PALABRAS_PELIGROSAS) {
    if (textoNormalizado.includes(palabra.toLowerCase())) {
      return true
    }
  }
  
  return false
}

/**
 * Verifica si el prompt es sobre viajes
 */
export function esSobreViajes(texto) {
  if (!texto || texto.trim().length < 10) {
    return false
  }
  
  const textoNormalizado = normalizarTexto(texto)
  
  // Contar palabras relacionadas con viajes
  let coincidencias = 0
  for (const palabra of PALABRAS_VIAJES) {
    if (textoNormalizado.includes(palabra.toLowerCase())) {
      coincidencias++
    }
  }
  
  // Si hay al menos 1 palabra relacionada con viajes, probablemente es sobre viajes
  return coincidencias >= 1
}

/**
 * Valida un prompt antes de enviarlo
 * @param {string} pregunta - Pregunta a validar
 * @returns {object} - { valido: boolean, error?: string }
 */
export function validarPromptFrontend(pregunta) {
  if (!pregunta || pregunta.trim().length < 5) {
    return {
      valido: false,
      error: 'La pregunta es muy corta. Por favor, proporciona más detalles sobre tu viaje.'
    }
  }

  // Verificar que sea sobre viajes
  if (!esSobreViajes(pregunta)) {
    return {
      valido: false,
      error: 'Por favor, haz una pregunta relacionada con viajes y planificación de viajes. Puedo ayudarte con destinos, hoteles, vuelos, restaurantes, atracciones turísticas y más.'
    }
  }

  // Verificar palabras peligrosas
  if (contienePalabrasPeligrosas(pregunta)) {
    return {
      valido: false,
      error: 'Lo siento, tu pregunta contiene instrucciones que no puedo procesar. Por favor, haz una pregunta relacionada con planificación de viajes, destinos o recomendaciones turísticas.'
    }
  }

  // Verificar longitud máxima
  if (pregunta.length > 2000) {
    return {
      valido: false,
      error: 'La pregunta es demasiado larga. Por favor, sé más conciso (máximo 2000 caracteres).'
    }
  }

  return { valido: true }
}

