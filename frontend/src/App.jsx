import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  // Generar un session_id único al cargar la app
  const [sessionId] = useState(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })

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
  const [fotos, setFotos] = useState([])
  const [infoDestino, setInfoDestino] = useState(null)
  const [historial, setHistorial] = useState([])
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
    setFotos([])
    setInfoDestino(null)

    try {
      const response = await axios.post('http://localhost:8000/api/planificar', {
        pregunta: pregunta,
        contexto: datosFormulario,
        session_id: sessionId
      })
      setRespuesta(response.data.respuesta)
      if (response.data.fotos && response.data.fotos.length > 0) {
        setFotos(response.data.fotos)
      }
      if (response.data.info_destino) {
        setInfoDestino(response.data.info_destino)
      }
      // Actualizar historial si viene en la respuesta
      if (response.data.historial && response.data.historial.length > 0) {
        setHistorial(response.data.historial)
      }
    } catch (error) {
      console.error('Error:', error)
      setRespuesta('Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.')
      setFotos([])
      setInfoDestino(null)
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
      
      // Detectar secciones especiales con símbolos (», Þ, , ä, ø) seguido de nombre de sección
      // Formato: "» ALOJAMIENTO:", "Þ COMIDA LOCAL:", " LUGARES IMPERDIBLES:", etc.
      const specialSectionMatch = line.match(/^([»Þäø\s]?)\s*(ALOJAMIENTO|COMIDA LOCAL|LUGARES IMPERDIBLES|CONSEJOS LOCALES|ESTIMACIÓN DE COSTOS):\s*(.*)$/i)
      if (specialSectionMatch) {
        const symbol = specialSectionMatch[1]?.trim() || ''
        const sectionName = specialSectionMatch[2]
        const content = specialSectionMatch[3] || ''
        
        // Mapear nombres de sección a iconos
        const sectionMap = {
          'ALOJAMIENTO': '🏨',
          'COMIDA LOCAL': '🍽️',
          'LUGARES IMPERDIBLES': '🗺️',
          'CONSEJOS LOCALES': '💡',
          'ESTIMACIÓN DE COSTOS': '💰'
        }
        
        const icon = sectionMap[sectionName.toUpperCase()] || '📍'
        
        return (
          <div key={index} className="response-section-special">
            {symbol && <span className="special-symbol">{symbol}</span>}
            <span className="special-icon">{icon}</span>
            <span className="special-text">{sectionName}:</span>
            {content && <span className="special-content">{content}</span>}
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
      {infoDestino && (
        <div className="info-panel">
          <div className="info-panel-header">
            <h3 className="info-panel-title">📊 Información del Destino</h3>
          </div>
          <div className="info-panel-content">
            {infoDestino.temperatura !== null && (
              <div className="info-item">
                <div className="info-icon">🌡️</div>
                <div className="info-details">
                  <span className="info-label">Temperatura</span>
                  <span className="info-value">
                    {infoDestino.temperatura}°C
                    {infoDestino.condicion && (
                      <span className="info-subtext"> - {infoDestino.condicion}</span>
                    )}
                  </span>
                </div>
              </div>
            )}
            
            {infoDestino.diferencia_horaria && (
              <div className="info-item">
                <div className="info-icon">🕐</div>
                <div className="info-details">
                  <span className="info-label">Zona Horaria</span>
                  <span className="info-value">{infoDestino.diferencia_horaria}</span>
                </div>
              </div>
            )}
            
            {infoDestino.codigo_moneda && (
              <div className="info-item">
                <div className="info-icon">💵</div>
                <div className="info-details">
                  <span className="info-label">Moneda</span>
                  <span className="info-value">
                    {infoDestino.moneda_local || infoDestino.codigo_moneda}
                    {infoDestino.tipo_cambio_usd && (
                      <span className="info-subtext">
                        {' '}(1 {infoDestino.codigo_moneda} = ${infoDestino.tipo_cambio_usd.toFixed(4)} USD)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
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
              
              {fotos && fotos.length > 0 && (
                <div className="photos-gallery">
                  <h3 className="photos-title">📸 Fotos del destino</h3>
                  <div className="photos-grid">
                    {fotos.map((foto, index) => (
                      <div key={index} className="photo-item">
                        <img 
                          src={foto} 
                          alt={`${datosFormulario.destino || 'Destino'} - Foto ${index + 1}`}
                          className="destination-photo"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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

          {historial.length > 0 && (
            <div className="historial-section">
              <h3 className="historial-title">💬 Historial de Conversación</h3>
              <div className="historial-list">
                {historial.map((mensaje, index) => (
                  <div key={index} className="historial-item">
                    <div className="historial-pregunta">
                      <span className="historial-label">Tú:</span>
                      <span className="historial-text">{mensaje.pregunta}</span>
                    </div>
                    <div className="historial-respuesta">
                      <span className="historial-label">ViajeIA:</span>
                      <span className="historial-text">{mensaje.respuesta.substring(0, 150)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App



