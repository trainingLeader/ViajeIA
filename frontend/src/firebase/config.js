/**
 * Configuración de Firebase
 * 
 * INSTRUCCIONES PARA OBTENER LAS CREDENCIALES:
 * 1. Ve a https://console.firebase.google.com/
 * 2. Crea un nuevo proyecto o selecciona uno existente
 * 3. Ve a "Configuración del proyecto" (ícono de engranaje)
 * 4. Baja hasta "Tus apps" y haz clic en el ícono </> (Web)
 * 5. Registra tu app con un nombre (ej: "ViajeIA")
 * 6. Copia las credenciales que aparecen en "firebaseConfig"
 * 7. Reemplaza los valores aquí abajo con tus credenciales reales
 */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

// ⚠️ IMPORTANTE: Reemplaza estos valores con tus credenciales de Firebase
// Puedes obtenerlas en: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "TU_APP_ID_AQUI"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar servicios
export const auth = getAuth(app)
export const database = getDatabase(app)

export default app

