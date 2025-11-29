import { useState, useEffect } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import './App.css'

function App() {
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [cargando, setCargando] = useState(false)
  const [historial, setHistorial] = useState([])
  const [vistaActual, setVistaActual] = useState('principal') // 'principal' o 'favoritos'
  const [favoritos, setFavoritos] = useState([])

  // Cargar favoritos desde localStorage al iniciar
  useEffect(() => {
    const favoritosGuardados = localStorage.getItem('viajeia_favoritos')
    if (favoritosGuardados) {
      try {
        setFavoritos(JSON.parse(favoritosGuardados))
      } catch (error) {
        console.error('Error al cargar favoritos:', error)
      }
    }
  }, [])

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('viajeia_favoritos', JSON.stringify(favoritos))
  }, [favoritos])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pregunta.trim()) return

    setCargando(true)
    setRespuesta('')
    const preguntaActual = pregunta

    try {
      // Usar variable de entorno para la URL del backend, o localhost en desarrollo
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/planificar`, {
        pregunta: preguntaActual
      })
      const nuevaRespuesta = response.data.respuesta
      setRespuesta(nuevaRespuesta)
      
      // Agregar al historial
      setHistorial(prev => [...prev, {
        pregunta: preguntaActual,
        respuesta: nuevaRespuesta,
        fotos: response.data.fotos || [],
        infoDestino: response.data.info_destino || null
      }])
      
      setPregunta('')
    } catch (error) {
      console.error('Error:', error)
      setRespuesta('Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const extraerDestino = (texto) => {
    const textoLower = texto.toLowerCase()
    const destinosComunes = ['parís', 'paris', 'tokio', 'tokyo', 'nueva york', 'new york', 
      'londres', 'london', 'roma', 'rome', 'barcelona', 'madrid', 'berlín', 'berlin', 
      'amsterdam', 'atenas', 'athens', 'dubai', 'singapur', 'singapore', 'sydney', 'sídney',
      'melbourne', 'toronto', 'montreal', 'vancouver', 'miami', 'los angeles', 'san francisco',
      'chicago', 'boston', 'lisboa', 'lisbon', 'prague', 'praga', 'viena', 'vienna', 
      'budapest', 'cracovia', 'krakow', 'bangkok', 'tokio', 'seúl', 'seoul', 'hong kong',
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

  const extraerFechas = (texto) => {
    const fechaPatterns = [
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,  // DD/MM/YYYY o DD-MM-YYYY
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

  const extraerDestinoYFechas = () => {
    let destino = null
    let fechas = null
    
    // Buscar destino en el historial
    for (const mensaje of historial) {
      destino = extraerDestino(mensaje.pregunta)
      fechas = extraerFechas(mensaje.pregunta)
      
      if (destino && fechas) break
    }
    
    return { destino, fechas }
  }

  const esFavorito = (destino) => {
    if (!destino) return false
    return favoritos.some(fav => fav.destino?.toLowerCase() === destino.toLowerCase())
  }

  const guardarFavorito = (mensaje) => {
    const destino = extraerDestino(mensaje.pregunta) || extraerDestino(mensaje.respuesta) || 'Destino no especificado'
    const fechas = extraerFechas(mensaje.pregunta) || extraerFechas(mensaje.respuesta) || null
    
    // Verificar si ya existe
    if (esFavorito(destino)) {
      alert('Este destino ya está en tus favoritos')
      return
    }

    const nuevoFavorito = {
      id: Date.now(),
      destino,
      fechas,
      pregunta: mensaje.pregunta,
      respuesta: mensaje.respuesta,
      fotos: mensaje.fotos || [],
      infoDestino: mensaje.infoDestino || null,
      fechaGuardado: new Date().toISOString()
    }

    setFavoritos(prev => [...prev, nuevoFavorito])
    alert(`✨ ${destino} agregado a tus favoritos`)
  }

  const eliminarFavorito = (id) => {
    setFavoritos(prev => prev.filter(fav => fav.id !== id))
  }

  const cargarImagen = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => resolve(img)
      img.onerror = () => {
        // Si falla, intentar con un proxy o retornar null
        console.warn('No se pudo cargar la imagen:', url)
        resolve(null)
      }
      
      // Timeout de 5 segundos
      setTimeout(() => {
        if (!img.complete) {
          resolve(null)
        }
      }, 5000)
      
      img.src = url
    })
  }

  const crearLogoViajeIA = (doc) => {
    // Crear un logo simple usando formas del PDF
    const centerX = 30
    const logoY = 15
    
    // Dibujar un círculo de fondo blanco para el logo
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.5)
    doc.circle(centerX, logoY, 10, 'FD')
    
    // Dibujar icono de avión estilizado usando formas básicas
    doc.setFillColor(102, 126, 234)
    doc.setDrawColor(102, 126, 234)
    doc.setLineWidth(0.8)
    
    // Cuerpo del avión (rectángulo redondeado)
    doc.setFillColor(102, 126, 234)
    doc.roundedRect(centerX - 3, logoY - 1, 6, 2, 1, 1, 'F')
    
    // Ala superior (rectángulo inclinado simulado)
    doc.setFillColor(102, 126, 234)
    doc.roundedRect(centerX - 2.5, logoY - 3, 5, 2, 0.5, 0.5, 'F')
    
    // Ala inferior más pequeña
    doc.setFillColor(102, 126, 234)
    doc.roundedRect(centerX - 2, logoY + 1.5, 4, 1.5, 0.5, 0.5, 'F')
    
    // Cola del avión (pequeño rectángulo)
    doc.setFillColor(102, 126, 234)
    doc.roundedRect(centerX - 5, logoY - 0.5, 2, 1, 0.3, 0.3, 'F')
    
    // Ventana del avión (pequeño círculo blanco)
    doc.setFillColor(255, 255, 255)
    doc.circle(centerX + 1, logoY, 0.8, 'F')
  }

  const descargarPDF = async () => {
    if (historial.length === 0) {
      alert('No hay conversación para descargar. Por favor, realiza algunas preguntas primero.')
      return
    }

    const { destino, fechas } = extraerDestinoYFechas()
    
    // Crear PDF
    const doc = new jsPDF()
    let yPos = 20

    // Header con Logo y Título de ViajeIA
    doc.setFillColor(102, 126, 234)
    doc.rect(0, 0, 210, 45, 'F')
    
    // Crear y agregar logo
    crearLogoViajeIA(doc)
    
    // Texto del título
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('ViajeIA', 105, 25, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Tu Asistente Personal de Viajes', 105, 33, { align: 'center' })

    yPos = 55

    // Información del destino y fechas en una caja destacada
    doc.setDrawColor(102, 126, 234)
    doc.setFillColor(245, 247, 250)
    doc.setLineWidth(0.5)
    doc.roundedRect(15, yPos - 5, 180, destino || fechas ? 25 : 15, 3, 3, 'FD')
    
    doc.setTextColor(102, 126, 234)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('📋 Información del Viaje', 20, yPos + 5)
    yPos += 10

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    if (destino) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(102, 126, 234)
      doc.text('Destino:', 20, yPos + 5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      doc.text(destino, 50, yPos + 5)
      yPos += 8
    }
    if (fechas) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(102, 126, 234)
      doc.text('Fechas:', 20, yPos + 5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      doc.text(fechas, 50, yPos + 5)
      yPos += 8
    }
    if (!destino && !fechas) {
      doc.setTextColor(120, 120, 120)
      doc.text('Destino y fechas no especificados', 20, yPos + 5)
      yPos += 8
    }

    yPos += 15

    // Agregar todas las recomendaciones del historial
    for (let index = 0; index < historial.length; index++) {
      const mensaje = historial[index]
      
      // Verificar si hay espacio en la página
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }

      // Sección de consulta con fondo destacado
      doc.setFillColor(102, 126, 234)
      doc.rect(15, yPos - 7, 180, 10, 'F')
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(`Consulta ${index + 1}`, 20, yPos)
      yPos += 15

      // Agregar fotos si existen - en una sección destacada
      if (mensaje.fotos && mensaje.fotos.length > 0) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(102, 126, 234)
        doc.text('📸 Fotos del Destino', 20, yPos)
        yPos += 8
        
        let fotoX = 20
        const fotoSize = 50
        const fotosStartY = yPos
        
        // Fondo para las fotos
        doc.setFillColor(250, 250, 250)
        doc.rect(15, yPos - 3, 180, fotoSize + 6, 'F')
        doc.setDrawColor(220, 220, 220)
        doc.rect(15, yPos - 3, 180, fotoSize + 6, 'S')
        
        for (const fotoUrl of mensaje.fotos.slice(0, 3)) {
          if (fotoX + fotoSize > 190) {
            fotoX = 20
            yPos += fotoSize + 8
            if (yPos > 250) {
              doc.addPage()
              yPos = 20
              fotoX = 20
              // Redibujar fondo en nueva página
              doc.setFillColor(250, 250, 250)
              doc.rect(15, yPos - 3, 180, fotoSize + 6, 'F')
              doc.setDrawColor(220, 220, 220)
              doc.rect(15, yPos - 3, 180, fotoSize + 6, 'S')
            }
          }
          
          try {
            const img = await cargarImagen(fotoUrl)
            if (img) {
              // Agregar borde a la foto
              doc.setDrawColor(200, 200, 200)
              doc.setLineWidth(0.5)
              doc.rect(fotoX - 1, yPos - 1, fotoSize + 2, fotoSize * 0.75 + 2, 'S')
              doc.addImage(img, 'JPEG', fotoX, yPos, fotoSize, fotoSize * 0.75)
            }
            fotoX += fotoSize + 5
          } catch (error) {
            console.error('Error al cargar imagen:', error)
          }
        }
        
        yPos = fotosStartY + fotoSize + 15
      }

      // Información del destino si está disponible
      if (mensaje.infoDestino) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        
        // Caja para información del destino
        doc.setFillColor(245, 247, 250)
        doc.setDrawColor(102, 126, 234)
        doc.setLineWidth(0.5)
        const infoHeight = (mensaje.infoDestino.temperatura ? 6 : 0) + 
                          (mensaje.infoDestino.condicion ? 6 : 0) + 
                          (mensaje.infoDestino.diferencia_horaria ? 6 : 0) + 
                          (mensaje.infoDestino.moneda_local ? 6 : 0) + 15
        doc.roundedRect(15, yPos - 5, 180, infoHeight, 3, 3, 'FD')
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(102, 126, 234)
        doc.text('ℹ️ Información del Destino', 20, yPos + 3)
        yPos += 10
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(50, 50, 50)
        if (mensaje.infoDestino.temperatura) {
          doc.text(`🌡️ Temperatura: ${mensaje.infoDestino.temperatura}°C`, 25, yPos)
          yPos += 6
        }
        if (mensaje.infoDestino.condicion) {
          doc.text(`☁️ Condición: ${mensaje.infoDestino.condicion}`, 25, yPos)
          yPos += 6
        }
        if (mensaje.infoDestino.diferencia_horaria) {
          doc.text(`🕐 Zona horaria: ${mensaje.infoDestino.diferencia_horaria}`, 25, yPos)
          yPos += 6
        }
        if (mensaje.infoDestino.moneda_local) {
          doc.text(`💵 Moneda: ${mensaje.infoDestino.moneda_local}`, 25, yPos)
          yPos += 6
        }
        yPos += 8
      }

      // Pregunta del usuario
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(50, 50, 50)
      doc.text('💬 Tu Pregunta:', 20, yPos)
      yPos += 7
      
      // Caja para la pregunta
      doc.setFillColor(240, 242, 247)
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      const preguntaLines = doc.splitTextToSize(mensaje.pregunta, 165)
      const preguntaHeight = preguntaLines.length * 5 + 8
      doc.roundedRect(18, yPos - 4, 174, preguntaHeight, 2, 2, 'FD')
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text(preguntaLines, 25, yPos)
      yPos += preguntaHeight + 8

      // Respuesta/Recomendaciones
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(102, 126, 234)
      doc.text('✨ Recomendaciones:', 20, yPos)
      yPos += 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      // Procesar la respuesta y dividir por secciones
      const secciones = mensaje.respuesta.split(/\n(?=»|Þ|LUGARES|ä|ø)/)
      
      for (const seccion of secciones) {
        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }
        
        // Formatear secciones especiales con mejor diseño
        if (seccion.includes('»')) {
          doc.setFillColor(102, 126, 234)
          doc.rect(18, yPos - 5, 174, 8, 'F')
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(255, 255, 255)
          const texto = seccion.replace('»', '').trim()
          const lines = doc.splitTextToSize(texto, 170)
          doc.text(lines, 22, yPos)
          yPos += lines.length * 5 + 8
        } else if (seccion.includes('Þ')) {
          doc.setFillColor(102, 126, 234)
          doc.rect(18, yPos - 5, 174, 8, 'F')
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(255, 255, 255)
          const texto = seccion.replace('Þ', '').trim()
          const lines = doc.splitTextToSize(texto, 170)
          doc.text(lines, 22, yPos)
          yPos += lines.length * 5 + 8
        } else if (seccion.includes('LUGARES IMPERDIBLES')) {
          doc.setFillColor(102, 126, 234)
          doc.rect(18, yPos - 5, 174, 8, 'F')
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(255, 255, 255)
          const lines = doc.splitTextToSize(seccion, 170)
          doc.text(lines, 22, yPos)
          yPos += lines.length * 5 + 8
        } else if (seccion.includes('ä')) {
          doc.setFillColor(102, 126, 234)
          doc.rect(18, yPos - 5, 174, 8, 'F')
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(255, 255, 255)
          const texto = seccion.replace('ä', '').trim()
          const lines = doc.splitTextToSize(texto, 170)
          doc.text(lines, 22, yPos)
          yPos += lines.length * 5 + 8
        } else if (seccion.includes('ø')) {
          doc.setFillColor(102, 126, 234)
          doc.rect(18, yPos - 5, 174, 8, 'F')
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(255, 255, 255)
          const texto = seccion.replace('ø', '').trim()
          const lines = doc.splitTextToSize(texto, 170)
          doc.text(lines, 22, yPos)
          yPos += lines.length * 5 + 8
        } else if (seccion.trim()) {
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(40, 40, 40)
          const lines = doc.splitTextToSize(seccion, 170)
          doc.text(lines, 20, yPos)
          yPos += lines.length * 5 + 4
        }
      }

      yPos += 15
      
      // Línea separadora entre consultas
      if (index < historial.length - 1) {
        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.5)
        doc.line(20, yPos, 190, yPos)
        yPos += 10
      }
    }

    // Guardar PDF
    const nombreArchivo = destino 
      ? `Itinerario_${destino.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      : `Itinerario_ViajeIA_${new Date().toISOString().split('T')[0]}.pdf`
    
    doc.save(nombreArchivo)
  }

  // Vista de favoritos
  if (vistaActual === 'favoritos') {
    return (
      <div className="app">
        <div className="container">
          <header className="header">
            <h1 className="title">ViajeIA - Mis Viajes Guardados</h1>
          </header>

          <div className="nav-buttons">
            <button 
              onClick={() => setVistaActual('principal')}
              className="button button-secondary"
            >
              ← Volver a Planificar
            </button>
          </div>

          <main className="main-content">
            {favoritos.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-icon">🌟</p>
                <h3 className="empty-state-title">No tienes destinos guardados aún</h3>
                <p className="empty-state-text">
                  Guarda tus destinos favoritos haciendo clic en el botón de favorito en cualquier respuesta.
                </p>
                <button 
                  onClick={() => setVistaActual('principal')}
                  className="button"
                >
                  Comenzar a Planificar
                </button>
              </div>
            ) : (
              <div className="favoritos-grid">
                {favoritos.map((favorito) => (
                  <div key={favorito.id} className="favorito-card">
                    <div className="favorito-header">
                      <h3 className="favorito-destino">{favorito.destino}</h3>
                      <button
                        onClick={() => eliminarFavorito(favorito.id)}
                        className="button-remove"
                        title="Eliminar de favoritos"
                      >
                        ❌
                      </button>
                    </div>
                    
                    {favorito.fechas && (
                      <p className="favorito-fechas">📅 {favorito.fechas}</p>
                    )}

                    {favorito.fotos && favorito.fotos.length > 0 && (
                      <div className="favorito-fotos">
                        {favorito.fotos.slice(0, 2).map((foto, idx) => (
                          <img 
                            key={idx} 
                            src={foto} 
                            alt={favorito.destino}
                            className="favorito-foto"
                          />
                        ))}
                      </div>
                    )}

                    {favorito.infoDestino && (
                      <div className="favorito-info">
                        {favorito.infoDestino.temperatura && (
                          <span className="info-badge">
                            🌡️ {favorito.infoDestino.temperatura}°C
                          </span>
                        )}
                        {favorito.infoDestino.moneda_local && (
                          <span className="info-badge">
                            💵 {favorito.infoDestino.moneda_local}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="favorito-resumen">
                      <p className="favorito-pregunta">
                        <strong>Pregunta:</strong> {favorito.pregunta.substring(0, 100)}
                        {favorito.pregunta.length > 100 ? '...' : ''}
                      </p>
                    </div>

                    <div className="favorito-acciones">
                      <button
                        onClick={() => {
                          // Mostrar detalles completos
                          setRespuesta(favorito.respuesta)
                          setHistorial([favorito])
                          setVistaActual('principal')
                        }}
                        className="button button-small"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    )
  }

  // Vista principal
  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">ViajeIA - Tu Asistente Personal de Viajes</h1>
        </header>

        <div className="nav-buttons">
          <button 
            onClick={() => setVistaActual('favoritos')}
            className="button button-secondary"
          >
            ⭐ Mis Viajes Guardados {favoritos.length > 0 && `(${favoritos.length})`}
          </button>
        </div>

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

          {historial.length > 0 && (
            <button 
              onClick={descargarPDF}
              className="button button-download"
              disabled={cargando}
            >
              📄 Descargar mi itinerario en PDF
            </button>
          )}

          {respuesta && historial.length > 0 && (
            <div className="response-area">
              <div className="response-header">
                <h2 className="response-title">Respuesta:</h2>
                {historial.length > 0 && (
                  <button
                    onClick={() => guardarFavorito(historial[historial.length - 1])}
                    className={`button-favorite ${esFavorito(extraerDestino(historial[historial.length - 1].pregunta)) ? 'active' : ''}`}
                    title={esFavorito(extraerDestino(historial[historial.length - 1].pregunta)) ? 'Ya está en favoritos' : 'Guardar como favorito'}
                  >
                    {esFavorito(extraerDestino(historial[historial.length - 1].pregunta)) ? '⭐' : '☆'}
                  </button>
                )}
              </div>
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



