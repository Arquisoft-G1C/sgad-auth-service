// SGAD Auth Service - Configuración de Base de Datos
const { Pool } = require("pg");

// ================================
// CONFIGURACIÓN DE POSTGRESQL
// ================================

const poolConfig = {
  user: process.env.POSTGRES_USER || "sgad_user",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "sgad_db",
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,

  // Configuración de pool de conexiones
  max: 20, // máximo 20 conexiones en el pool
  idleTimeoutMillis: 30000, // cerrar conexiones inactivas después de 30s
  connectionTimeoutMillis: 2000, // timeout de conexión de 2s

  // SSL disabled for Docker internal network
  ssl: false,
};

// Pool de conexiones global
let pool;

// ================================
// FUNCIONES DE CONEXIÓN
// ================================

// Conecta a la base de datos PostgreSQL

async function connectDatabase() {
  try {
    pool = new Pool(poolConfig);

    // Probar la conexión
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();

    console.log(`✅ PostgreSQL conectado: ${result.rows[0].now}`);
    return pool;
  } catch (error) {
    console.error("❌ Error conectando a PostgreSQL:", error.message);
    throw error;
  }
}

//Obtiene una conexión del pool

function getPool() {
  if (!pool) {
    throw new Error(
      "Base de datos no inicializada. Llama connectDatabase() primero."
    );
  }
  return pool;
}

/**
 * Ejecuta una query SQL
 * @param {string} text - Query SQL
 * @param {array} params - Parámetros de la query
 */

async function query(text, params) {
  const start = Date.now();

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log de queries en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔍 Query ejecutada en ${duration}ms:`,
        text.substring(0, 100)
      );
    }

    return res;
  } catch (error) {
    console.error("❌ Error en query SQL:", error.message);
    console.error("Query:", text);
    console.error("Params:", params);
    throw error;
  }
}

// Inicia una transacción

async function getClient() {
  const client = await pool.connect();

  // Wrapper para facilitar transacciones
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Timeout para transacciones largas
  const timeout = setTimeout(() => {
    console.error("⚠️  Transacción muy larga, liberando cliente");
    client.release();
  }, 5000);

  // Override del release para limpiar timeout
  client.release = () => {
    clearTimeout(timeout);
    return release();
  };

  return client;
}

// Cierra todas las conexiones

async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log("✅ Pool de conexiones PostgreSQL cerrado");
  }
}

// ================================
// QUERIES COMUNES PARA AUTH
// ================================

// Busca un usuario por email

async function findUserByEmail(email) {
  const text = `
    SELECT 
      id,
      email,
      password_hash,
      role,
      first_name,
      last_name,
      phone,
      is_active,
      created_at
    FROM users
    WHERE email = $1 AND is_active = true
  `;

  const result = await query(text, [email]);
  return result.rows[0] || null;
}

// Busca un usuario por ID

async function findUserById(userId) {
  const text = `
    SELECT 
      id,
      email,
      role,
      first_name,
      last_name,
      phone,
      is_active
    FROM users
    WHERE id = $1 AND is_active = true
  `;

  const result = await query(text, [userId]);
  return result.rows[0] || null;
}

// Actualiza el último login de un usuario

async function updateLastLogin(userId) {
  const text = `
    UPDATE users 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;

  await query(text, [userId]);
}

module.exports = {
  connectDatabase,
  getPool,
  query,
  getClient,
  closeDatabase,

  // Queries específicas
  findUserByEmail,
  findUserById,
  updateLastLogin,
};
