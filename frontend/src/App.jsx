import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pregunta.trim()) return

    setCargando(true)
    setRespuesta('')

    try {
      const response = await axios.post('http://localhost:8000/api/planificar', {
        pregunta: pregunta
      })
      setRespuesta(response.data.respuesta)
    } catch (error) {
      console.error('Error:', error)
      setRespuesta('Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">ViajeIA - Tu Asistente Personal de Viajes</h1>
        </header>

        <main className="main-content">
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <textarea
                className="input"
                placeholder="Escribe tu pregunta sobre tu viaje..."
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
      </div>
    </div>
  )
}

export default App



