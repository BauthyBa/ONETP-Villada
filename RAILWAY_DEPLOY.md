# Railway Deployment Guide - ONIET

## ✅ Deployment URL
**Production URL:** `https://onetp-villada-production.up.railway.app`

## 🔧 Railway Configuration

### Variables de Entorno Requeridas
Ve a tu proyecto en Railway → Variables → Add Variable

```
SECRET_KEY=tu_secret_key_super_seguro_aqui
DEBUG=False
ALLOWED_HOSTS=onetp-villada-production.up.railway.app,localhost,127.0.0.1
DATABASE_URL=postgresql://... (Railway lo configura automáticamente)
```

### Configuración de CORS
En Railway, agrega estas variables para permitir el frontend:

```
CORS_ALLOWED_ORIGINS=https://tu-frontend-vercel.vercel.app,http://localhost:3000
```

## 🌐 URLs Importantes

### Backend (Railway)
- **API Base:** `https://onetp-villada-production.up.railway.app/api/v1/`
- **Admin Panel:** `https://onetp-villada-production.up.railway.app/admin/`
- **Healthcheck:** `https://onetp-villada-production.up.railway.app/`

### Frontend (Vercel)
- **Frontend URL:** `https://tu-frontend-vercel.vercel.app` (configurar en Vercel)

## 🔗 Configuración del Frontend

En tu proyecto React, actualiza la configuración de la API:

```javascript
// En tu archivo de configuración de API
const API_BASE_URL = 'https://onetp-villada-production.up.railway.app/api/v1';
```

## 👤 Usuario Admin
- **Email:** admin@tour.com
- **Password:** admin1234

## 📝 Pasos de Configuración

1. **Railway Variables:** Configura las variables de entorno
2. **Frontend API:** Actualiza la URL base en tu React app
3. **CORS:** Configura los orígenes permitidos
4. **Test:** Verifica que todo funcione

## 🚀 Verificación

1. Visita: `https://onetp-villada-production.up.railway.app/`
2. Deberías ver: `{"status": "ok", "message": "ONIET API is running"}`
3. Admin: `https://onetp-villada-production.up.railway.app/admin/`
4. API: `https://onetp-villada-production.up.railway.app/api/v1/`

## Pasos para deployar en Railway

### 1. Preparar el repositorio
Asegúrate de que todos los cambios estén committeados y pusheados a GitHub:

```bash
git add .
git commit -m "Configuración para Railway deployment"
git push origin main
```

### 2. Crear proyecto en Railway

1. Ve a [Railway](https://railway.app/)
2. Haz login con tu cuenta de GitHub
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Elige tu repositorio ONIET

### 3. Agregar base de datos PostgreSQL

1. En el dashboard del proyecto, click en "Create"
2. Selecciona "Database"
3. Elige "Add PostgreSQL"
4. Espera a que se despliegue

### 4. Configurar variables de entorno

En tu servicio de aplicación, ve a la pestaña "Variables" y agrega:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
DEBUG=False
ALLOWED_HOSTS=*.railway.app
SECRET_KEY=tu-secret-key-aqui
```

### 5. Configurar dominio público

1. Ve a la pestaña "Settings" de tu servicio
2. Scroll hasta "Networking"
3. Click en "Generate Domain"

### 6. Ejecutar setup inicial

Una vez deployado, ejecuta el script de configuración:

```bash
railway run python setup_railway.py
```

O desde el dashboard de Railway:
1. Ve a la pestaña "Deploy"
2. Click en "Custom Start Command"
3. Ejecuta: `python setup_railway.py`

### 7. Credenciales de acceso

Después del setup, podrás acceder con:
- **Email:** admin@tour.com
- **Contraseña:** admin1234

## URLs importantes

- **Frontend:** Tu dominio de Railway
- **Admin Django:** `tu-dominio.railway.app/admin/`
- **API:** `tu-dominio.railway.app/api/v1/`

## Comandos útiles

```bash
# Ver logs
railway logs

# Ejecutar comandos
railway run python manage.py shell

# Conectar a la base de datos
railway connect postgres
```

## Troubleshooting

### Error de migraciones
```bash
railway run python manage.py migrate
```

### Recrear usuario admin
```bash
railway run python setup_railway.py
```

### Recolectar archivos estáticos
```bash
railway run python manage.py collectstatic --noinput
``` 