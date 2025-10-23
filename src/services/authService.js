const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById, updateLastLogin } = require('../config/database');

// ================================
// CONFIGURACIÓN JWT
// ================================

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está configurado en las variables de entorno');
}

// ================================
// FUNCIONES DE AUTENTICACIÓN
// ================================

/**
 * Autentica un usuario con email y password
 * @param {string} email - Email del usuario
 * @param {string} password - Password en texto plano
 * @returns {object} - Usuario autenticado y token JWT
 */

async function loginUser(email, password) {
  try {
    // Buscar usuario por email
    const user = await findUserByEmail(email.toLowerCase().trim());
    
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }
    
    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }
    
    // Verificar que el usuario esté activo
    if (!user.is_active) {
      throw new Error('USER_INACTIVE');
    }
    
    // Actualizar último login
    await updateLastLogin(user.id);
    
    // Generar JWT token
    const token = generateJWT(user);
    
    // Preparar datos del usuario (sin password)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      refereeId: user.referee_id,
      licenseNumber: user.license_number,
      specialties: user.specialties,
      certificationLevel: user.certification_level
    };
    
    return {
      success: true,
      user: userData,
      token,
      expiresIn: JWT_EXPIRES_IN
    };
    
  } catch (error) {
    console.error('Error en loginUser:', error.message);
    
    if (error.message === 'INVALID_CREDENTIALS') {
      throw new Error('Email o contraseña incorrectos');
    }
    
    if (error.message === 'USER_INACTIVE') {
      throw new Error('Usuario inactivo. Contacta al administrador');
    }
    
    throw new Error('Error al procesar el login');
  }
}

/**
 * Verifica un JWT token y retorna los datos del usuario
 * @param {string} token - JWT token
 * @returns {object} - Datos del usuario
 */

async function verifyToken(token) {
  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuario actualizado en la base de datos
    const user = await findUserById(decoded.userId);
    
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    
    if (!user.is_active) {
      throw new Error('USER_INACTIVE');
    }
    
    // Preparar datos del usuario
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      refereeId: user.referee_id,
      licenseNumber: user.license_number,
      specialties: user.specialties
    };
    
    return {
      success: true,
      user: userData,
      tokenValid: true
    };
    
  } catch (error) {
    console.error('Error en verifyToken:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    
    if (error.message === 'USER_NOT_FOUND') {
      throw new Error('Usuario no encontrado');
    }
    
    if (error.message === 'USER_INACTIVE') {
      throw new Error('Usuario inactivo');
    }
    
    throw new Error('Error al verificar el token');
  }
}

/**
 * Genera un JWT token para un usuario
 * @param {object} user - Datos del usuario
 * @returns {string} - JWT token
 */

function generateJWT(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    refereeId: user.referee_id,
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'sgad-auth-service',
    audience: 'sgad-system'
  });
}

/**
 * Refresca un JWT token
 * @param {string} token - Token actual
 * @returns {object} - Nuevo token
 */

async function refreshToken(token) {
  try {
    // Verificar token actual (ignorando expiración)
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    
    // Buscar usuario actual
    const user = await findUserById(decoded.userId);
    
    if (!user || !user.is_active) {
      throw new Error('Usuario no válido para refresh');
    }
    
    // Generar nuevo token
    const newToken = generateJWT(user);
    
    return {
      success: true,
      token: newToken,
      expiresIn: JWT_EXPIRES_IN
    };
    
  } catch (error) {
    console.error('Error en refreshToken:', error.message);
    throw new Error('Error al refrescar el token');
  }
}

/**
 * Valida los permisos de un usuario para una acción específica
 * @param {object} user - Datos del usuario
 * @param {string} requiredRole - Rol requerido
 * @returns {boolean} - True si tiene permisos
 */

function validatePermissions(user, requiredRole) {
  // Jerarquía de roles: presidente > administrador > arbitro
  const roleHierarchy = {
    'presidente': 3,
    'administrador': 2,
    'arbitro': 1
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Logout (invalidar token - implementación futura con Redis)
 * @param {string} token - Token a invalidar
 */
async function logoutUser(token) {
  try {
    // TODO: Implementar blacklist de tokens en Redis
    // Por ahora, el logout se maneja en el frontend removiendo el token
    
    return {
      success: true,
      message: 'Sesión cerrada correctamente'
    };
    
  } catch (error) {
    console.error('Error en logoutUser:', error.message);
    throw new Error('Error al cerrar sesión');
  }
}

module.exports = {
  loginUser,
  verifyToken,
  refreshToken,
  validatePermissions,
  logoutUser,
  generateJWT
};

