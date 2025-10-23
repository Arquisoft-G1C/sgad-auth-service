const authService = require('../services/authService');

// ================================
// MIDDLEWARE: REQUIRE AUTH
// ================================

async function requireAuth(req, res, next) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorización requerido',
        message: 'Debes proporcionar un token válido en el header Authorization'
      });
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar token usando el servicio de auth
    const result = await authService.verifyToken(token);
    
    // Adjuntar datos del usuario a la request
    req.user = result.user;
    req.token = token;
    
    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Usuario autenticado: ${result.user.email} (${result.user.role})`);
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Error en requireAuth middleware:', error.message);
    
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      message: error.message
    });
  }
}

// ================================
// MIDDLEWARE: REQUIRE ROLE
// ================================

/**
 * Middleware que requiere un rol específico
 * @param {string|array} allowedRoles - Rol(es) permitido(s)
 */
function requireRole(allowedRoles) {
  // Normalizar a array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return async (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado',
          message: 'Debes estar autenticado para acceder a esta ruta'
        });
      }
      
      // Verificar que el usuario tenga el rol requerido
      if (!roles.includes(req.user.role)) {
        console.log(`⛔ Acceso denegado - Usuario: ${req.user.email}, Rol: ${req.user.role}, Requerido: ${roles.join(' o ')}`);
        
        return res.status(403).json({
          success: false,
          error: 'Permisos insuficientes',
          message: `Se requiere uno de estos roles: ${roles.join(', ')}`
        });
      }
      
      // Log para desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Acceso autorizado - Usuario: ${req.user.email}, Rol: ${req.user.role}`);
      }
      
      next();
      
    } catch (error) {
      console.error('❌ Error en requireRole middleware:', error.message);
      
      return res.status(500).json({
        success: false,
        error: 'Error de autorización',
        message: 'Error interno del servidor'
      });
    }
  };
}

// ================================
// MIDDLEWARE: OPTIONAL AUTH
// ================================

// Si hay token, lo verifica; si no hay, continúa sin req.user

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    // Si no hay header, continuar sin autenticación
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    try {
      // Intentar verificar el token
      const result = await authService.verifyToken(token);
      req.user = result.user;
      req.token = token;
      
    } catch (error) {
      // Si el token es inválido, continuar sin req.user
      console.log('⚠️  Token opcional inválido, continuando sin autenticación');
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Error en optionalAuth middleware:', error.message);
    // En caso de error, continuar sin autenticación
    next();
  }
}

// ================================
// MIDDLEWARE: SELF OR ADMIN
// ================================

/**
 * Middleware que permite acceso si el usuario es el mismo o es admin/presidente
 * Útil para endpoints donde un usuario puede ver/editar sus propios datos
 * @param {string} userIdParam - Nombre del parámetro que contiene el ID del usuario
 */
function requireSelfOrAdmin(userIdParam = 'userId') {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }
      
      const targetUserId = req.params[userIdParam];
      const currentUserId = req.user.id;
      const userRole = req.user.role;
      
      // Permitir si es el mismo usuario o es admin/presidente
      const isSelf = targetUserId === currentUserId;
      const isAdmin = ['administrador', 'presidente'].includes(userRole);
      
      if (!isSelf && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Permisos insuficientes',
          message: 'Solo puedes acceder a tus propios datos o ser administrador'
        });
      }
      
      next();
      
    } catch (error) {
      console.error('❌ Error en requireSelfOrAdmin middleware:', error.message);
      
      return res.status(500).json({
        success: false,
        error: 'Error de autorización'
      });
    }
  };
}

module.exports = {
  requireAuth,
  requireRole,
  optionalAuth,
  requireSelfOrAdmin
};