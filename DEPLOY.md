# 🚀 Guía de Deploy - Tour Packages

## 📋 **Prerrequisitos**

1. Cuenta en [Vercel](https://vercel.com)
2. Cuenta en [Railway](https://railway.app) o [Render](https://render.com) para el backend
3. Repositorio en GitHub con el código

## 🎯 **Estrategia de Deploy**

- **Frontend (React)**: Vercel
- **Backend (FastAPI)**: Railway o Render
- **Base de Datos**: PostgreSQL en Railway/Render

---

## 🌐 **Paso 1: Deploy del Backend (Railway)**

### 1.1 Crear cuenta en Railway
- Ve a [railway.app](https://railway.app)
- Conecta tu cuenta de GitHub

### 1.2 Deploy del Backend
1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará automáticamente que es Python

### 1.3 Configurar Variables de Entorno
En Railway, agrega estas variables:
```env
DATABASE_URL=postgresql://usuario:password@host:port/database
SECRET_KEY=tu_clave_secreta_super_segura_para_produccion
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["https://tu-app.vercel.app"]
```

### 1.4 Configurar PostgreSQL
1. En Railway, click en "Add Plugin"
2. Selecciona "PostgreSQL"
3. Se creará automáticamente la DATABASE_URL

---

## 🎨 **Paso 2: Deploy del Frontend (Vercel)**

### 2.1 Preparar el código
Tu código ya está listo con los cambios realizados.

### 2.2 Deploy en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Click en "New Project"
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.3 Configurar Variables de Entorno
En Vercel, agrega:
```env
REACT_APP_API_URL=https://tu-backend.railway.app
```

---

## 🛠️ **Paso 3: Configurar CORS en Backend**

Actualiza el archivo `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

# Permitir tu dominio de Vercel
origins = [
    "http://localhost:3000",
    "https://tu-app.vercel.app",  # Reemplaza con tu URL de Vercel
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔧 **Comandos Útiles**

### Para probar localmente con variables de entorno:
```bash
# Frontend
cd frontend
REACT_APP_API_URL=https://tu-backend.railway.app npm start

# Backend (local)
cd backend
uvicorn app.main:app --reload
```

### Para build local:
```bash
cd frontend
npm run build
```

---

## 📝 **URLs de Ejemplo**

Después del deploy tendrás:
- **Frontend**: `https://tour-packages.vercel.app`
- **Backend**: `https://tour-packages-backend.railway.app`
- **API Docs**: `https://tour-packages-backend.railway.app/docs`

---

## 🐛 **Troubleshooting**

### Error de CORS
- Verificar que la URL de Vercel esté en la lista de origins del backend
- Verificar que REACT_APP_API_URL apunte al backend correcto

### Error 404 en rutas
- Verificar que `vercel.json` esté configurado correctamente
- Verificar que el build se complete sin errores

### Error de autenticación
- Verificar que SECRET_KEY sea el mismo en desarrollo y producción
- Verificar que los endpoints del backend estén funcionando

---

## 🎉 **¡Listo para producción!**

Una vez configurado todo:
1. Cada push a main disparará un nuevo deploy automático
2. Vercel y Railway manejarán escalamiento automático
3. Tendrás URLs estables para tu aplicación

### 🔗 **Enlaces útiles:**
- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Railway](https://docs.railway.app)
- [FastAPI + Railway Tutorial](https://railway.app/templates/fastapi) 