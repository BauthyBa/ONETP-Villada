# Guía de Despliegue en Railway

Este documento explica cómo desplegar el proyecto ONETP en Railway.

## Requisitos Previos

1. Una cuenta en [Railway](https://railway.app)
2. Git instalado en tu computadora
3. El proyecto subido a un repositorio de GitHub

## Pasos para el Despliegue

### 1. Preparar el Repositorio

1. Asegúrate de que tu proyecto esté en un repositorio de GitHub
2. Verifica que el archivo `railway.toml` esté en la raíz del proyecto
3. Asegúrate de que el archivo `.gitignore` incluya:
   ```
   venv/
   __pycache__/
   .env
   node_modules/
   build/
   ```

### 2. Configurar Railway

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio de GitHub

### 3. Configurar la Base de Datos

1. En tu proyecto de Railway, haz clic en "New"
2. Selecciona "Database" y elige "PostgreSQL"
3. Railway configurará automáticamente la base de datos
4. Guarda la URL de conexión que te proporciona Railway

### 4. Configurar el Backend

1. En tu proyecto de Railway, haz clic en "New"
2. Selecciona "Service" y elige "GitHub Repo"
3. Selecciona tu repositorio
4. Configura las variables de entorno:
   - `DATABASE_URL`: (la URL de tu base de datos PostgreSQL)
   - `SECRET_KEY`: (genera una clave secreta)
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
5. Configura el comando de inicio:
   ```bash
   cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### 5. Configurar el Frontend

1. En tu proyecto de Railway, haz clic en "New"
2. Selecciona "Service" y elige "GitHub Repo"
3. Selecciona tu repositorio
4. Configura las variables de entorno:
   - `REACT_APP_API_URL`: (la URL de tu backend en Railway)
5. Configura el comando de inicio:
   ```bash
   cd frontend && npm start
   ```

### 6. Verificar el Despliegue

1. Espera a que ambos servicios estén desplegados
2. Verifica que el backend esté funcionando visitando la URL proporcionada por Railway
3. Verifica que el frontend esté funcionando visitando la URL proporcionada por Railway

## Solución de Problemas

### Backend no inicia
1. Verifica los logs en Railway
2. Asegúrate de que todas las variables de entorno estén configuradas
3. Verifica que la base de datos esté accesible

### Frontend no se conecta al backend
1. Verifica que la variable `REACT_APP_API_URL` esté correctamente configurada
2. Asegúrate de que el backend esté funcionando
3. Verifica los logs del frontend en Railway

### Problemas con la base de datos
1. Verifica que la URL de la base de datos sea correcta
2. Asegúrate de que la base de datos esté activa
3. Verifica los logs de la base de datos en Railway

## Mantenimiento

### Actualizaciones
1. Haz push de tus cambios a GitHub
2. Railway detectará automáticamente los cambios
3. Los servicios se actualizarán automáticamente

### Monitoreo
1. Usa el dashboard de Railway para monitorear:
   - Uso de recursos
   - Logs
   - Estado de los servicios

### Backups
1. La base de datos se respalda automáticamente
2. Puedes configurar backups adicionales en Railway

## Soporte

Si encuentras problemas:
1. Revisa los logs en Railway
2. Consulta la [documentación de Railway](https://docs.railway.app)
3. Contacta al soporte de Railway si es necesario 