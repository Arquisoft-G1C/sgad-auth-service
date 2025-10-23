# SGAD Auth Service

Authentication and Authorization microservice for the SGAD (Sistema de Gestión de Árbitros Deportivos) platform.

## 🚀 Features

- **User Authentication**: JWT-based authentication system
- **Role-Based Access Control**: Support for multiple user roles (arbitro, administrador, presidente)
- **Rate Limiting**: Protection against brute-force attacks
- **PostgreSQL Integration**: Robust database connection pooling
- **Docker Support**: Production-ready containerization
- **Security**: Helmet.js, CORS, bcrypt password hashing

## 📋 Prerequisites

- Node.js 18+ or Docker
- PostgreSQL 15+
- npm or yarn

## 🛠️ Installation

### Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start the service
npm start
```

### Docker

```bash
# Build the image
docker build -t sgad-auth-service:latest .

# Run the container
docker run -p 3001:3001 \
  -e POSTGRES_HOST=your_db_host \
  -e POSTGRES_PASSWORD=your_password \
  -e JWT_SECRET=your_secret \
  sgad-auth-service:latest
```

## 🔧 Configuration

Environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | 3001 |
| `NODE_ENV` | Environment | development |
| `POSTGRES_HOST` | Database host | localhost |
| `POSTGRES_PORT` | Database port | 5432 |
| `POSTGRES_DB` | Database name | sgad_db |
| `POSTGRES_USER` | Database user | sgad_user |
| `POSTGRES_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | 24h |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /auth/register - Register new user
POST /auth/login - Login user
GET /auth/profile - Get user profile (requires auth)
POST /auth/logout - Logout user
POST /auth/refresh - Refresh JWT token
```

## 🔐 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable origin protection
- **Rate Limiting**: 
  - General: 100 requests per 15 minutes
  - Login: 5 attempts per 15 minutes
- **JWT**: Token-based authentication
- **Bcrypt**: Password hashing
- **Input Validation**: Request validation

## 🛠️ Utility Scripts

### Generate JWT Secret
```bash
node src/utils/generateJwtSecret.js
node src/utils/generateJwtSecret.js --length 64 --format hex
```

### Generate Test Token
```bash
node src/utils/generateToken.js --email test@sgad.com --role arbitro
node src/utils/generateToken.js --verify "your_token_here"
```

## 🏗️ Project Structure

```
src/
├── app.js                  # Main application entry point
├── config/
│   └── database.js        # PostgreSQL configuration
├── controllers/
│   └── authcontroller.js  # Authentication controllers
├── middleware/
│   └── authMiddleware.js  # JWT verification middleware
├── routes/
│   └── authRoutes.js      # API routes
├── services/
│   └── authService.js     # Business logic
└── utils/
    ├── generateJwtSecret.js
    ├── generateToken.js
    └── validation.js
```

## 🐳 Docker Deployment

The service is configured for deployment with Docker Compose:

```yaml
auth-service:
  image: sgad-auth-service:latest
  environment:
    - POSTGRES_HOST=postgres-users
    - POSTGRES_PASSWORD=${USERS_DB_PASSWORD}
    - JWT_SECRET=${JWT_SECRET}
  ports:
    - "3001:3001"
```

## 📝 Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## 🔍 Health Check

The service exposes a health endpoint for monitoring:

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "service": "sgad-auth-service",
  "status": "healthy",
  "timestamp": "2025-10-23T10:00:00.000Z",
  "version": "1.0.0"
}
```

## 📦 Dependencies

- **express**: Web framework
- **pg**: PostgreSQL client
- **jsonwebtoken**: JWT implementation
- **bcrypt**: Password hashing
- **helmet**: Security headers
- **cors**: CORS middleware
- **express-rate-limit**: Rate limiting
- **dotenv**: Environment configuration

## 📄 License

This project is part of the SGAD platform - Arquisoft G1C

## 👥 Authors

- Arquisoft G1C Team

