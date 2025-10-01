# SGAD – Auth Service

Servicio de **autenticación y autorización** del **SGAD (Sistema de Gestión de Árbitros y Designaciones)**.  
Este servicio se encarga de gestionar el login, generación de tokens JWT, validación de roles y conexión a la base de datos de usuarios.

---

## 📖 ¿Qué hace?

- Login con email/password.  
- Genera tokens **JWT** para autenticación segura.  
- Valida permisos por rol (**árbitro, administrador, presidente**).  
- Conecta a **PostgreSQL** para gestionar usuarios.  

---

## 📂 Estructura del Proyecto

```
sgad-auth-service/
│── package.json          # Dependencias del proyecto
│── Dockerfile            # Imagen de Docker
│── .env.example          # Variables de entorno de ejemplo
│
└── src/
    ├── app.js            # Punto de entrada
    ├── routes/           # Endpoints de autenticación
    ├── middleware/       # Validación de tokens y roles
    ├── controllers/      # Lógica de login y perfiles
    └── config/           # Configuración de PostgreSQL y JWT
```

---

## ⚙️ Requisitos

- **Node.js 18+**  
- **npm** como gestor de paquetes  
- **PostgreSQL** (contenedor `relational-db` de `sgad-infrastructure`)  

Instalar dependencias:

```bash
npm install
```

---

## ▶️ ¿Cómo usar?

1. Asegúrate de que `sgad-infrastructure` (PostgreSQL) esté corriendo.  
2. Copia `.env.example` a `.env` y ajusta credenciales (usuario, password, secret JWT).  
3. Instala dependencias:  
   ```bash
   npm install
   ```  
4. Ejecuta el servicio:  
   ```bash
   npm start
   ```

El servicio quedará disponible en:  
```
http://localhost:3001
```

---

## 🔗 Endpoints

- `POST /auth/login` → Iniciar sesión.  
- `GET /auth/verify` → Verificar token JWT.  
- `GET /auth/profile` → Obtener perfil del usuario autenticado.  
- `GET /health` → Estado del servicio.  

---

## 🧪 Testing

Ejemplo con **Postman** o `curl`:

```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@sgad.com",
  "password": "password123"
}
```

Respuesta esperada (ejemplo):

```json
{
  "token": "jwt_generado",
  "role": "admin"
}
```

---

## 🐳 Despliegue con Docker

1. Crear la imagen:
   ```bash
   docker build -t sgad-auth-service .
   ```

2. Ejecutar el contenedor:
   ```bash
   docker run -d -p 3001:3001 --env-file .env sgad-auth-service
   ```

---

## 📡 Integración con SGAD

- Es consumido directamente por el **API Gateway** (`sgad-api-gateway`).  
- Provee tokens JWT que son usados por el **Frontend** y otros microservicios.  
- Se despliega junto con los demás servicios en el **docker-compose de `sgad-main`**.  

---

