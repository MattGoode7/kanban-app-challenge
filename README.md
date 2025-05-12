# Kanban App

Este proyecto es una aplicación Kanban simple, que permite gestionar tareas de manera visual mediante tableros, columnas y tarjetas. Permite crear, editar, mover y eliminar tareas de forma intuitiva, utilizando drag & drop. El backend está implementado en NestJS y se conecta a una base de datos MongoDB, mientras que el frontend utiliza React y TailwindCSS.

## Requisitos previos

- Node.js (v16 o superior recomendado)
- Docker y Docker Compose
- npm

## Pasos para levantar el proyecto

### 1. Configurar variables de entorno

Crear un archivo `.env` en la carpeta del backend (`/backend`) con las variables necesarias para la conexión a la base de datos MongoDB. Un ejemplo de archivo `.env` podría ser:

```env
MONGODB_URI=mongodb://localhost:27017/kanban
PORT=5000
```

Asegurarse de que la URI de MongoDB coincida con la configuración del contenedor de Docker.

### 2. Levantar la base de datos con Docker Compose

En la raíz del proyecto (donde está el archivo `docker-compose.yml`), ejecutamos:

```bash
docker compose up -d
```

Esto levantará un contenedor de MongoDB accesible para el backend.

### 3. Instalar dependencias

Instala las dependencias tanto para el backend como para el frontend:

```bash
# En la carpeta backend
cd backend
npm install

# En la carpeta frontend
cd ../frontend
npm install
```

### 4. Iniciar el backend

Desde la carpeta `backend`, ejecuta:

```bash
npm run start:dev
```

Esto iniciará el servidor en modo desarrollo.

### 5. Iniciar el frontend

Desde la carpeta `frontend`, ejecuta:

```bash
npm run dev
```

Esto levantará la aplicación React, en `http://localhost:5173` (o el puerto configurado).

---

## Notas adicionales

- Asegurarse de que el backend y el frontend apunten a las URLs correctas.
- Si existen problemas de conexión con MongoDB, revisar los puertos y la red de Docker.

---
