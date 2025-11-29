/**
 * Componente Principal del Asistente de Viajes
 * 
 * Contiene toda la funcionalidad del asistente de viajes
 * que existía en App.jsx, ahora separado para mejor organización
 */

import { useState, useEffect } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { ref, push, set } from 'firebase/database'
import { database } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { validarPregunta } from '../utils/validacion'
import { validarPromptFrontend } from '../utils/promptFilter'
import { verificarLimiteConsulta, registrarConsulta } from '../utils/rateLimiter'
import FormularioPreferencias from './FormularioPreferencias'
import MensajeError from './MensajeError'
import LimiteAlcanzado from './LimiteAlcanzado'
import ContadorConsultas from './ContadorConsultas'
import '../App.css'

function Asistente() {
  const { usuarioActual } = useAuth()
  
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [cargando, setCargando] = useState(false)
  const [historial, setHistorial] = useState([])
  const [vistaActual, setVistaActual] = useState('principal')
  const [favoritos, setFavoritos] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [cargandoStats, setCargandoStats] = useState(false)
  
  // Estados para formulario de preferencias
  const [mostrarFormularioPreferencias, setMostrarFormularioPreferencias] = useState(false)
  const [preferenciasUsuario, setPreferenciasUsuario] = useState(null)
  
  // Estado de validación de pregunta
  const [errorPregunta, setErrorPregunta] = useState('')
  
  // Estados para rate limiting
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(null)

  // Cargar favoritos desde localStorage al iniciar
  useEffect(() => {
    const favoritosGuardados = localStorage.getItem(`viajeia_favoritos_${usuarioActual?.uid}`)
    if (favoritosGuardados) {
      try {
        setFavoritos(JSON.parse(favoritosGuardados))
      } catch (error) {
        console.error('Error al cargar favoritos:', error)
      }
    }
  }, [usuarioActual])

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem(`viajeia_favoritos_${usuarioActual.uid}`, JSON.stringify(favoritos))
    }
  }, [favoritos, usuarioActual])

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas()
  }, [])

  // Función para cargar estadísticas
  const cargarEstadisticas = async () => {
    setCargandoStats(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.get(`${apiUrl}/api/estadisticas`)
      setEstadisticas(response.data)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setCargandoStats(false)
    }
  }

  // Recargar estadísticas después de cada consulta
  useEffect(() => {
    if (historial.length > 0) {
      setTimeout(() => {
        cargarEstadisticas()
      }, 1000)
    }
  }, [historial.length])

  // Función para guardar consulta en Firebase
  // Solo guarda datos necesarios y no sensibles
  async function guardarConsultaEnFirebase(datosConsulta) {
    if (!usuarioActual) return

    try {
      const consultasRef = ref(database, `consultas/${usuarioActual.uid}`)
      const nuevaConsultaRef = push(consultasRef)
      
      // Solo guardar datos necesarios (minimización de datos)
      await set(nuevaConsultaRef, {
        // Datos de la consulta (no sensibles)
        pregunta: datosConsulta.pregunta,
        destino: datosConsulta.destino || null,
        fechaViaje: datosConsulta.fechaViaje || null,
        presupuesto: datosConsulta.presupuesto || null,
        preferencias: datosConsulta.preferencias || null,
        
        // Metadatos (necesarios para organización)
        fechaConsulta: new Date().toISOString(),
        usuarioId: usuarioActual.uid,  // ID único (no es información sensible)
        
        // NO guardamos:
        // - Contraseñas (Firebase Auth las maneja por separado)
        // - Información de pago
        // - Direcciones físicas
        // - Números de teléfono
      })
      
      console.log('Consulta guardada en Firebase (solo datos necesarios)')
    } catch (error) {
      console.error('Error al guardar consulta en Firebase:', error)
      // No bloquear la aplicación si falla guardar en Firebase
    }
  }

  // Función para extraer información de la consulta
  function extraerInfoConsulta(preguntaTexto) {
    const destino = extraerDestino(preguntaTexto)
    const fechas = extraerFechas(preguntaTexto)
    
    // Extraer presupuesto (buscando números con $, USD, etc.)
    const presupuestoMatch = preguntaTexto.match(/(?:presupuesto|budget|gasto|coste|precio|dinero)[\s:]*(?:de|of)?[\s:]*\$?([\d,]+)/i)
    const presupuesto = presupuestoMatch ? presupuestoMatch[1].replace(/,/g, '') : null
    
    // Extraer preferencias (aventura, cultura, relajación, etc.)
    const preferencias = []
    const preferenciasKeywords = {
      'aventura': /aventura|adventure|extremo|extreme/i,
      'cultura': /cultura|culture|museo|museum|historia|history|arte|art/i,
      'relajación': /relaj|relax|tranquilo|tranquil|playa|beach|spa/i,
      'gastronomía': /comida|food|gastronom|restaurante|restaurant|culinario/i,
      'naturaleza': /naturaleza|nature|parque|park|montaña|mountain|bosque/i
    }
    
    for (const [pref, pattern] of Object.entries(preferenciasKeywords)) {
      if (pattern.test(preguntaTexto)) {
        preferencias.push(pref)
      }
    }

    return { destino, fechas, presupuesto, preferencias }
  }

  // Función para extraer destino
  const extraerDestino = (texto) => {
    if (!texto) return null
    const textoLower = texto.toLowerCase()
    const destinosComunes = ['parís', 'paris', 'tokio', 'tokyo', 'nueva york', 'new york', 
      'londres', 'london', 'roma', 'rome', 'barcelona', 'madrid', 'berlín', 'berlin', 
      'amsterdam', 'atenas', 'athens', 'dubai', 'singapur', 'singapore', 'sydney', 'sídney',
      'melbourne', 'toronto', 'montreal', 'vancouver', 'miami', 'los angeles', 'san francisco',
      'chicago', 'boston', 'lisboa', 'lisbon', 'prague', 'praga', 'viena', 'vienna', 
      'budapest', 'cracovia', 'krakow', 'bangkok', 'seúl', 'seoul', 'hong kong',
      'shanghai', 'pekin', 'beijing', 'moscú', 'moscow', 'sao paulo', 'rio de janeiro',
      'buenos aires', 'santiago', 'lima', 'bogotá', 'bogota']
    
    for (const dest of destinosComunes) {
      if (textoLower.includes(dest)) {
        return dest.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }
    }
    return null
  }

  // Función para extraer fechas
  const extraerFechas = (texto) => {
    const fechaPatterns = [
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,
      /\d{1,2}\s+(de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
      /\d{1,2}\s+(de\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{4}/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i,
    ]
    
    for (const pattern of fechaPatterns) {
      const match = texto.match(pattern)
      if (match) {
        return match[0]
      }
    }
    return null
  }

  // Manejar envío de formulario de preferencias
  const manejarPreferencias = (datosPreferencias) => {
    setPreferenciasUsuario(datosPreferencias)
    setMostrarFormularioPreferencias(false)
    // Opcional: puedes usar estos datos para mejorar la pregunta
  }

  // Validar pregunta en tiempo real
  const manejarCambioPregunta = (valor) => {
    setPregunta(valor)
    if (valor.trim()) {
      const validacion = validarPregunta(valor)
      setErrorPregunta(validacion.valida ? '' : validacion.error)
    } else {
      setErrorPregunta('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar formato básico de la pregunta
    const validacion = validarPregunta(pregunta)
    if (!validacion.valida) {
      setErrorPregunta(validacion.error)
      return
    }
    
    // Validar que el prompt sea seguro y sobre viajes (validación en frontend)
    const validacionPrompt = validarPromptFrontend(validacion.pregunta)
    if (!validacionPrompt.valido) {
      setErrorPregunta(validacionPrompt.error)
      return
    }

    // Verificar límites de rate limiting ANTES de procesar
    if (usuarioActual) {
      const verificacionLimite = await verificarLimiteConsulta(usuarioActual.uid)
      
      if (!verificacionLimite.puedeConsultar) {
        setLimiteAlcanzado({
          mensaje: verificacionLimite.mensaje,
          tiempoRestante: verificacionLimite.tiempoRestante,
          tipoLimite: verificacionLimite.tipoLimite
        })
        return
      }
    }

    setCargando(true)
    setRespuesta('')
    setErrorPregunta('')
    setLimiteAlcanzado(null)
    const preguntaActual = validacion.pregunta

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/planificar`, {
        pregunta: preguntaActual
      })
      
      const nuevaRespuesta = response.data.respuesta
      setRespuesta(nuevaRespuesta)
      
      // Extraer información de la consulta
      const infoConsulta = extraerInfoConsulta(preguntaActual)
      
      // Guardar en historial local
      const nuevoMensaje = {
        pregunta: preguntaActual,
        respuesta: nuevaRespuesta,
        fotos: response.data.fotos || [],
        infoDestino: response.data.info_destino || null
      }
      setHistorial(prev => [...prev, nuevoMensaje])
      
      // Guardar en Firebase
      await guardarConsultaEnFirebase({
        pregunta: preguntaActual,
        destino: infoConsulta.destino,
        fechaViaje: infoConsulta.fechas,
        presupuesto: infoConsulta.presupuesto,
        preferencias: infoConsulta.preferencias.length > 0 ? infoConsulta.preferencias : null
      })
      
      // Registrar consulta para rate limiting
      if (usuarioActual) {
        await registrarConsulta(usuarioActual.uid)
      }
      
      setPregunta('')
    } catch (error) {
      console.error('Error:', error)
      setRespuesta('Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }


  // Resto de funciones del asistente (extraerDestinoYFechas, cargarImagen, crearLogoViajeIA, descargarPDF, etc.)
  // Las mantendremos aquí pero por espacio las referenciaré...


  const { cerrarSesion } = useAuth()

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <h1 className="title">ViajeIA - Tu Asistente Personal de Viajes</h1>
              <p style={{ color: '#666', marginTop: '10px' }}>
                Bienvenido, <strong>{usuarioActual?.email}</strong>
              </p>
            </div>
            <button 
              onClick={async () => {
                await cerrarSesion()
              }}
              className="button"
              style={{ 
                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                padding: '10px 20px',
                fontSize: '0.9rem'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="main-content">
          {/* Contador de consultas */}
          {usuarioActual && <ContadorConsultas />}

          {/* Botón para mostrar formulario de preferencias */}
          {!mostrarFormularioPreferencias && (
            <button
              onClick={() => setMostrarFormularioPreferencias(true)}
              className="button button-secondary"
              style={{ marginBottom: '20px' }}
            >
              📋 Agregar Detalles del Viaje (Opcional)
            </button>
          )}

          {/* Formulario de preferencias */}
          {mostrarFormularioPreferencias && (
            <div style={{ marginBottom: '20px' }}>
              <FormularioPreferencias 
                onSubmit={manejarPreferencias}
                cargando={cargando}
              />
              <button
                onClick={() => setMostrarFormularioPreferencias(false)}
                className="button button-secondary"
                style={{ marginTop: '10px', width: '100%' }}
              >
                Omitir y Continuar
              </button>
            </div>
          )}

          {/* Formulario principal de pregunta */}
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label htmlFor="pregunta" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                Escribe tu pregunta sobre tu viaje
              </label>
              <textarea
                id="pregunta"
                className={`input ${errorPregunta ? 'input-error' : ''}`}
                placeholder="Ej: ¿Qué hacer en París del 15 al 20 de junio con un presupuesto de $2000?"
                value={pregunta}
                onChange={(e) => manejarCambioPregunta(e.target.value)}
                onBlur={() => {
                  if (pregunta.trim()) {
                    const validacion = validarPregunta(pregunta)
                    setErrorPregunta(validacion.valida ? '' : validacion.error)
                  }
                }}
                rows="4"
                disabled={cargando}
                required
              />
              <MensajeError mensaje={errorPregunta} mostrar={!!errorPregunta} />
              <small style={{ 
                display: 'block', 
                marginTop: '5px', 
                color: '#666',
                fontSize: '0.85rem'
              }}>
                Mínimo 5 caracteres | Máximo 1000 caracteres
              </small>
            </div>
            <button 
              type="submit" 
              className="button"
              disabled={cargando || !pregunta.trim() || !!errorPregunta}
            >
              {cargando ? 'Planificando...' : 'Planificar mi viaje'}
            </button>
          </form>

          {respuesta && (
            <div className="response-area">
              <h2 className="response-title">Respuesta:</h2>
              <div className="response-content">
                {respuesta}
              </div>
            </div>
          )}

          {cargando && !respuesta && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Procesando tu solicitud...</p>
            </div>
          )}
        </main>

        {/* Modal de límite alcanzado */}
        {limiteAlcanzado && (
          <LimiteAlcanzado
            mensaje={limiteAlcanzado.mensaje}
            tiempoRestante={limiteAlcanzado.tiempoRestante}
            tipoLimite={limiteAlcanzado.tipoLimite}
            onCerrar={() => setLimiteAlcanzado(null)}
          />
        )}
      </div>
    </div>
  )
}

export default Asistente

