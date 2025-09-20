const authService = require('../services/authService');
const { validateLoginInput, validateTokenInput } = require('../utils/validation');

// ================================
// CONTROLLER: LOGIN
// ================================

// Autentica un usuario con email y password (POST /auth/login)

async function login(req, res) {
  try {
    // Validar entrada
    const { error, value } = validateLoginInput(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      });
    }
    
    const { email, password } = value;
    
    // Procesar login
    const result = await authService.loginUser(email, password);
    
    // Log del login exitoso
    console.log(`✅ Login exitoso - Usuario: ${email}, Rol: ${result.user.role}`);
    
    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: result.user,
        token: result.token,
        expiresIn: result.expiresIn
      }
    });
    
  } catch (error) {
    console.error('❌ Error en login controller:', error.message);
    
    // Respuesta de error (sin revelar información sensible)
    res.status(401).json({
      success: false,
      error: 'Error de autenticación',
      message: error.message
    });
  }
}

// ================================
// CONTROLLER: VERIFY TOKEN
// ================================


// Verifica si un JWT token es válido (GET /auth/verify)

async function verifyToken(req, res) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
        message: 'Se requiere un token de autorización'
      });
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar token
    const result = await authService.verifyToken(token);
    
    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Token válido',
      data: {
        user: result.user,
        tokenValid: result.tokenValid
      }
    });
    
  } catch (error) {
    console.error('❌ Error en verify controller:', error.message);
    
    res.status(401).json({
      success: false,
      error: 'Token inválido',
      message: error.message
    });
  }
}

// ================================
// CONTROLLER: REFRESH TOKEN
// ================================


// Refresca un JWT token (POST /auth/refresh)

async function refreshToken(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Refrescar token
    const result = await authService.refreshToken(token);
    
    res.status(200).json({
      success: true,
      message: 'Token refrescado exitosamente',
      data: {
        token: result.token,
        expiresIn: result.expiresIn
      }
    });
    
  } catch (error) {
    console.error('❌ Error en refresh controller:', error.message);
    
    res.status(401).json({
      success: false,
      error: 'Error al refrescar token',
      message: error.message
    });
  }
}

// ================================
// CONTROLLER: LOGOUT
// ================================

// Cierra sesión de un usuario (POST /auth/logout)

async function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Procesar logout
    const result = await authService.logoutUser(token);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    console.error('❌ Error en logout controller:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error al cerrar sesión',
      message: error.message
    });
  }
}

// ================================
// CONTROLLER: USER PROFILE
// ================================

// Obtiene el perfil del usuario autenticado (GET /auth/profile)

async function getProfile(req, res) {
  try {

    // El middleware de auth ya debe haber verificado el token y adjuntado los datos del usuario en req.user
    
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        user: user
      }
    });
    
  } catch (error) {
    console.error('❌ Error en profile controller:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener perfil',
      message: error.message
    });
  }
}

// ================================
// CONTROLLER: CHECK PERMISSIONS
// ================================

// Verifica si el usuario tiene permisos para una acción (POST /auth/check-permissions)

async function checkPermissions(req, res) {
  try {
    const { requiredRole } = req.body;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }
    
    if (!requiredRole) {
      return res.status(400).json({
        success: false,
        error: 'Rol requerido no especificado'
      });
    }
    
    const hasPermission = authService.validatePermissions(user, requiredRole);
    
    res.status(200).json({
      success: true,
      data: {
        hasPermission,
        userRole: user.role,
        requiredRole
      }
    });
    
  } catch (error) {
    console.error('❌ Error en checkPermissions controller:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error al verificar permisos',
      message: error.message
    });
  }
}

module.exports = {
  login,
  verifyToken,
  refreshToken,
  logout,
  getProfile,
  checkPermissions};