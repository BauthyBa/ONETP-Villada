# Guía de Despliegue en Render

Este documento explica cómo desplegar el proyecto ONETP en Render.

## Requisitos Previos

1. Una cuenta en [Render](https://render.com)
2. Git instalado en tu computadora
3. El proyecto subido a un repositorio de GitHub

## Pasos para el Despliegue

### 1. Preparar el Repositorio

1. Asegúrate de que tu proyecto esté en un repositorio de GitHub
2. Verifica que el archivo `render.yaml` esté en la raíz del proyecto
3. Asegúrate de que el archivo `.gitignore` incluya:
   ```
   venv/
   __pycache__/
   .env
   node_modules/
   build/
   ```

### 2. Configurar la Base de Datos

1. En Render, ve a "New +" y selecciona "PostgreSQL"
2. Configura la base de datos:
   - Nombre: `onetp-db-villada`
   - Usuario: `onetp_user`
   - Contraseña: (genera una segura)
3. Guarda la URL de conexión que te proporciona Render

### 3. Desplegar el Backend

1. En Render, ve a "New +" y selecciona "Web Service"
2. Conecta tu repositorio de GitHub
3. Configura el servicio:
   - Nombre: `onetp-backend-villada`
   - Entorno: `Python`
   - Rama: `main`
   - Comando de construcción: 
     ```bash
     cd backend
     python -m venv venv
     . venv/bin/activate
     pip install -r requirements.txt
     ```
   - Comando de inicio:
     ```bash
     cd backend
     . venv/bin/activate
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
4. Agrega las variables de entorno:
   - `DATABASE_URL`: (la URL de tu base de datos PostgreSQL)
   - `SECRET_KEY`: (genera una clave secreta)
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`

### 4. Desplegar el Frontend

1. En Render, ve a "New +" y selecciona "Web Service"
2. Conecta tu repositorio de GitHub
3. Configura el servicio:
   - Nombre: `onetp-frontend-villada`
   - Entorno: `Node`
   - Rama: `main`
   - Comando de construcción:
     ```bash
     cd frontend
     npm install
     npm run build
     ```
   - Comando de inicio:
     ```bash
     cd frontend && npm start
     ```
4. Agrega las variables de entorno:
   - `REACT_APP_API_URL`: `https://onetp-backend-villada.onrender.com`

### 5. Verificar el Despliegue

1. Espera a que ambos servicios estén desplegados (esto puede tomar unos minutos)
2. Verifica que el backend esté funcionando visitando:
   - `https://onetp-backend-villada.onrender.com/docs`
3. Verifica que el frontend esté funcionando visitando:
   - `https://onetp-frontend-villada.onrender.com`

## Solución de Problemas

### Backend no inicia
1. Verifica los logs en Render
2. Asegúrate de que todas las variables de entorno estén configuradas
3. Verifica que la base de datos esté accesible

### Frontend no se conecta al backend
1. Verifica que la variable `REACT_APP_API_URL` esté correctamente configurada
2. Asegúrate de que el backend esté funcionando
3. Verifica los logs del frontend en Render

### Problemas con la base de datos
1. Verifica que la URL de la base de datos sea correcta
2. Asegúrate de que la base de datos esté activa
3. Verifica los logs de la base de datos en Render

## Mantenimiento

### Actualizaciones
1. Haz push de tus cambios a GitHub
2. Render detectará automáticamente los cambios
3. Los servicios se actualizarán automáticamente

### Monitoreo
1. Usa el dashboard de Render para monitorear:
   - Uso de recursos
   - Logs
   - Estado de los servicios

### Backups
1. La base de datos se respalda automáticamente
2. Puedes configurar backups adicionales en Render

## Soporte

Si encuentras problemas:
1. Revisa los logs en Render
2. Consulta la [documentación de Render](https://render.com/docs)
3. Contacta al soporte de Render si es necesario 