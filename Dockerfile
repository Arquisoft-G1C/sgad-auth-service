# Dockerfile para SGAD Auth Service (Node.js)
# Multi-stage build optimizado para producción

FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY --chown=nodeuser:nodejs src/ ./src/

# Cambiar a usuario no-root
USER nodeuser

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar la aplicación
CMD ["node", "src/app.js"]

