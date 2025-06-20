# Deployment en Railway

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