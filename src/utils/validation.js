const Joi = require('joi');

// ================================
// SCHEMAS DE VALIDACIÓN
// ================================

// Schema para validar datos de login

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'El email debe tener un formato válido',
      'any.required': 'El email es requerido'
    }),
    
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede tener más de 100 caracteres',
      'any.required': 'La contraseña es requerida'
    })
});

// Schema para validar token

const tokenSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'El token es requerido'
    })
});

// Schema para validar rol requerido

const roleSchema = Joi.object({
  requiredRole: Joi.string()
    .valid('arbitro', 'administrador', 'presidente')
    .required()
    .messages({
      'any.only': 'El rol debe ser: arbitro, administrador o presidente',
      'any.required': 'El rol requerido es necesario'
    })
});

// ================================
// FUNCIONES DE VALIDACIÓN
// ================================

/**
 * Valida datos de entrada para login
 * @param {object} data - Datos a validar
 * @returns {object} - Resultado de validación
 */
function validateLoginInput(data) {
  return loginSchema.validate(data, {
    abortEarly: false, // Mostrar todos los errores, no solo el primero
    stripUnknown: true // Remover campos no definidos en el schema
  });
}

/**
 * Valida token de entrada
 * @param {object} data - Datos a validar
 * @returns {object} - Resultado de validación
 */
function validateTokenInput(data) {
  return tokenSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Valida rol requerido
 * @param {object} data - Datos a validar
 * @returns {object} - Resultado de validación
 */
function validateRoleInput(data) {
  return roleSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida fortaleza de contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} - Resultado de validación con detalles
 */
function validatePasswordStrength(password) {
  const result = {
    isValid: true,
    score: 0,
    feedback: []
  };
  
  if (password.length < 8) {
    result.feedback.push('Debe tener al menos 8 caracteres');
    result.isValid = false;
  } else {
    result.score += 1;
  }
  
  if (!/[a-z]/.test(password)) {
    result.feedback.push('Debe contener al menos una letra minúscula');
    result.isValid = false;
  } else {
    result.score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    result.feedback.push('Debe contener al menos una letra mayúscula');
    result.isValid = false;
  } else {
    result.score += 1;
  }
  
  if (!/\d/.test(password)) {
    result.feedback.push('Debe contener al menos un número');
    result.isValid = false;
  } else {
    result.score += 1;
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.feedback.push('Debe contener al menos un carácter especial');
  } else {
    result.score += 1;
  }
  
  // Determinar nivel de fortaleza
  if (result.score <= 2) {
    result.strength = 'débil';
  } else if (result.score <= 3) {
    result.strength = 'media';
  } else if (result.score <= 4) {
    result.strength = 'fuerte';
  } else {
    result.strength = 'muy fuerte';
  }
  
  return result;
}

/**
 * Sanitiza entrada de texto
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
function sanitizeText(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  return text
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, ''); // Remover eventos onclick, onload, etc.
}

/**
 * Valida que los roles sean válidos
 * @param {string|array} roles - Rol(es) a validar
 * @returns {boolean} - True si son válidos
 */
function validateRoles(roles) {
  const validRoles = ['arbitro', 'administrador', 'presidente'];
  const rolesToCheck = Array.isArray(roles) ? roles : [roles];
  
  return rolesToCheck.every(role => validRoles.includes(role));
}

module.exports = {
  validateLoginInput,
  validateTokenInput,
  validateRoleInput,
  isValidEmail,
  validatePasswordStrength,
  sanitizeText,
  validateRoles
};

