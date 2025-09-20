# SGAD Auth Service

Servicio de autenticación del Sistema de Gestión de Árbitros Deportivos.

## ¿Qué hace?

* Login con email/password
* Genera tokens JWT
* Valida permisos por rol (árbitro, admin, presidente)
* Conecta a PostgreSQL para usuarios

## ¿Cómo usar?

1. Asegúrate que `sgad-infrastructure` esté corriendo
2. Instala dependencias: `npm install`
3. Copia  `.env` y ajusta credenciales
4. Ejecuta: `npm start`

## Endpoints

* `POST /auth/login` - Iniciar sesión
* `GET /auth/verify` - Verificar token
* `GET /auth/profile` - Perfil del usuario
* `GET /health` - Estado del servicio

## Testing

Prueba con Postman:

```
POST http://localhost:3001/auth/login
{
  "email": "admin@sgad.com",
  "password": "password123"
}
```

## Puerto

Corre en: `localhost:3001`
