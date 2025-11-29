/**
 * Componente para mostrar cuando se alcanza el límite de consultas
 */

import { useState, useEffect } from 'react'
import './LimiteAlcanzado.css'

function LimiteAlcanzado({ mensaje, tiempoRestante, tipoLimite, onCerrar }) {
  const [tiempoRestanteFormateado, setTiempoRestanteFormateado] = useState('')

  useEffect(() => {
    if (!tiempoRestante) return

    const actualizarTiempo = () => {
      const segundos = tiempoRestante
      
      if (tipoLimite === 'minuto') {
        // Mostrar en segundos
        setTiempoRestanteFormateado(`${segundos} segundo${segundos !== 1 ? 's' : ''}`)
      } else {
        // Mostrar en horas y minutos
        const horas = Math.floor(segundos / 3600)
        const minutos = Math.floor((segundos % 3600) / 60)
        
        if (horas > 0) {
          setTiempoRestanteFormateado(`${horas} hora${horas !== 1 ? 's' : ''} y ${minutos} minuto${minutos !== 1 ? 's' : ''}`)
        } else {
          setTiempoRestanteFormateado(`${minutos} minuto${minutos !== 1 ? 's' : ''}`)
        }
      }
    }

    actualizarTiempo()
    
    // Actualizar cada segundo si es límite por minuto
    let intervalo = null
    if (tipoLimite === 'minuto' && tiempoRestante > 0) {
      intervalo = setInterval(() => {
        const nuevoTiempo = tiempoRestante - Math.floor((Date.now() / 1000) % 60)
        if (nuevoTiempo > 0) {
          setTiempoRestanteFormateado(`${nuevoTiempo} segundo${nuevoTiempo !== 1 ? 's' : ''}`)
        } else {
          if (intervalo) clearInterval(intervalo)
          if (onCerrar) onCerrar()
        }
      }, 1000)
    }

    return () => {
      if (intervalo) clearInterval(intervalo)
    }
  }, [tiempoRestante, tipoLimite, onCerrar])

  return (
    <div className="limite-alcanzado">
      <div className="limite-alcanzado-contenido">
        <div className="limite-alcanzado-icono">⏱️</div>
        <h3 className="limite-alcanzado-titulo">Límite de Consultas Alcanzado</h3>
        <p className="limite-alcanzado-mensaje">{mensaje}</p>
        {tiempoRestanteFormateado && (
          <div className="limite-alcanzado-tiempo">
            <strong>Tiempo restante: {tiempoRestanteFormateado}</strong>
          </div>
        )}
        <div className="limite-alcanzado-info">
          <p>💡 <strong>¿Por qué hay límites?</strong></p>
          <p>Los límites ayudan a:</p>
          <ul>
            <li>Prevenir abuso del sistema</li>
            <li>Mantener el servicio disponible para todos</li>
            <li>Controlar los costos de operación</li>
          </ul>
        </div>
        {onCerrar && (
          <button 
            onClick={onCerrar}
            className="limite-alcanzado-boton"
          >
            Entendido
          </button>
        )}
      </div>
    </div>
  )
}

export default LimiteAlcanzado

