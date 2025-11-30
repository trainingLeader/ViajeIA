/**
 * Componente de Alerta para Respuestas Cortadas
 * 
 * Muestra una alerta cuando la respuesta del modelo se cortó por límite de tokens
 */

import { useState, useEffect } from 'react'
import './AlertaRespuestaCortada.css'

function AlertaRespuestaCortada({ mostrar, tokensUsados, onCerrar }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (mostrar) {
      // Pequeño delay para animación suave
      setTimeout(() => setVisible(true), 100)
    } else {
      setVisible(false)
    }
  }, [mostrar])

  if (!mostrar) return null

  const manejarCerrar = () => {
    setVisible(false)
    setTimeout(() => {
      if (onCerrar) onCerrar()
    }, 300) // Esperar a que termine la animación
  }

  return (
    <div className={`alerta-respuesta-cortada ${visible ? 'visible' : ''}`}>
      <div className="alerta-contenido">
        <div className="alerta-icono">⚠️</div>
        <div className="alerta-texto">
          <h3 className="alerta-titulo">Respuesta Incompleta</h3>
          <p className="alerta-mensaje">
            La respuesta se cortó porque alcanzó el límite de tokens. 
            Puede que falte información al final de la respuesta.
          </p>
          {tokensUsados && (
            <p className="alerta-tokens">
              Tokens usados: <strong>{tokensUsados.toLocaleString()}</strong>
            </p>
          )}
          <p className="alerta-sugerencia">
            💡 <strong>Sugerencia:</strong> Intenta hacer una pregunta más específica 
            o divide tu consulta en partes más pequeñas.
          </p>
        </div>
        <button
          onClick={manejarCerrar}
          className="alerta-boton-cerrar"
          aria-label="Cerrar alerta"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default AlertaRespuestaCortada

