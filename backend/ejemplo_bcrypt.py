"""
Ejemplo de Encriptación de Contraseñas con bcrypt
(REFERENCIA SOLO - Firebase Auth ya lo hace automáticamente)

Este archivo es solo para referencia educativa.
En producción, Firebase Authentication maneja la encriptación automáticamente.
"""

# Para usar esto, necesitarías instalar: pip install bcrypt
# import bcrypt

def ejemplo_encriptar_contraseña(contraseña_plana: str) -> str:
    """
    Ejemplo de cómo se encriptaría una contraseña con bcrypt
    
    ⚠️ NOTA: Firebase Auth ya hace esto automáticamente.
    Este código es solo para referencia educativa.
    
    Args:
        contraseña_plana: Contraseña en texto plano
        
    Returns:
        Hash encriptado de la contraseña
    """
    # Generar salt (valor aleatorio único)
    # salt = bcrypt.gensalt(rounds=12)  # 12 rondas de encriptación
    
    # Encriptar la contraseña
    # hash_encriptado = bcrypt.hashpw(contraseña_plana.encode('utf-8'), salt)
    
    # Retornar el hash (nunca la contraseña original)
    # return hash_encriptado.decode('utf-8')
    
    # En producción con Firebase, esto se hace automáticamente:
    pass


def ejemplo_verificar_contraseña(contraseña_plana: str, hash_almacenado: str) -> bool:
    """
    Ejemplo de cómo se verificaría una contraseña con bcrypt
    
    ⚠️ NOTA: Firebase Auth ya hace esto automáticamente.
    Este código es solo para referencia educativa.
    
    Args:
        contraseña_plana: Contraseña ingresada por el usuario
        hash_almacenado: Hash almacenado en la base de datos
        
    Returns:
        True si la contraseña es correcta, False si no
    """
    # Verificar si la contraseña coincide con el hash
    # return bcrypt.checkpw(
    #     contraseña_plana.encode('utf-8'),
    #     hash_almacenado.encode('utf-8')
    # )
    
    # En producción con Firebase, esto se hace automáticamente:
    pass


# ⚠️ IMPORTANTE: En tu aplicación real con Firebase Auth:
# 
# NO necesitas hacer nada de esto manualmente.
# Firebase Authentication:
# 1. Encripta automáticamente las contraseñas al crear usuario
# 2. Verifica automáticamente las contraseñas al iniciar sesión
# 3. Usa algoritmos seguros (bcrypt, scrypt, etc.)
# 4. Nunca almacena contraseñas en texto plano
#
# Tu código simplemente usa:
# from firebase.auth import create_user_with_email_and_password
# await create_user_with_email_and_password(auth, email, password)
# ✅ Firebase maneja toda la encriptación automáticamente

