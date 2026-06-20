# Task Manager - CloudTech Solutions

Aplicacion web para gestion de tareas desplegada en Google Cloud Run.

## Stack

- **Backend:** Node.js + Express
- **Persistencia:** JSON file
- **Frontend:** HTML/CSS/JS vanilla
- **Despliegue:** Google Cloud Run (Docker)

## Funcionalidades

- Crear tareas con titulo, descripcion y fecha limite
- Eliminar tareas
- Marcar tareas como pendientes / completadas
- Filtrar por estado
- Persistencia en archivo JSON

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
   - **Port:** 8080
   - **Startup type:** Dockerfile
7. Click "Create"

### Opcion 2: CLI

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/task-manager

gcloud run deploy task-manager \
  --image gcr.io/YOUR_PROJECT_ID/task-manager \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Estructura

```
├── src/
│   ├── app.js            # Server Express
│   ├── routes/tasks.js   # CRUD tareas
│   └── data/tasks.json   # Persistencia JSON
├── public/
│   ├── index.html        # Interfaz principal
│   ├── css/style.css
│   └── js/app.js
├── Dockerfile
└── README.md
```

## API Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/tasks | Listar tareas |
| POST | /api/tasks | Crear tarea |
| DELETE | /api/tasks/:id | Eliminar tarea |

## Datos Seed

El archivo `tasks.json` viene con 5 tareas de ejemplo para probar la aplicacion.

## Autores

CloudTech Solutions - Lab Cloud
