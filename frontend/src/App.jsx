import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  // Estado del formulario inicial
  const [formularioCompletado, setFormularioCompletado] = useState(false)
  const [datosFormulario, setDatosFormulario] = useState({
    destino: '',
    fecha: '',
    presupuesto: '',
    preferencia: ''
  })

  // Estado para las preguntas libres
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [cargando, setCargando] = useState(false)

  // Manejar el envío del formulario inicial
  const handleFormularioSubmit = (e) => {
    e.preventDefault()
    if (datosFormulario.destino && datosFormulario.fecha && datosFormulario.presupuesto && datosFormulario.preferencia) {
      setFormularioCompletado(true)
    }
  }

  // Manejar cambios en los campos del formulario
  const handleFormularioChange = (campo, valor) => {
    setDatosFormulario(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  // Manejar el envío de preguntas libres
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pregunta.trim()) return

    setCargando(true)
    setRespuesta('')

    try {
      const response = await axios.post('http://localhost:8000/api/planificar', {
        pregunta: pregunta,
        contexto: datosFormulario
      })
      setRespuesta(response.data.respuesta)
    } catch (error) {
      console.error('Error:', error)
      setRespuesta('Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  // Función para formatear la respuesta y mejorar la visualización
  const formatResponse = (text) => {
    if (!text) return ''
    
    // Dividir el texto en líneas
    const lines = text.split('\n')
    
    return lines.map((line, index) => {
      // Detectar listas numeradas
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/)
      if (numberedMatch) {
        return (
          <div key={index} className="list-item numbered">
            <span className="list-number">{numberedMatch[1]}.</span>
            <span className="list-content">{numberedMatch[2]}</span>
          </div>
        )
      }
      
      // Detectar listas con guiones o viñetas
      const bulletMatch = line.match(/^[-•]\s+(.+)$/)
      if (bulletMatch) {
        return (
          <div key={index} className="list-item bullet">
            <span className="bullet-point">•</span>
            <span className="list-content">{bulletMatch[1]}</span>
          </div>
        )
      }
      
      // Detectar líneas con emojis al inicio (títulos o secciones)
      const emojiMatch = line.match(/^([🛫✈️🗺️🏨🌍💰🎯🍽️📅👥⏱️🛍️🌙🗼🎨🍷🎭🎪🎬🎮🏛️🎵🎸🎺🎻🎤🎧🎨🎬🎪🎭🎯🎲🎰🎨🎭🎪🎬🎮🏛️🎵🎸🎺🎻🎤🎧]+)\s+(.+)$/)
      if (emojiMatch && line.length < 100) {
        return (
          <div key={index} className="response-section-title">
            <span className="section-emoji">{emojiMatch[1]}</span>
            <span className="section-text">{emojiMatch[2]}</span>
          </div>
        )
      }
      
      // Líneas vacías
      if (line.trim() === '') {
        return <br key={index} />
      }
      
      // Texto normal
      return (
        <p key={index} className="response-paragraph">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">ViajeIA - Tu Asistente Personal de Viajes</h1>
        </header>

        <main className="main-content">
          {!formularioCompletado ? (
            // Formulario inicial de encuesta
            <form onSubmit={handleFormularioSubmit} className="survey-form">
              <div className="survey-intro">
                <p className="survey-text">¡Hola! 👋 Para personalizar tu experiencia, cuéntanos sobre tu viaje:</p>
              </div>

              <div className="survey-field">
                <label className="survey-label">
                  <span className="label-icon">🌍</span>
                  ¿A dónde quieres viajar?
                </label>
                <input
                  type="text"
                  className="survey-input"
                  placeholder="Ej: París, Tokio, Nueva York..."
                  value={datosFormulario.destino}
                  onChange={(e) => handleFormularioChange('destino', e.target.value)}
                  required
                />
              </div>

              <div className="survey-field">
                <label className="survey-label">
                  <span className="label-icon">📅</span>
                  ¿Cuándo?
                </label>
                <input
                  type="date"
                  className="survey-input"
                  value={datosFormulario.fecha}
                  onChange={(e) => handleFormularioChange('fecha', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="survey-field">
                <label className="survey-label">
                  <span className="label-icon">💰</span>
                  ¿Cuál es tu presupuesto aproximado?
                </label>
                <select
                  className="survey-input"
                  value={datosFormulario.presupuesto}
                  onChange={(e) => handleFormularioChange('presupuesto', e.target.value)}
                  required
                >
                  <option value="">Selecciona un rango</option>
                  <option value="economico">Económico (menos de $500 USD)</option>
                  <option value="medio">Medio ($500 - $1,500 USD)</option>
                  <option value="alto">Alto ($1,500 - $3,000 USD)</option>
                  <option value="premium">Premium (más de $3,000 USD)</option>
                </select>
              </div>

              <div className="survey-field">
                <label className="survey-label">
                  <span className="label-icon">🎯</span>
                  ¿Prefieres aventura, relajación o cultura?
                </label>
                <div className="survey-options">
                  <button
                    type="button"
                    className={`survey-option ${datosFormulario.preferencia === 'aventura' ? 'active' : ''}`}
                    onClick={() => handleFormularioChange('preferencia', 'aventura')}
                  >
                    🏔️ Aventura
                  </button>
                  <button
                    type="button"
                    className={`survey-option ${datosFormulario.preferencia === 'relajacion' ? 'active' : ''}`}
                    onClick={() => handleFormularioChange('preferencia', 'relajacion')}
                  >
                    🏖️ Relajación
                  </button>
                  <button
                    type="button"
                    className={`survey-option ${datosFormulario.preferencia === 'cultura' ? 'active' : ''}`}
                    onClick={() => handleFormularioChange('preferencia', 'cultura')}
                  >
                    🏛️ Cultura
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="button"
                disabled={!datosFormulario.destino || !datosFormulario.fecha || !datosFormulario.presupuesto || !datosFormulario.preferencia}
              >
                Continuar ✈️
              </button>
            </form>
          ) : (
            // Formulario de preguntas libres (después de completar la encuesta)
            <form onSubmit={handleSubmit} className="form">
              <div className="form-context">
                <div className="context-badge">
                  <span>🌍 {datosFormulario.destino}</span>
                  <span>📅 {datosFormulario.fecha ? new Date(datosFormulario.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
                  <span>💰 {datosFormulario.presupuesto === 'economico' ? 'Económico' : datosFormulario.presupuesto === 'medio' ? 'Medio' : datosFormulario.presupuesto === 'alto' ? 'Alto' : 'Premium'}</span>
                  <span>🎯 {datosFormulario.preferencia === 'aventura' ? 'Aventura' : datosFormulario.preferencia === 'relajacion' ? 'Relajación' : 'Cultura'}</span>
                </div>
              </div>
              <div className="input-group">
                <textarea
                  className="input"
                  placeholder="Ahora puedes hacer cualquier pregunta sobre tu viaje... Ejemplo: '¿Qué lugares debo visitar?' o 'Crea un itinerario para 3 días'"
                  value={pregunta}
                  onChange={(e) => setPregunta(e.target.value)}
                  rows="4"
                  disabled={cargando}
                />
              </div>
              <button 
                type="submit" 
                className="button"
                disabled={cargando || !pregunta.trim()}
              >
                {cargando ? 'Planificando...' : 'Planificar mi viaje'}
              </button>
            </form>
          )}

          {respuesta && (
            <div className="response-area">
              <div className="response-header">
                <span className="response-icon">✈️</span>
                <h2 className="response-title">ViajeIA responde:</h2>
              </div>
              <div className="response-content">
                {formatResponse(respuesta)}
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
      </div>
    </div>
  )
}

export default App



