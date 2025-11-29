/**
 * Componente que muestra el contador de consultas restantes
 */

import { useState, useEffect } from 'react'
import { obtenerEstadisticasUso } from '../utils/rateLimiter'
import { useAuth } from '../context/AuthContext'
import './ContadorConsultas.css'

function ContadorConsultas() {
  const { usuarioActual } = useAuth()
  const [estadisticas, setEstadisticas] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!usuarioActual) {
      setCargando(false)
      return
    }

    const cargarEstadisticas = async () => {
      try {
        const stats = await obtenerEstadisticasUso(usuarioActual.uid)
        setEstadisticas(stats)
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setCargando(false)
      }
    }

    cargarEstadisticas()
    
    // Actualizar cada 10 segundos
    const intervalo = setInterval(cargarEstadisticas, 10000)
    
    return () => clearInterval(intervalo)
  }, [usuarioActual])

  if (!usuarioActual || cargando || !estadisticas) {
    return null
  }

  const porcentajeDia = (estadisticas.consultasHoy / 50) * 100
  const porcentajeMinuto = (estadisticas.consultasUltimoMinuto / 5) * 100

  return (
    <div className="contador-consultas">
      <div className="contador-titulo">📊 Tus Consultas</div>
      
      <div className="contador-item">
        <div className="contador-label">
          <span>Hoy</span>
          <span className="contador-numero">
            {estadisticas.consultasHoy} / 50
          </span>
        </div>
        <div className="contador-barra">
          <div 
            className={`contador-barra-llenado ${porcentajeDia > 80 ? 'contador-barra-alto' : ''}`}
            style={{ width: `${Math.min(porcentajeDia, 100)}%` }}
          ></div>
        </div>
        <div className="contador-restantes">
          {estadisticas.consultasRestantesDia} consultas restantes hoy
        </div>
      </div>

      <div className="contador-item">
        <div className="contador-label">
          <span>Último minuto</span>
          <span className="contador-numero">
            {estadisticas.consultasUltimoMinuto} / 5
          </span>
        </div>
        <div className="contador-barra">
          <div 
            className={`contador-barra-llenado ${porcentajeMinuto > 80 ? 'contador-barra-alto' : ''}`}
            style={{ width: `${Math.min(porcentajeMinuto, 100)}%` }}
          ></div>
        </div>
        <div className="contador-restantes">
          {estadisticas.consultasRestantesMinuto} consultas restantes este minuto
        </div>
      </div>
    </div>
  )
}

export default ContadorConsultas

