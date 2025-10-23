

/usr/bin/env node
/**
 * JWT Token Generator Utility
 * SGAD Auth Service
 *
 * Usage:
 *   node src/utils/generateToken.js --email user@example.com
 *   node src/utils/generateToken.js --userId 1 --email user@example.com --role arbitro
 *   node src/utils/generateToken.js --verify "your_token_here"
 *   node src/utils/generateToken.js --decode "your_token_here"
 */

require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_development";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// ================================
// PARSE COMMAND LINE ARGUMENTS
// ================================

const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] : null;
};

const hasFlag = (name) => args.includes(name);

// ================================
// GENERATE TOKEN
// ================================

function generateToken(payload) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "sgad-auth-service",
      audience: "sgad-system",
    });

    console.log("\n✅ Token generado exitosamente:\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Token JWT:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(token);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📋 Payload del token:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("\n⏰ Expira en:", JWT_EXPIRES_IN);

    console.log("\n🔧 Uso en API:");
    console.log("Authorization: Bearer " + token);

    console.log("\n📝 Ejemplo cURL:");
    console.log(
      `curl -H "Authorization: Bearer ${token}" http://localhost:3001/auth/profile`
    );

    return token;
  } catch (error) {
    console.error("❌ Error generando token:", error.message);
    process.exit(1);
  }
}

// ================================
// VERIFY TOKEN
// ================================

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("\n✅ Token válido\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Payload decodificado:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(JSON.stringify(decoded, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const issuedAt = new Date(decoded.iat * 1000);
    const expiresAt = new Date(decoded.exp * 1000);
    const now = new Date();
    const timeLeft = Math.floor((expiresAt - now) / 1000 / 60);

    console.log("📅 Emitido:", issuedAt.toLocaleString());
    console.log("⏰ Expira:", expiresAt.toLocaleString());
    console.log(
      "⌛ Tiempo restante:",
      timeLeft > 0 ? `${timeLeft} minutos` : "EXPIRADO"
    );

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.error("\n❌ Token expirado");
      console.error(
        "⏰ Expiró el:",
        new Date(error.expiredAt).toLocaleString()
      );
    } else if (error.name === "JsonWebTokenError") {
      console.error("\n❌ Token inválido:", error.message);
    } else {
      console.error("\n❌ Error verificando token:", error.message);
    }
    process.exit(1);
  }
}

// ================================
// DECODE TOKEN (without verification)
// ================================

function decodeToken(token) {
  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      throw new Error("No se pudo decodificar el token");
    }

    console.log("\n📋 Token decodificado (sin verificar):\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Header:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(JSON.stringify(decoded.header, null, 2));
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Payload:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(JSON.stringify(decoded.payload, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    if (decoded.payload.exp) {
      const expiresAt = new Date(decoded.payload.exp * 1000);
      console.log("⏰ Expira:", expiresAt.toLocaleString());
    }

    return decoded;
  } catch (error) {
    console.error("❌ Error decodificando token:", error.message);
    process.exit(1);
  }
}

// ================================
// SHOW HELP
// ================================

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         SGAD JWT Token Generator - Utility Tool                ║
╚════════════════════════════════════════════════════════════════╝

📖 USO:

  Generar un token:
  ──────────────────────────────────────────────────────────────
  node src/utils/generateToken.js --userId <id> --email <email> --role <role>
  
  Opciones para generar token:
    --userId <id>         ID del usuario (default: 1)
    --email <email>       Email del usuario (default: test@sgad.com)
    --role <role>         Rol del usuario: arbitro | administrador | presidente
                          (default: arbitro)
    --refereeId <id>      ID del árbitro (opcional)
    --expiresIn <time>    Tiempo de expiración (e.g., 1h, 24h, 7d)

  Ejemplos:
    node src/utils/generateToken.js --email admin@sgad.com --role administrador
    node src/utils/generateToken.js --userId 5 --email referee@sgad.com --role arbitro --refereeId 10
    node src/utils/generateToken.js --email president@sgad.com --role presidente --expiresIn 7d

  ──────────────────────────────────────────────────────────────
  
  Verificar un token:
  ──────────────────────────────────────────────────────────────
  node src/utils/generateToken.js --verify "your_jwt_token_here"
  
  Decodificar un token (sin verificar):
  ──────────────────────────────────────────────────────────────
  node src/utils/generateToken.js --decode "your_jwt_token_here"

  ──────────────────────────────────────────────────────────────

🔑 VARIABLES DE ENTORNO:

  JWT_SECRET       - Clave secreta para firmar tokens
  JWT_EXPIRES_IN   - Tiempo de expiración (default: 24h)

⚠️  NOTA: Este script es para desarrollo/testing. No lo uses en producción.

╚════════════════════════════════════════════════════════════════╝
  `);
}

// ================================
// MAIN
// ================================

function main() {
  // Show help
  if (hasFlag("--help") || hasFlag("-h") || args.length === 0) {
    showHelp();
    return;
  }

  // Verify token
  if (hasFlag("--verify")) {
    const token = getArg("--verify");
    if (!token) {
      console.error("❌ Error: Debes proporcionar un token para verificar");
      console.error(
        'Uso: node src/utils/generateToken.js --verify "your_token"'
      );
      process.exit(1);
    }
    verifyToken(token);
    return;
  }

  // Decode token
  if (hasFlag("--decode")) {
    const token = getArg("--decode");
    if (!token) {
      console.error("❌ Error: Debes proporcionar un token para decodificar");
      console.error(
        'Uso: node src/utils/generateToken.js --decode "your_token"'
      );
      process.exit(1);
    }
    decodeToken(token);
    return;
  }

  // Generate token
  const userId = getArg("--userId") || "1";
  const email = getArg("--email") || "test@sgad.com";
  const role = getArg("--role") || "arbitro";
  const refereeId = getArg("--refereeId") || null;
  const customExpiresIn = getArg("--expiresIn");

  const payload = {
    userId: userId,
    email: email,
    role: role,
    iat: Math.floor(Date.now() / 1000),
  };

  if (refereeId) {
    payload.refereeId = refereeId;
  }

  // Generate with custom expiration if provided
  if (customExpiresIn) {
    const originalExpiresIn = JWT_EXPIRES_IN;
    process.env.JWT_EXPIRES_IN = customExpiresIn;
    generateToken(payload);
    process.env.JWT_EXPIRES_IN = originalExpiresIn;
  } else {
    generateToken(payload);
  }
}

// ================================
// RUN
// ================================

if (require.main === module) {
  main();
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};



