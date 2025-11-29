/**
 * Sistema de Rate Limiting usando Firebase
 * 
 * Limita el número de consultas que un usuario puede hacer
 * por minuto y por día para prevenir abuso
 */

import { ref, get, set, push } from 'firebase/database'
import { database } from '../firebase/config'

// Configuración de límites
const LIMITES = {
  POR_MINUTO: 5,      // Máximo 5 consultas por minuto
  POR_DIA: 50         // Máximo 50 consultas por día
}

/**
 * Obtiene el timestamp actual en segundos
 */
function obtenerTimestamp() {
  return Math.floor(Date.now() / 1000)
}

/**
 * Obtiene el inicio del día actual en segundos
 */
function obtenerInicioDia() {
  const ahora = new Date()
  ahora.setHours(0, 0, 0, 0)
  return Math.floor(ahora.getTime() / 1000)
}

/**
 * Verifica si el usuario puede hacer una consulta
 * @param {string} userId - ID del usuario
 * @returns {Promise<object>} - { puedeConsultar: boolean, mensaje?: string, tiempoRestante?: number }
 */
export async function verificarLimiteConsulta(userId) {
  if (!userId) {
    return { puedeConsultar: false, mensaje: 'Usuario no autenticado' }
  }

  try {
    const ahora = obtenerTimestamp()
    const inicioDia = obtenerInicioDia()
    
    // Referencias en Firebase
    const consultasRef = ref(database, `rateLimiting/${userId}/consultas`)
    const estadisticasRef = ref(database, `rateLimiting/${userId}/estadisticas`)
    
    // Obtener todas las consultas del usuario
    const snapshot = await get(consultasRef)
    const consultas = snapshot.exists() ? snapshot.val() : {}
    
    // Convertir a array y filtrar
    const consultasArray = Object.values(consultas)
    
    // Filtrar consultas del último minuto
    const consultasUltimoMinuto = consultasArray.filter(
      consulta => consulta.timestamp >= ahora - 60
    )
    
    // Filtrar consultas del día actual
    const consultasHoy = consultasArray.filter(
      consulta => consulta.timestamp >= inicioDia
    )
    
    // Verificar límite por minuto
    if (consultasUltimoMinuto.length >= LIMITES.POR_MINUTO) {
      const consultaMasAntigua = Math.min(...consultasUltimoMinuto.map(c => c.timestamp))
      const tiempoRestante = 60 - (ahora - consultaMasAntigua)
      
      return {
        puedeConsultar: false,
        mensaje: `Has alcanzado el límite de ${LIMITES.POR_MINUTO} consultas por minuto. Espera ${tiempoRestante} segundos.`,
        tiempoRestante: tiempoRestante,
        tipoLimite: 'minuto'
      }
    }
    
    // Verificar límite por día
    if (consultasHoy.length >= LIMITES.POR_DIA) {
      const proximoDia = inicioDia + 86400 // 24 horas en segundos
      const tiempoRestante = proximoDia - ahora
      const horasRestantes = Math.ceil(tiempoRestante / 3600)
      
      return {
        puedeConsultar: false,
        mensaje: `Has alcanzado el límite de ${LIMITES.POR_DIA} consultas por día. Podrás hacer más consultas en ${horasRestantes} hora(s).`,
        tiempoRestante: tiempoRestante,
        tipoLimite: 'dia'
      }
    }
    
    // Si pasa todas las validaciones, puede consultar
    return {
      puedeConsultar: true,
      consultasRestantesMinuto: LIMITES.POR_MINUTO - consultasUltimoMinuto.length,
      consultasRestantesDia: LIMITES.POR_DIA - consultasHoy.length
    }
    
  } catch (error) {
    console.error('Error al verificar límite:', error)
    // En caso de error, permitir la consulta (no bloquear al usuario)
    return { puedeConsultar: true, error: true }
  }
}

/**
 * Registra una nueva consulta en Firebase
 * @param {string} userId - ID del usuario
 */
export async function registrarConsulta(userId) {
  if (!userId) return

  try {
    const ahora = obtenerTimestamp()
    const inicioDia = obtenerInicioDia()
    
    // Referencias en Firebase
    const consultasRef = ref(database, `rateLimiting/${userId}/consultas`)
    const estadisticasRef = ref(database, `rateLimiting/${userId}/estadisticas`)
    
    // Agregar nueva consulta
    const nuevaConsultaRef = push(consultasRef)
    await set(nuevaConsultaRef, {
      timestamp: ahora,
      fecha: new Date().toISOString()
    })
    
    // Actualizar estadísticas del día
    const statsSnapshot = await get(estadisticasRef)
    const stats = statsSnapshot.exists() ? statsSnapshot.val() : {}
    
    const fechaHoy = new Date(inicioDia * 1000).toISOString().split('T')[0]
    
    if (!stats[fechaHoy]) {
      stats[fechaHoy] = 0
    }
    stats[fechaHoy] += 1
    
    await set(estadisticasRef, stats)
    
    // Limpiar consultas antiguas (más de 1 día)
    const snapshot = await get(consultasRef)
    if (snapshot.exists()) {
      const consultas = snapshot.val()
      const consultasLimpias = {}
      
      for (const [key, consulta] of Object.entries(consultas)) {
        if (consulta.timestamp >= inicioDia - 86400) { // Mantener últimas 24 horas
          consultasLimpias[key] = consulta
        }
      }
      
      await set(consultasRef, consultasLimpias)
    }
    
  } catch (error) {
    console.error('Error al registrar consulta:', error)
    // No bloquear la aplicación si falla
  }
}

/**
 * Obtiene estadísticas de uso del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<object>} - Estadísticas de uso
 */
export async function obtenerEstadisticasUso(userId) {
  if (!userId) {
    return { consultasHoy: 0, consultasUltimoMinuto: 0 }
  }

  try {
    const ahora = obtenerTimestamp()
    const inicioDia = obtenerInicioDia()
    
    const consultasRef = ref(database, `rateLimiting/${userId}/consultas`)
    const snapshot = await get(consultasRef)
    
    if (!snapshot.exists()) {
      return { consultasHoy: 0, consultasUltimoMinuto: 0 }
    }
    
    const consultas = snapshot.val()
    const consultasArray = Object.values(consultas)
    
    const consultasUltimoMinuto = consultasArray.filter(
      consulta => consulta.timestamp >= ahora - 60
    ).length
    
    const consultasHoy = consultasArray.filter(
      consulta => consulta.timestamp >= inicioDia
    ).length
    
    return {
      consultasHoy,
      consultasUltimoMinuto,
      consultasRestantesDia: LIMITES.POR_DIA - consultasHoy,
      consultasRestantesMinuto: LIMITES.POR_MINUTO - consultasUltimoMinuto
    }
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return { consultasHoy: 0, consultasUltimoMinuto: 0 }
  }
}

/**
 * Configuración de límites (exportada para poder cambiarla si es necesario)
 */
export const CONFIG_LIMITES = LIMITES

