// src/utils/traduccionesUtil.js

/**
 * Traduce mensajes de error de Firebase Auth a español.
 * @param {string} errorMessage - El mensaje original devuelto por Firebase.
 * @returns {string} Mensaje traducido y amigable para mostrar al usuario.
 */
export function traducirErrorFirebase(errorMessage) {
  // Buscá el código entre paréntesis, por ejemplo: (auth/email-already-in-use)
  const match = errorMessage.match(/\(auth\/([^)]+)\)/);
  const code = match ? match[1] : '';

  // Mapeo de códigos de error a mensajes en español
  const errores = {
    "email-already-in-use": "Ese email ya está registrado.",
    "email-already-exists": "Ese email ya está registrado.",
    "invalid-email": "El email ingresado no es válido.",
    "user-not-found": "No se encontró ningún usuario con ese email.",
    "wrong-password": "La contraseña es incorrecta.",
    "weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "too-many-requests": "Demasiados intentos fallidos. Espera un momento e intenta de nuevo.",
    "operation-not-allowed": "El registro con email y contraseña no está habilitado.",
    "missing-email": "Por favor, ingresa tu email.",
    "missing-password": "Por favor, ingresa tu contraseña.",
    "invalid-password": "La contraseña es inválida.",
    "invalid-credential": "Las credenciales ingresadas no son válidas.",
    "user-disabled": "Tu cuenta ha sido deshabilitada. Contacta al administrador.",
    "account-exists-with-different-credential": "Ya existe una cuenta con este email, pero con un método de acceso diferente.",
    // Otros errores menos comunes:
    "invalid-verification-code": "El código de verificación es incorrecto.",
    "invalid-verification-id": "El ID de verificación es inválido.",
    "auth/invalid-credential": "Las credenciales proporcionadas no son válidas.",
  };

  // Algunos errores pueden tener mensajes fuera del patrón estándar (ejemplo, contraseña débil)
  if (errorMessage.toLowerCase().includes("password should be at least 6 characters")) {
    return errores["weak-password"];
  }

  // Devuelve el mensaje traducido, o el mensaje original si no lo encuentra
  return errores[code] || "Ocurrió un error. Por favor, intenta de nuevo.";
}