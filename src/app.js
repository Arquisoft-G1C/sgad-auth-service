require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const { connectDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// ================================
// MIDDLEWARE DE SEGURIDAD
// ================================

// Helmet para headers de seguridad
app.use(helmet());

// CORS para permitir requests desde frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3007',
  credentials: true
}));

// Rate limiting - máximo 100 requests por 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Demasiadas peticiones, intenta nuevamente en 15 minutos'
  }
});
app.use(limiter);

// Rate limiting específico para login - más estricto
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP
  message: {
    error: 'Demasiados intentos de login, intenta nuevamente en 15 minutos'
  },
  skipSuccessfulRequests: true
});

// ================================
// MIDDLEWARE DE PARSEO
// ================================

// Parsear JSON con límite de tamaño
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ================================
// LOGGING MIDDLEWARE
// ================================

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ================================
// HEALTH CHECK
// ================================

app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'sgad-auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ================================
// RUTAS PRINCIPALES
// ================================

// Aplicar rate limiting específico para rutas de auth
app.use('/auth/login', loginLimiter);

// Rutas de autenticación
app.use('/auth', authRoutes);

// ================================
// MANEJO DE ERRORES
// ================================

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler global
app.use((error, req, res, next) => {
  console.error('Error global capturado:', error);
  
  // Error de validación de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'El token proporcionado no es válido'
    });
  }
  
  // Error de token expirado
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'El token ha expirado, inicia sesión nuevamente'
    });
  }
  
  // Error de base de datos
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Servicio no disponible',
      message: 'No se puede conectar a la base de datos'
    });
  }
  
  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Ha ocurrido un error inesperado'
  });
});

// ================================
// INICIO DEL SERVIDOR
// ================================

async function startServer() {
  try {
    // Conectar a la base de datos
    await connectDatabase();
    console.log('✅ Conectado a PostgreSQL');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 SGAD Auth Service corriendo en puerto ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibido SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibido SIGINT, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;