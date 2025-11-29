/**
 * Contexto de Autenticación
 * 
 * Este contexto maneja el estado de autenticación de la aplicación.
 * Permite que cualquier componente acceda a la información del usuario
 * y funciones de autenticación.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../firebase/config'

// Crear el contexto
const AuthContext = createContext()

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

// Componente Provider que envuelve la aplicación
export function AuthProvider({ children }) {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Función para registrar un nuevo usuario
  async function registrar(nombre, email, password) {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // El nombre se guardará cuando guardemos los datos del usuario en Realtime Database
      // (lo haremos en el componente de registro)
      
      return { 
        exito: true, 
        usuario: user,
        mensaje: 'Usuario registrado exitosamente' 
      }
    } catch (error) {
      // Manejar errores comunes
      let mensaje = 'Error al registrar usuario'
      
      if (error.code === 'auth/email-already-in-use') {
        mensaje = 'Este correo electrónico ya está en uso'
      } else if (error.code === 'auth/weak-password') {
        mensaje = 'La contraseña es muy débil (mínimo 6 caracteres)'
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'El correo electrónico no es válido'
      }
      
      return { 
        exito: false, 
        error: error.code,
        mensaje 
      }
    }
  }

  // Función para iniciar sesión
  async function iniciarSesion(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { 
        exito: true, 
        usuario: userCredential.user,
        mensaje: 'Sesión iniciada exitosamente' 
      }
    } catch (error) {
      let mensaje = 'Error al iniciar sesión'
      
      if (error.code === 'auth/user-not-found') {
        mensaje = 'Usuario no encontrado'
      } else if (error.code === 'auth/wrong-password') {
        mensaje = 'Contraseña incorrecta'
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'El correo electrónico no es válido'
      }
      
      return { 
        exito: false, 
        error: error.code,
        mensaje 
      }
    }
  }

  // Función para cerrar sesión
  async function cerrarSesion() {
    try {
      await signOut(auth)
      return { exito: true, mensaje: 'Sesión cerrada exitosamente' }
    } catch (error) {
      return { 
        exito: false, 
        mensaje: 'Error al cerrar sesión: ' + error.message 
      }
    }
  }

  // Observar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioActual(user)
      setCargando(false)
    })

    // Limpiar la suscripción al desmontar
    return unsubscribe
  }, [])

  // Valores que estarán disponibles para todos los componentes
  const valor = {
    usuarioActual,
    registrar,
    iniciarSesion,
    cerrarSesion,
    cargando
  }

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}

