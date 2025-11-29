/**
 * Utilidades de Validación y Sanitización
 * 
 * Funciones reutilizables para validar y sanitizar datos de entrada
 */

/**
 * Valida un nombre de usuario
 * @param {string} nombre - Nombre a validar
 * @returns {object} - { valido: boolean, error?: string, nombre?: string }
 */
export function validarNombre(nombre) {
  if (!nombre) {
    return { valido: false, error: 'El nombre es obligatorio' }
  }

  // Eliminar espacios al inicio y final
  nombre = nombre.trim()

  // Verificar que no esté vacío después de trim
  if (!nombre) {
    return { valido: false, error: 'El nombre es obligatorio' }
  }

  // Verificar longitud mínima y máxima
  if (nombre.length < 2) {
    return { valido: false, error: 'El nombre debe tener al menos 2 caracteres' }
  }

  if (nombre.length > 50) {
    return { valido: false, error: 'El nombre no puede exceder 50 caracteres' }
  }

  // Verificar que solo contenga letras, espacios y algunos caracteres especiales
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/
  if (!regex.test(nombre)) {
    return { valido: false, error: 'El nombre solo puede contener letras y espacios' }
  }

  return { valido: true, nombre: nombre }
}

/**
 * Valida un correo electrónico
 * @param {string} email - Email a validar
 * @returns {object} - { valido: boolean, error?: string, email?: string }
 */
export function validarEmail(email) {
  if (!email) {
    return { valido: false, error: 'El correo electrónico es obligatorio' }
  }

  email = email.trim().toLowerCase()

  // Verificar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valido: false, error: 'El formato del correo electrónico no es válido' }
  }

  // Verificar longitud máxima
  if (email.length > 254) {
    return { valido: false, error: 'El correo electrónico es demasiado largo' }
  }

  // Verificar que no contenga caracteres peligrosos
  const peligrosos = /[<>\"'%;()&+]/
  if (peligrosos.test(email)) {
    return { valido: false, error: 'El correo electrónico contiene caracteres no permitidos' }
  }

  return { valido: true, email: email }
}

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} - { valida: boolean, errores: string[] }
 */
export function validarContraseña(password) {
  const errores = []

  if (!password) {
    return { valida: false, errores: ['La contraseña es obligatoria'] }
  }

  // Longitud mínima
  if (password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres')
  }

  // Longitud máxima (prevenir ataques con contraseñas muy largas)
  if (password.length > 128) {
    errores.push('La contraseña no puede exceder 128 caracteres')
  }

  // Debe tener al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    errores.push('La contraseña debe contener al menos una letra mayúscula')
  }

  // Debe tener al menos una letra minúscula
  if (!/[a-z]/.test(password)) {
    errores.push('La contraseña debe contener al menos una letra minúscula')
  }

  // Debe tener al menos un número
  if (!/[0-9]/.test(password)) {
    errores.push('La contraseña debe contener al menos un número')
  }

  // Debe tener al menos un carácter especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errores.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*)')
  }

  // Verificar contraseñas comunes (lista básica)
  const contraseñasComunes = [
    'password', '12345678', 'qwerty', 'abc123', 'password123',
    '123456789', 'password1', 'welcome', 'admin123', 'letmein'
  ]
  if (contraseñasComunes.includes(password.toLowerCase())) {
    errores.push('Esta contraseña es muy común. Por favor elige una más segura')
  }

  return {
    valida: errores.length === 0,
    errores: errores
  }
}

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} texto - Texto a sanitizar
 * @param {number} maxLength - Longitud máxima (por defecto 1000)
 * @returns {string} - Texto sanitizado
 */
