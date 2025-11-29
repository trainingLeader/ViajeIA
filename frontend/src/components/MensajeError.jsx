/**
 * Componente de Mensaje de Error
 * 
 * Muestra mensajes de error de validación de forma clara y visible
 */

import './MensajeError.css'

function MensajeError({ mensaje, mostrar = false }) {
  if (!mostrar || !mensaje) {
    return null
  }

  return (
    <div className="mensaje-error" role="alert">
      <span className="mensaje-error-icon">⚠️</span>
      <span className="mensaje-error-texto">{mensaje}</span>
    </div>
  )
}

export default MensajeError

