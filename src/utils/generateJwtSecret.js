#!/usr/bin/env node
/**
 * JWT Secret Generator
 * SGAD Auth Service
 *
 * Generates a cryptographically secure random string for use as JWT_SECRET
 *
 * Usage:
 *   node src/utils/generateJwtSecret.js
 *   node src/utils/generateJwtSecret.js --length 64
 *   node src/utils/generateJwtSecret.js --format base64
 *   node src/utils/generateJwtSecret.js --format hex
 */

const crypto = require("crypto");

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
// GENERATE SECRET
// ================================

function generateSecret(length = 64, format = "base64") {
  try {
    const buffer = crypto.randomBytes(length);

    let secret;
    switch (format.toLowerCase()) {
      case "hex":
        secret = buffer.toString("hex");
        break;
      case "base64":
        secret = buffer.toString("base64");
        break;
      case "base64url":
        secret = buffer.toString("base64url");
        break;
      default:
        throw new Error(`Formato no soportado: ${format}`);
    }

    return secret;
  } catch (error) {
    console.error("❌ Error generando secreto:", error.message);
    process.exit(1);
  }
}

// ================================
// SHOW HELP
// ================================

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         SGAD JWT Secret Generator - Utility Tool               ║
╚════════════════════════════════════════════════════════════════╝

📖 USO:

  Generar un secreto JWT:
  ──────────────────────────────────────────────────────────────
  node src/utils/generateJwtSecret.js
  
  Opciones:
    --length <num>     Longitud en bytes (default: 64)
    --format <type>    Formato de salida: base64 | hex | base64url
                       (default: base64)

  Ejemplos:
    node src/utils/generateJwtSecret.js
    node src/utils/generateJwtSecret.js --length 32
    node src/utils/generateJwtSecret.js --format hex
    node src/utils/generateJwtSecret.js --length 64 --format base64url

  ──────────────────────────────────────────────────────────────

🔐 SEGURIDAD:

  • El secreto generado usa crypto.randomBytes() que es
    criptográficamente seguro
  • Se recomienda un mínimo de 32 bytes (256 bits)
  • Para producción, usar al menos 64 bytes (512 bits)
  • Guarda el secreto en tu archivo .env
  • NUNCA compartas el secreto o lo commits a git

╚════════════════════════════════════════════════════════════════╝
  `);
}

// ================================
// MAIN
// ================================

function main() {
  // Show help
  if (hasFlag("--help") || hasFlag("-h")) {
    showHelp();
    return;
  }

  const length = parseInt(getArg("--length")) || 64;
  const format = getArg("--format") || "base64";

  if (length < 16) {
    console.error("⚠️  Advertencia: Se recomienda un mínimo de 16 bytes");
  }

  if (length < 32) {
    console.error(
      "⚠️  Advertencia: Para producción se recomienda al menos 32 bytes"
    );
  }

  const secret = generateSecret(length, format);

  console.log("\n✅ JWT Secret generado exitosamente:\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("JWT_SECRET:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(secret);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📊 Detalles:");
  console.log(`  • Longitud: ${length} bytes (${length * 8} bits)`);
  console.log(`  • Formato: ${format}`);
  console.log(`  • Caracteres: ${secret.length}`);

  console.log("\n📝 Para usar en tu .env:");
  console.log(`JWT_SECRET=${secret}`);

  console.log("\n🔐 Recordatorios de seguridad:");
  console.log("  1. Guarda este secreto en tu archivo .env");
  console.log("  2. NUNCA lo compartas públicamente");
  console.log("  3. NUNCA lo commits a git");
  console.log(
    "  4. Usa secretos diferentes para cada ambiente (dev, staging, prod)"
  );
  console.log("  5. Rota el secreto periódicamente en producción");

  console.log("\n💾 Comando para agregar al .env:");
  console.log(`  echo "JWT_SECRET=${secret}" >> .env`);
}

// ================================
// RUN
// ================================

if (require.main === module) {
  main();
}

module.exports = {
  generateSecret,
};
