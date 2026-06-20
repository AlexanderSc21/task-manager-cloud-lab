# Task Manager - CloudTech Solutions

Aplicacion web para gestion de tareas desplegada en Google Cloud Run.

## Stack

- **Backend:** Node.js + Express
- **Persistencia:** JSON file
- **Frontend:** HTML/CSS/JS vanilla
- **Despliegue:** Google Cloud Run (Docker)

## Funcionalidades

- Registro y login de usuarios
- Crear, editar, eliminar tareas
- Cambiar estado (pendiente / completada)
- Fecha limite por tarea
- Filtrar por estado

## Ejecutar local

```bash
npm install
npm start
```

Abrir http://localhost:3000

## Desplegar en Google Cloud Run

### Opcion 1: GitHub Integration (Recomendado)

1. Subir codigo a GitHub
2. Ir a [Cloud Run Console](https://console.cloud.google.com/run)
3. Click "Create Service"
4. Seleccionar "Continuously deploy from a repository"
5. Conectar tu repositorio de GitHub
6. Configurar:
   - **Region:** us-central1
   - **CPU:** 1
   - **Memory:** 512 MiB
   - **Port:** 8080
   - **Startup type:** Dockerfile
7. Click "Create"

### Opcion 2: CLI

```bash
# Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/task-manager

# Deploy
gcloud run deploy task-manager \
  --image gcr.io/YOUR_PROJECT_ID/task-manager \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Estructura

```
├── src/
│   ├── app.js              # Server Express
│   ├── middleware/auth.js   # Auth middleware
│   ├── routes/auth.js      # Login/Register/Logout
│   ├── routes/tasks.js     # CRUD tareas
│   └── data/               # JSON storage
├── public/                 # Frontend
├── Dockerfile              # Cloud Run config
└── README.md
```

## API Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/auth/register | Registro |
| POST | /api/auth/login | Login |
| GET | /api/auth/logout | Logout |
| GET | /api/tasks | Listar tareas |
| POST | /api/tasks | Crear tarea |
| PUT | /api/tasks/:id | Actualizar tarea |
| DELETE | /api/tasks/:id | Eliminar tarea |

## Autores

CloudTech Solutions - Lab Cloud