export function sanitizarTexto(texto, maxLength = 1000) {
  if (!texto || typeof texto !== 'string') {
    return ''
  }

  // Eliminar espacios al inicio y final
  let sanitizado = texto.trim()

  // Reemplazar caracteres peligrosos
  sanitizado = sanitizado
    .replace(/</g, '&lt;')      // <
    .replace(/>/g, '&gt;')      // >
    .replace(/"/g, '&quot;')    // "
    .replace(/'/g, '&#x27;')    // '
    .replace(/\//g, '&#x2F;')   // /

  // Limitar longitud
  if (sanitizado.length > maxLength) {
    sanitizado = sanitizado.substring(0, maxLength)
  }

  return sanitizado
}

/**
 * Valida una pregunta del usuario
 * @param {string} pregunta - Pregunta a validar
 * @returns {object} - { valida: boolean, error?: string, pregunta?: string }
 */
export function validarPregunta(pregunta) {
  if (!pregunta) {
    return { valida: false, error: 'La pregunta es obligatoria' }
  }

  const preguntaTrim = pregunta.trim()

  if (preguntaTrim.length < 5) {
    return { valida: false, error: 'La pregunta debe tener al menos 5 caracteres' }
  }

  if (preguntaTrim.length > 1000) {
    return { valida: false, error: 'La pregunta no puede exceder 1000 caracteres' }
  }

  // Verificar que no sea solo espacios o caracteres especiales
  const soloEspeciales = /^[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+$/
  if (soloEspeciales.test(preguntaTrim)) {
    return { valida: false, error: 'La pregunta debe contener texto válido' }
  }

  return { valida: true, pregunta: preguntaTrim }
}

/**
 * Valida un destino
 * @param {string} destino - Destino a validar
 * @returns {object} - { valido: boolean, error?: string, destino?: string }
 */
export function validarDestino(destino) {
  if (!destino) {
    return { valido: false, error: 'El destino es obligatorio' }
  }

  const destinoTrim = destino.trim()

  if (destinoTrim.length < 2) {
    return { valido: false, error: 'El destino debe tener al menos 2 caracteres' }
  }

  if (destinoTrim.length > 100) {
    return { valido: false, error: 'El destino no puede exceder 100 caracteres' }
  }

  // Verificar que solo contenga letras, espacios y algunos caracteres especiales
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/
  if (!regex.test(destinoTrim)) {
    return { valido: false, error: 'El destino solo puede contener letras y espacios' }
  }

  return { valido: true, destino: destinoTrim }
}

/**
 * Valida una fecha
 * @param {string} fecha - Fecha a validar (formato flexible)
 * @returns {object} - { valida: boolean, error?: string, fecha?: string }
 */
export function validarFecha(fecha) {
  if (!fecha) {
    return { valida: false, error: 'La fecha es obligatoria' }
  }

  const fechaTrim = fecha.trim()

  // Verificar formatos comunes de fecha
  const formatosFecha = [
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,  // DD/MM/YYYY o DD-MM-YYYY
    /^\d{1,2}\s+(de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(\s+\d{4})?$/i,
    /^\d{1,2}\s+(de\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)(\s+\d{4})?$/i,
    /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{4}$/i,
    /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}$/i,
  ]

  const formatoValido = formatosFecha.some(formato => formato.test(fechaTrim))

  if (!formatoValido) {
    return { 
      valida: false, 
      error: 'Formato de fecha no válido. Usa formato DD/MM/YYYY o "15 de junio 2024"' 
    }
  }

  // Intentar parsear la fecha para verificar que sea válida
  try {
    const fechaParseada = new Date(fechaTrim)
    if (isNaN(fechaParseada.getTime())) {
      return { valida: false, error: 'La fecha ingresada no es válida' }
    }

    // Verificar que la fecha no sea muy antigua (más de 10 años)
    const fechaLimite = new Date()
    fechaLimite.setFullYear(fechaLimite.getFullYear() - 10)
    if (fechaParseada < fechaLimite) {
      return { valida: false, error: 'La fecha no puede ser anterior a hace 10 años' }
    }

    // Verificar que la fecha no sea muy futura (más de 5 años)
    const fechaFutura = new Date()
    fechaFutura.setFullYear(fechaFutura.getFullYear() + 5)
    if (fechaParseada > fechaFutura) {
      return { valida: false, error: 'La fecha no puede ser más de 5 años en el futuro' }
    }
  } catch (error) {
    return { valida: false, error: 'Error al validar la fecha' }
  }

  return { valida: true, fecha: fechaTrim }
}

/**
 * Valida un presupuesto
 * @param {string|number} presupuesto - Presupuesto a validar
 * @returns {object} - { valido: boolean, error?: string, presupuesto?: number }
 */
export function validarPresupuesto(presupuesto) {
  if (!presupuesto) {
    return { valido: false, error: 'El presupuesto es obligatorio' }
  }

  // Convertir a string y limpiar
  let presupuestoStr = String(presupuesto).trim()
  
  // Eliminar símbolos de moneda y comas
  presupuestoStr = presupuestoStr.replace(/[$,\s]/g, '')

  // Verificar que sea un número
  if (!/^\d+(\.\d+)?$/.test(presupuestoStr)) {
    return { valido: false, error: 'El presupuesto debe ser un número válido' }
  }

  const presupuestoNum = parseFloat(presupuestoStr)

  // Verificar que sea positivo
  if (presupuestoNum <= 0) {
    return { valido: false, error: 'El presupuesto debe ser mayor a 0' }
  }

  // Verificar límite mínimo razonable (ej: $10)
  if (presupuestoNum < 10) {
    return { valido: false, error: 'El presupuesto mínimo es $10' }
  }

  // Verificar límite máximo razonable (ej: $1,000,000)
  if (presupuestoNum > 1000000) {
    return { valido: false, error: 'El presupuesto no puede exceder $1,000,000' }
  }

  return { valido: true, presupuesto: presupuestoNum }
}

/**
 * Valida preferencias de viaje
 * @param {string|string[]} preferencias - Preferencias a validar
 * @returns {object} - { valido: boolean, error?: string, preferencias?: string[] }
 */
export function validarPreferencias(preferencias) {
  // Preferencias son opcionales, pero si se proporcionan deben ser válidas
  if (!preferencias || (Array.isArray(preferencias) && preferencias.length === 0)) {
    return { valido: true, preferencias: [] }
  }

  const preferenciasValidas = [
    'aventura', 'cultura', 'relajación', 'gastronomía', 'naturaleza',
    'aventura', 'culture', 'relax', 'gastronomy', 'nature'
  ]

  let preferenciasArray = []
  if (Array.isArray(preferencias)) {
    preferenciasArray = preferencias
  } else if (typeof preferencias === 'string') {
    preferenciasArray = preferencias.split(',').map(p => p.trim().toLowerCase())
  }

  // Filtrar preferencias válidas
  const preferenciasFiltradas = preferenciasArray.filter(p => 
    preferenciasValidas.some(v => v.toLowerCase() === p.toLowerCase())
  )

  if (preferenciasArray.length > 0 && preferenciasFiltradas.length === 0) {
    return { 
      valido: false, 
      error: 'Las preferencias deben ser: aventura, cultura, relajación, gastronomía o naturaleza' 
    }
  }

  return { valido: true, preferencias: preferenciasFiltradas }
}

