/**
 * Componente de Formulario de Preferencias
 * 
 * Permite al usuario ingresar destino, fechas, presupuesto y preferencias
 * con validación en tiempo real
 */

import { useState } from 'react'
import { validarDestino, validarFecha, validarPresupuesto, validarPreferencias } from '../utils/validacion'
import MensajeError from './MensajeError'
import './FormularioPreferencias.css'

function FormularioPreferencias({ onSubmit, cargando }) {
  const [destino, setDestino] = useState('')
  const [fecha, setFecha] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [preferencias, setPreferencias] = useState([])

  // Estados de validación
  const [errores, setErrores] = useState({
    destino: '',
    fecha: '',
    presupuesto: '',
    preferencias: ''
  })

  // Preferencias disponibles
  const preferenciasDisponibles = [
    { id: 'aventura', label: 'Aventura', icon: '🏔️' },
    { id: 'cultura', label: 'Cultura', icon: '🏛️' },
    { id: 'relajación', label: 'Relajación', icon: '🏖️' },
    { id: 'gastronomía', label: 'Gastronomía', icon: '🍽️' },
    { id: 'naturaleza', label: 'Naturaleza', icon: '🌲' }
  ]

  // Validar destino en tiempo real
  const manejarCambioDestino = (valor) => {
    setDestino(valor)
    if (valor.trim()) {
      const validacion = validarDestino(valor)
      setErrores(prev => ({ ...prev, destino: validacion.valido ? '' : validacion.error }))
    } else {
      setErrores(prev => ({ ...prev, destino: '' }))
    }
  }

  // Validar fecha en tiempo real
  const manejarCambioFecha = (valor) => {
    setFecha(valor)
    if (valor.trim()) {
      const validacion = validarFecha(valor)
      setErrores(prev => ({ ...prev, fecha: validacion.valida ? '' : validacion.error }))
    } else {
      setErrores(prev => ({ ...prev, fecha: '' }))
    }
  }

  // Validar presupuesto en tiempo real
  const manejarCambioPresupuesto = (valor) => {
    setPresupuesto(valor)
    if (valor.trim()) {
      const validacion = validarPresupuesto(valor)
      setErrores(prev => ({ ...prev, presupuesto: validacion.valido ? '' : validacion.error }))
    } else {
      setErrores(prev => ({ ...prev, presupuesto: '' }))
    }
  }

  // Manejar selección de preferencias
  const manejarCambioPreferencias = (prefId) => {
    const nuevasPreferencias = preferencias.includes(prefId)
      ? preferencias.filter(p => p !== prefId)
      : [...preferencias, prefId]
    
    setPreferencias(nuevasPreferencias)
    
    const validacion = validarPreferencias(nuevasPreferencias)
    setErrores(prev => ({ 
      ...prev, 
      preferencias: validacion.valido ? '' : validacion.error 
    }))
  }

  // Manejar envío del formulario
  const manejarSubmit = (e) => {
    e.preventDefault()
    
    // Validar todos los campos
    const validacionDestino = validarDestino(destino)
    const validacionFecha = validarFecha(fecha)
    const validacionPresupuesto = validarPresupuesto(presupuesto)
    const validacionPreferencias = validarPreferencias(preferencias)

    // Actualizar errores
    setErrores({
      destino: validacionDestino.valido ? '' : validacionDestino.error,
      fecha: validacionFecha.valida ? '' : validacionFecha.error,
      presupuesto: validacionPresupuesto.valido ? '' : validacionPresupuesto.error,
      preferencias: validacionPreferencias.valido ? '' : validacionPreferencias.error
    })

    // Si todo es válido, enviar
    if (validacionDestino.valido && validacionFecha.valida && 
        validacionPresupuesto.valido && validacionPreferencias.valido) {
      onSubmit({
        destino: validacionDestino.destino,
        fecha: validacionFecha.fecha,
        presupuesto: validacionPresupuesto.presupuesto,
        preferencias: validacionPreferencias.preferencias
      })
    }
  }

  // Verificar si el formulario es válido
  const esFormularioValido = () => {
    return destino.trim() && fecha.trim() && presupuesto.trim() &&
           !errores.destino && !errores.fecha && !errores.presupuesto
  }

  return (
    <form onSubmit={manejarSubmit} className="formulario-preferencias">
      <h3 className="formulario-titulo">📋 Detalles de tu Viaje</h3>
      <p className="formulario-subtitulo">Completa la información para obtener recomendaciones personalizadas</p>

      {/* Campo Destino */}
      <div className="campo-formulario">
        <label htmlFor="destino" className="campo-label">
          Destino <span className="campo-requerido">*</span>
        </label>
        <input
          type="text"
          id="destino"
          className={`campo-input ${errores.destino ? 'campo-input-error' : ''}`}
          value={destino}
          onChange={(e) => manejarCambioDestino(e.target.value)}
          placeholder="Ej: París, Tokio, Nueva York"
          disabled={cargando}
          required
        />
        <MensajeError mensaje={errores.destino} mostrar={!!errores.destino} />
      </div>

      {/* Campo Fecha */}
      <div className="campo-formulario">
        <label htmlFor="fecha" className="campo-label">
          Fecha del Viaje <span className="campo-requerido">*</span>
        </label>
        <input
          type="text"
          id="fecha"
          className={`campo-input ${errores.fecha ? 'campo-input-error' : ''}`}
          value={fecha}
          onChange={(e) => manejarCambioFecha(e.target.value)}
          placeholder="Ej: 15/06/2024 o 15 de junio 2024"
          disabled={cargando}
          required
        />
        <MensajeError mensaje={errores.fecha} mostrar={!!errores.fecha} />
        <small className="campo-ayuda">Formato: DD/MM/YYYY o "15 de junio 2024"</small>
      </div>

      {/* Campo Presupuesto */}
      <div className="campo-formulario">
        <label htmlFor="presupuesto" className="campo-label">
          Presupuesto (USD) <span className="campo-requerido">*</span>
        </label>
        <div className="campo-presupuesto-wrapper">
          <span className="campo-simbolo">$</span>
          <input
            type="text"
            id="presupuesto"
            className={`campo-input campo-input-presupuesto ${errores.presupuesto ? 'campo-input-error' : ''}`}
            value={presupuesto}
            onChange={(e) => manejarCambioPresupuesto(e.target.value)}
            placeholder="Ej: 2000"
            disabled={cargando}
            required
          />
        </div>
        <MensajeError mensaje={errores.presupuesto} mostrar={!!errores.presupuesto} />
        <small className="campo-ayuda">Mínimo: $10 | Máximo: $1,000,000</small>
      </div>

      {/* Campo Preferencias */}
      <div className="campo-formulario">
        <label className="campo-label">
          Preferencias de Viaje <span className="campo-opcional">(Opcional)</span>
        </label>
        <div className="preferencias-grid">
          {preferenciasDisponibles.map(pref => (
            <label key={pref.id} className="preferencia-checkbox">
              <input
                type="checkbox"
                checked={preferencias.includes(pref.id)}
                onChange={() => manejarCambioPreferencias(pref.id)}
                disabled={cargando}
              />
              <span className="preferencia-label">
                <span className="preferencia-icon">{pref.icon}</span>
                {pref.label}
              </span>
            </label>
          ))}
        </div>
        <MensajeError mensaje={errores.preferencias} mostrar={!!errores.preferencias} />
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        className="boton-enviar"
        disabled={!esFormularioValido() || cargando}
      >
        {cargando ? 'Procesando...' : 'Buscar Recomendaciones'}
      </button>
    </form>
  )
}

export default FormularioPreferencias

