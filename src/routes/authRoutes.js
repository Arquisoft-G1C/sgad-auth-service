// SGAD Auth Service - Rutas de Autenticación
const express = require('express');
const authController = require('../controllers/authcontroller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ================================
// RUTAS PÚBLICAS (sin autenticación)
// ================================

/**
 * POST /auth/login
 * Iniciar sesión con email y password
 * Body: { email: string, password: string }
 */
router.post('/login', authController.login);

/**
 * GET /auth/verify
 * Verificar si un token JWT es válido
 * Headers: { Authorization: "Bearer <token>" }
 */
router.get('/verify', authController.verifyToken);

/**
 * POST /auth/refresh
 * Refrescar un token JWT
 * Headers: { Authorization: "Bearer <token>" }
 */
router.post('/refresh', authController.refreshToken);

// ================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ================================

/**
 * POST /auth/logout
 * Cerrar sesión
 * Headers: { Authorization: "Bearer <token>" }
 */
router.post('/logout', authController.logout);

/**
 * GET /auth/profile
 * Obtener perfil del usuario autenticado
 * Headers: { Authorization: "Bearer <token>" }
 */
router.get('/profile', authMiddleware.requireAuth, authController.getProfile);

/**
 * POST /auth/check-permissions
 * Verificar permisos del usuario
 * Headers: { Authorization: "Bearer <token>" }
 * Body: { requiredRole: string }
 */
router.post('/check-permissions', authMiddleware.requireAuth, authController.checkPermissions);

// ================================
// RUTAS DE ADMINISTRACIÓN (solo admin/presidente)
// ================================

/**
 * GET /auth/users (futuro)
 * Listar usuarios - solo para administradores
 */
// router.get('/users', authMiddleware.requireRole(['administrador', 'presidente']), authController.getUsers);

module.exports = router;