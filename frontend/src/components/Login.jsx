/**
 * Componente de Login
 * 
 * Permite a los usuarios iniciar sesión en ViajeIA
 */

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { validarEmail } from '../utils/validacion'
import MensajeError from './MensajeError'
import './Auth.css'

function Login({ cambiarVista }) {
  const { iniciarSesion } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  
  // Estados de validación en tiempo real
  const [erroresValidacion, setErroresValidacion] = useState({
    email: '',
    password: ''
  })

  // Función para manejar el envío del formulario
  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')

    // Validación mejorada del email
    const validacionEmail = validarEmail(email)
    if (!validacionEmail.valido) {
      setError(validacionEmail.error)
      return
    }

    if (!password) {
      setError('La contraseña es obligatoria')
      return
    }

    setCargando(true)

    try {
      // Usar el email validado y sanitizado
      const resultado = await iniciarSesion(validacionEmail.email, password)

      if (!resultado.exito) {
        setError(resultado.mensaje)
      }
      // Si tiene éxito, el AuthContext actualizará el estado del usuario
      // y el componente principal redirigirá automáticamente
    } catch (error) {
      setError('Error inesperado: ' + error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">✈️ Iniciar Sesión en ViajeIA</h2>
        <p className="auth-subtitle">Ingresa tus credenciales para continuar</p>

        {error && (
          <div className="auth-alert auth-alert-error">
            ❌ {error}
          </div>
        )}

        <form onSubmit={manejarSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (e.target.value.trim()) {
                  const validacion = validarEmail(e.target.value)
                  setErroresValidacion(prev => ({ 
                    ...prev, 
                    email: validacion.valido ? '' : validacion.error 
                  }))
                } else {
                  setErroresValidacion(prev => ({ ...prev, email: '' }))
                }
              }}
              onBlur={() => {
                if (email.trim()) {
                  const validacion = validarEmail(email)
                  setErroresValidacion(prev => ({ 
                    ...prev, 
                    email: validacion.valido ? '' : validacion.error 
                  }))
                }
              }}
              placeholder="ejemplo@correo.com"
              disabled={cargando}
              required
              autoComplete="email"
              className={erroresValidacion.email ? 'input-error' : ''}
            />
            <MensajeError mensaje={erroresValidacion.email} mostrar={!!erroresValidacion.email} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (!e.target.value) {
                  setErroresValidacion(prev => ({ ...prev, password: 'La contraseña es obligatoria' }))
                } else {
                  setErroresValidacion(prev => ({ ...prev, password: '' }))
                }
              }}
              onBlur={() => {
                if (!password) {
                  setErroresValidacion(prev => ({ ...prev, password: 'La contraseña es obligatoria' }))
                }
              }}
              placeholder="Tu contraseña"
              disabled={cargando}
              required
              autoComplete="current-password"
              className={erroresValidacion.password ? 'input-error' : ''}
            />
            <MensajeError mensaje={erroresValidacion.password} mostrar={!!erroresValidacion.password} />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={cargando}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes una cuenta?{' '}
            <button 
              onClick={() => cambiarVista('registro')}
              className="auth-link"
              disabled={cargando}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

