/**
 * Componente de Política de Privacidad
 * 
 * Muestra la política de privacidad de ViajeIA de forma clara y accesible
 */

import { useState } from 'react'
import './PoliticaPrivacidad.css'

function PoliticaPrivacidad({ onAceptar, onRechazar, mostrar = false }) {
  const [aceptado, setAceptado] = useState(false)

  if (!mostrar) return null

  const manejarAceptar = () => {
    if (aceptado && onAceptar) {
      onAceptar()
    }
  }

  return (
    <div className="politica-privacidad-overlay">
      <div className="politica-privacidad-modal">
        <div className="politica-privacidad-header">
          <h2>🔒 Política de Privacidad - ViajeIA</h2>
        </div>

        <div className="politica-privacidad-contenido">
          <section className="politica-seccion">
            <h3>1. Información que Recopilamos</h3>
            <p>ViajeIA recopila únicamente la información necesaria para brindarte el servicio:</p>
            <ul>
              <li><strong>Datos de cuenta:</strong> Nombre completo y correo electrónico (para autenticación)</li>
              <li><strong>Preferencias de viaje:</strong> Destinos, fechas, presupuesto y preferencias que compartas voluntariamente</li>
              <li><strong>Consultas al asistente:</strong> Las preguntas que hagas para obtener recomendaciones</li>
            </ul>
          </section>

          <section className="politica-seccion">
            <h3>2. Cómo Usamos tu Información</h3>
            <p>Utilizamos tu información para:</p>
            <ul>
              <li>Proporcionarte recomendaciones personalizadas de viajes</li>
              <li>Mejorar nuestros servicios y la experiencia del usuario</li>
              <li>Mantener tu cuenta segura y autenticada</li>
              <li>Guardar tus destinos favoritos y consultas anteriores</li>
            </ul>
          </section>

          <section className="politica-seccion">
            <h3>3. Seguridad de tus Datos</h3>
            <p>Nos comprometemos a proteger tu información:</p>
            <ul>
              <li><strong>Contraseñas:</strong> Nunca almacenamos contraseñas en texto plano. Todas están encriptadas usando métodos seguros de Firebase Authentication.</li>
              <li><strong>Encriptación:</strong> Todos los datos se transmiten y almacenan de forma segura usando HTTPS y encriptación.</li>
              <li><strong>Acceso:</strong> Solo tú puedes acceder a tus propios datos. Ni siquiera nosotros podemos ver tus contraseñas.</li>
            </ul>
          </section>

          <section className="politica-seccion">
            <h3>4. Compartir Información</h3>
            <p><strong>NO compartimos tu información personal con terceros.</strong></p>
            <p>Los únicos servicios externos que usamos son:</p>
            <ul>
              <li><strong>OpenAI (ChatGPT):</strong> Para generar recomendaciones. Solo enviamos tu pregunta, no datos personales.</li>
              <li><strong>OpenWeatherMap:</strong> Para información del clima. Solo enviamos el nombre del destino.</li>
              <li><strong>Unsplash:</strong> Para fotos de destinos. Solo enviamos el nombre del destino.</li>
            </ul>
          </section>

          <section className="politica-seccion">
            <h3>5. Tus Derechos</h3>
            <p>Tienes derecho a:</p>
            <ul>
              <li>Acceder a tus datos personales</li>
              <li>Eliminar tu cuenta y todos tus datos en cualquier momento</li>
              <li>Corregir información incorrecta</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section className="politica-seccion">
            <h3>6. Retención de Datos</h3>
            <p>Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, todos tus datos se eliminarán permanentemente en un plazo máximo de 30 días.</p>
          </section>

          <section className="politica-seccion">
            <h3>7. Cookies y Tecnologías Similares</h3>
            <p>Usamos localStorage del navegador para guardar tus preferencias localmente. No usamos cookies de seguimiento de terceros.</p>
          </section>

          <section className="politica-seccion">
            <h3>8. Contacto</h3>
            <p>Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a través de la aplicación.</p>
          </section>

          <div className="politica-fecha">
            <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="politica-privacidad-footer">
          <label className="politica-checkbox-label">
            <input
              type="checkbox"
              checked={aceptado}
              onChange={(e) => setAceptado(e.target.checked)}
              className="politica-checkbox"
            />
            <span>
              He leído y acepto la <strong>Política de Privacidad</strong> de ViajeIA
            </span>
          </label>

          <div className="politica-botones">
            {onRechazar && (
              <button
                onClick={onRechazar}
                className="politica-boton politica-boton-rechazar"
              >
                Rechazar
              </button>
            )}
            <button
              onClick={manejarAceptar}
              disabled={!aceptado}
              className="politica-boton politica-boton-aceptar"
            >
              Aceptar y Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoliticaPrivacidad

