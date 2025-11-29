/**
 * Componente Principal de la Aplicación
 * 
 * Maneja la autenticación y muestra:
 * - Login/Registro si el usuario NO está autenticado
 * - El Asistente si el usuario SÍ está autenticado
 */

import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Registro from './components/Registro'
import Asistente from './components/Asistente'

function App() {
  const { usuarioActual, cargando } = useAuth()
  const [vistaAuth, setVistaAuth] = useState('login') // 'login' o 'registro'

  // Mostrar un loading mientras se verifica el estado de autenticación
  if (cargando) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner" style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '1.1rem' }}>Cargando ViajeIA...</p>
        </div>
      </div>
    )
  }

  // Si el usuario NO está autenticado, mostrar Login o Registro
  if (!usuarioActual) {
    return (
      <>
        {vistaAuth === 'login' ? (
          <Login cambiarVista={setVistaAuth} />
        ) : (
          <Registro cambiarVista={setVistaAuth} />
        )}
      </>
    )
  }

  // Si el usuario SÍ está autenticado, mostrar el Asistente
  return <Asistente />
}

export default App
