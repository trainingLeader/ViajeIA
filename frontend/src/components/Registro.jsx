/**
 * Componente de Registro
 * 
 * Permite a los usuarios crear una nueva cuenta en ViajeIA
 */

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ref, set } from 'firebase/database'
import { database } from '../firebase/config'
import { validarNombre, validarEmail, validarContraseña } from '../utils/validacion'
import MensajeError from './MensajeError'
import PoliticaPrivacidad from './PoliticaPrivacidad'
import './Auth.css'

function Registro({ cambiarVista }) {
  const { registrar } = useAuth()
  
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  
  // Estados de validación en tiempo real
  const [erroresValidacion, setErroresValidacion] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: ''
  })
  
  // Estado para política de privacidad
  const [mostrarPolitica, setMostrarPolitica] = useState(false)
  const [aceptoPolitica, setAceptoPolitica] = useState(false)

  // Función para manejar el envío del formulario
  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    setExito('')

    // Verificar consentimiento de política de privacidad
    if (!aceptoPolitica) {
      setError('Debes aceptar la Política de Privacidad para continuar')
      setMostrarPolitica(true)
      return
    }

    // Validación mejorada del nombre
    const validacionNombre = validarNombre(nombre)
    if (!validacionNombre.valido) {
      setError(validacionNombre.error)
      return
    }

    // Validación mejorada del email
    const validacionEmail = validarEmail(email)
    if (!validacionEmail.valido) {
      setError(validacionEmail.error)
      return
    }

    // Validación mejorada de la contraseña
    const validacionPassword = validarContraseña(password)
    if (!validacionPassword.valida) {
      setError(validacionPassword.errores.join('. '))
      return
    }

    // Verificar que las contraseñas coincidan
    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setCargando(true)

    try {
      // Registrar usuario en Firebase Auth
      const resultado = await registrar(nombre, email, password)

      if (resultado.exito) {
        // Guardar información adicional del usuario en Realtime Database
        // Usar los valores validados y sanitizados
        const usuarioRef = ref(database, `usuarios/${resultado.usuario.uid}`)
        await set(usuarioRef, {
          nombre: validacionNombre.nombre,
          email: validacionEmail.email,
          fechaRegistro: new Date().toISOString()
        })

        setExito(resultado.mensaje)
        
        // Limpiar formulario
        setNombre('')
        setEmail('')
        setPassword('')
        setConfirmarPassword('')

        // Opcional: Cambiar a vista de login después de 2 segundos
        setTimeout(() => {
          cambiarVista('login')
        }, 2000)
      } else {
        setError(resultado.mensaje)
      }
    } catch (error) {
      setError('Error inesperado: ' + error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">📝 Crear Cuenta en ViajeIA</h2>
        <p className="auth-subtitle">Regístrate para comenzar a planificar tus viajes</p>

        {error && (
          <div className="auth-alert auth-alert-error">
            ❌ {error}
          </div>
        )}

        {exito && (
          <div className="auth-alert auth-alert-success">
            ✅ {exito}
          </div>
        )}

        <form onSubmit={manejarSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                if (e.target.value.trim()) {
                  const validacion = validarNombre(e.target.value)
                  setErroresValidacion(prev => ({ 
                    ...prev, 
                    nombre: validacion.valido ? '' : validacion.error 
                  }))
                } else {
                  setErroresValidacion(prev => ({ ...prev, nombre: '' }))
                }
              }}
              onBlur={() => {
                if (nombre.trim()) {
                  const validacion = validarNombre(nombre)
                  setErroresValidacion(prev => ({ 
                    ...prev, 
                    nombre: validacion.valido ? '' : validacion.error 
                  }))
                }
              }}
              placeholder="Ej: Juan Pérez"
              disabled={cargando}
              required
              className={erroresValidacion.nombre ? 'input-error' : ''}
            />
            <MensajeError mensaje={erroresValidacion.nombre} mostrar={!!erroresValidacion.nombre} />
          </div>

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
                if (e.target.value) {
                  const validacion = validarContraseña(e.target.value)
                  setErroresValidacion(prev => ({ 
                    ...prev, 
                    password: validacion.valida ? '' : validacion.errores.join('. ') 
                  }))
                } else {
                  setErroresValidacion(prev => ({ ...prev, password: '' }))
                }
              }}
              onBlur={() => {
                if (password) {
                  const validacion = validarContraseña(password)
                  setErroresValidacion(prev => ({ 
                    ...prev, 
                    password: validacion.valida ? '' : validacion.errores.join('. ') 
                  }))
                }
              }}
              placeholder="Mínimo 8 caracteres con mayúsculas, números y símbolos"
              disabled={cargando}
              required
              className={erroresValidacion.password ? 'input-error' : ''}
            />
            <MensajeError mensaje={erroresValidacion.password} mostrar={!!erroresValidacion.password} />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmarPassword"
              value={confirmarPassword}
              onChange={(e) => {
                setConfirmarPassword(e.target.value)
                if (e.target.value && password) {
                  const error = e.target.value !== password ? 'Las contraseñas no coinciden' : ''
                  setErroresValidacion(prev => ({ ...prev, confirmarPassword: error }))
                } else {
                  setErroresValidacion(prev => ({ ...prev, confirmarPassword: '' }))
                }
              }}
              onBlur={() => {
                if (confirmarPassword && password) {
                  const error = confirmarPassword !== password ? 'Las contraseñas no coinciden' : ''
                  setErroresValidacion(prev => ({ ...prev, confirmarPassword: error }))
                }
              }}
              placeholder="Repite tu contraseña"
              disabled={cargando}
              required
              className={erroresValidacion.confirmarPassword ? 'input-error' : ''}
            />
            <MensajeError mensaje={erroresValidacion.confirmarPassword} mostrar={!!erroresValidacion.confirmarPassword} />
          </div>

          {/* Checkbox de consentimiento */}
          <div className="form-group">
            <label className="consentimiento-label">
              <input
                type="checkbox"
                checked={aceptoPolitica}
                onChange={(e) => setAceptoPolitica(e.target.checked)}
                disabled={cargando}
                className="consentimiento-checkbox"
              />
              <span>
                Acepto la{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setMostrarPolitica(true)
                  }}
                  className="consentimiento-link"
                >
                  Política de Privacidad
                </button>
                {' '}y consiento el procesamiento de mis datos personales
              </span>
            </label>
            {!aceptoPolitica && (
              <MensajeError 
                mensaje="Debes aceptar la Política de Privacidad para crear una cuenta" 
                mostrar={true} 
              />
            )}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={cargando || !aceptoPolitica}
          >
            {cargando ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Modal de Política de Privacidad */}
        <PoliticaPrivacidad
          mostrar={mostrarPolitica}
          onAceptar={() => {
            setAceptoPolitica(true)
            setMostrarPolitica(false)
          }}
          onRechazar={() => {
            setAceptoPolitica(false)
            setMostrarPolitica(false)
          }}
        />

        <div className="auth-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <button 
              onClick={() => cambiarVista('login')}
              className="auth-link"
              disabled={cargando}
            >
              Inicia Sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Registro

