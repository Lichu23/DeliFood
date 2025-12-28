# Delivery Platform API

Backend de la plataforma de gestión de delivery para emprendedores y negocios pequeños.

## Stack Tecnológico

- **Express** - Framework web
- **Prisma** - ORM con TypeScript
- **PostgreSQL** - Base de datos
- **Zod** - Validación de datos
- **JWT** - Autenticación
- **Socket.io** - Comunicación en tiempo real

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (opcional para MVP)

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:

```bash
cd apps/api
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
# Editar .env con tus valores
```

4. Generar cliente de Prisma:

```bash
npm run db:generate
```

5. Crear las tablas en la base de datos:

```bash
npm run db:push
# O para producción con migraciones:
npm run db:migrate
```

6. Iniciar el servidor:

```bash
npm run dev
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con hot reload
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en producción
- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:push` - Sincroniza el schema con la base de datos
- `npm run db:migrate` - Ejecuta migraciones
- `npm run db:studio` - Abre Prisma Studio para ver/editar datos
- `npm run typecheck` - Verifica tipos de TypeScript

## Estructura del Proyecto

```
src/
├── config/          # Configuración y variables de entorno
├── lib/             # Instancias de librerías (Prisma, Redis)
├── middlewares/     # Middlewares de Express
├── modules/         # Módulos de la aplicación
│   ├── auth/        # Autenticación y usuarios
│   ├── stores/      # Gestión de tiendas
│   ├── invitations/ # Sistema de invitaciones
│   ├── products/    # Catálogo (Fase 2)
│   └── orders/      # Pedidos (Fase 4)
├── utils/           # Utilidades compartidas
├── types/           # Tipos de TypeScript
├── app.ts           # Configuración de Express
└── index.ts         # Entry point
```

## Endpoints de la Fase 1

### Autenticación

- `POST /api/auth/register` - Registrar usuario con tienda
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `PATCH /api/auth/profile` - Actualizar perfil
- `POST /api/auth/change-password` - Cambiar contraseña

### Tiendas

- `GET /api/stores/:slug/public` - Info pública de tienda
- `GET /api/stores/:storeId` - Obtener tienda (privado)
- `PATCH /api/stores/:storeId` - Actualizar tienda
- `PATCH /api/stores/:storeId/settings` - Actualizar configuración
- `GET /api/stores/:storeId/members` - Listar miembros
- `DELETE /api/stores/:storeId/members/:memberId` - Eliminar miembro
- `GET /api/stores/:storeId/delivery-members` - Listar repartidores

### Invitaciones

- `POST /api/stores/:storeId/invitations` - Crear invitación
- `GET /api/stores/:storeId/invitations` - Listar invitaciones
- `GET /api/invitations/:token` - Ver invitación por token
- `POST /api/invitations/accept` - Aceptar (usuario nuevo)
- `POST /api/invitations/accept-existing` - Aceptar (usuario existente)
- `DELETE /api/stores/:storeId/invitations/:id` - Cancelar invitación
- `POST /api/stores/:storeId/invitations/:id/resend` - Reenviar invitación

## Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.
