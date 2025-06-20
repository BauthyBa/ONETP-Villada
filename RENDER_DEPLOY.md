# Render Deployment Guide - ONIET

## 🚀 Render Configuration

### 1. Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub
3. Conecta tu repositorio

### 2. Crear nuevo Web Service
1. Click en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio GitHub: `BauthyBa/ONETP-Villada`
4. Configura el servicio:

**Configuración básica:**
- **Name:** `oniet-backend`
- **Environment:** `Python 3`
- **Region:** `Oregon (US West)`
- **Branch:** `main`
- **Root Directory:** (dejar vacío)
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120`

### 3. Configurar Variables de Entorno
En la sección "Environment Variables":

```
PYTHON_VERSION=3.12.0
SECRET_KEY=tu_secret_key_super_seguro_aqui_123456789
DEBUG=False
ALLOWED_HOSTS=oniet-backend.onrender.com,localhost,127.0.0.1
DATABASE_URL=postgresql://... (Render lo configura automáticamente)
```

### 4. Agregar Base de Datos PostgreSQL
1. Click en "New +"
2. Selecciona "PostgreSQL"
3. Configura:
   - **Name:** `oniet-database`
   - **Database:** `oniet`
   - **User:** `oniet_user`
   - **Plan:** `Free`

### 5. Conectar Base de Datos al Web Service
1. Ve a tu Web Service
2. Click en "Environment"
3. Agrega la variable:
   - **Key:** `DATABASE_URL`
   - **Value:** (copiar desde la base de datos PostgreSQL)

## 🌐 URLs Importantes

### Backend (Render)
- **API Base:** `https://oniet-backend.onrender.com/api/v1/`
- **Admin Panel:** `https://oniet-backend.onrender.com/admin/`
- **Healthcheck:** `https://oniet-backend.onrender.com/`

### Frontend (Vercel)
- **Frontend URL:** `https://tu-frontend-vercel.vercel.app`

## 🔗 Configuración del Frontend

Actualiza tu archivo `frontend/.env.production`:

```
REACT_APP_API_URL=https://oniet-backend.onrender.com
```

## 👤 Usuario Admin
- **Email:** admin@tour.com
- **Password:** admin1234

## 📝 Pasos de Configuración

1. **Crear Web Service en Render**
2. **Agregar PostgreSQL Database**
3. **Configurar Variables de Entorno**
4. **Conectar Database al Web Service**
5. **Actualizar Frontend API URL**
6. **Deploy y Test**

## 🚀 Verificación

1. Visita: `https://oniet-backend.onrender.com/`
2. Deberías ver: `{"status": "ok", "message": "ONIET API is running"}`
3. Admin: `https://oniet-backend.onrender.com/admin/`
4. API: `https://oniet-backend.onrender.com/api/v1/`

## 🔧 Comandos Útiles

### Ver logs
En Render Dashboard → Logs

### Ejecutar comandos
En Render Dashboard → Shell

### Crear superusuario
```bash
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@tour.com').exists():
    User.objects.create_superuser(
        email='admin@tour.com',
        password='admin1234',
        nombre='Admin',
        apellido='User',
        tipo_usuario='admin'
    )
    print('Superuser created successfully')
else:
    print('Superuser already exists')
"
```

## 🛠️ Troubleshooting

### Error de migraciones
En Render Shell:
```bash
python manage.py migrate
```

### Error de archivos estáticos
En Render Shell:
```bash
python manage.py collectstatic --noinput
```

### Error de base de datos
1. Verifica que `DATABASE_URL` esté configurada
2. Verifica que la base de datos esté activa
3. Ejecuta migraciones

## ⚡ Ventajas de Render

- ✅ **Más estable** que Railway
- ✅ **Mejor soporte** para Python/Django
- ✅ **Base de datos PostgreSQL** incluida
- ✅ **SSL automático**
- ✅ **Deploy automático** desde GitHub
- ✅ **Logs detallados**
- ✅ **Plan gratuito** generoso

## 🔄 Migración desde Railway

1. **Backup de datos** (si es necesario)
2. **Configurar Render** siguiendo esta guía
3. **Actualizar frontend** con nueva URL
4. **Testear** todas las funcionalidades
5. **Desconectar Railway** (opcional) 