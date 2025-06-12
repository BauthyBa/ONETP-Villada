# 🚀 Deploy en Render - Tour Packages ONIET 2025

## 📋 **Pasos para Deploy del Backend en Render**

### **Paso 1: Crear cuenta en Render**
1. Ve a [render.com](https://render.com)
2. Sign up con GitHub
3. Conecta tu cuenta de GitHub

### **Paso 2: Crear la Base de Datos PostgreSQL**
1. En Render Dashboard, click **"New +"**
2. Selecciona **"PostgreSQL"**
3. Configuración:
   - **Name**: `tour-packages-db`
   - **Database**: `tour_packages_db`
   - **User**: `tourpackages`
   - **Plan**: Free
4. Click **"Create Database"**
5. **Guarda la URL de conexión** (la necesitarás)

### **Paso 3: Deploy del Backend (Web Service)**
1. Click **"New +"** → **"Web Service"**
2. **Connect Repository**: Selecciona `BauthyBa/ONETP-Villada`
3. Configuración del servicio:
   - **Name**: `tour-packages-api`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### **Paso 4: Variables de Entorno**
En la sección **Environment Variables** agrega:

```env
DATABASE_URL=postgresql://tourpackages:password@host:5432/tour_packages_db
SECRET_KEY=tu_clave_secreta_super_segura_para_produccion_oniet_2025
ACCESS_TOKEN_EXPIRE_MINUTES=30
PYTHON_VERSION=3.10.14
```

**⚠️ Importante**: Reemplaza `DATABASE_URL` con la URL real de tu base de datos PostgreSQL de Render.

### **Paso 5: Deploy**
1. Click **"Create Web Service"**
2. Render automáticamente:
   - Clonará tu repositorio
   - Instalará las dependencias
   - Iniciará tu API
3. El proceso toma **3-5 minutos**

---

## 🌐 **URLs que obtienes**

- **API**: `https://tour-packages-api.onrender.com`
- **Docs**: `https://tour-packages-api.onrender.com/docs`
- **Health**: `https://tour-packages-api.onrender.com/health`

---

## 🎨 **Conectar Frontend (Vercel) con Backend (Render)**

### En Vercel, actualiza la variable de entorno:
```env
REACT_APP_API_URL=https://tour-packages-api.onrender.com
```

### En Render, actualiza CORS en `backend/app/main.py`:
```python
origins = [
    "http://localhost:3000",
    "https://your-app.vercel.app",  # Tu URL de Vercel
    "https://tour-packages-api.onrender.com"
]
```

---

## 🔧 **Configuración de Auto-Deploy**

Render automáticamente re-deployará cuando hagas push a la rama `main`:

1. Haces cambios en tu código
2. `git push origin main`
3. Render detecta el cambio
4. Re-construye y deploya automáticamente

---

## 🐛 **Troubleshooting**

### **Error: "Application failed to start"**
- Verifica que `requirements.txt` esté en `/backend`
- Verifica que el Start Command sea correcto
- Revisa los logs en Render

### **Error de Base de Datos**
- Verifica que `DATABASE_URL` esté correcta
- Asegúrate de que la base de datos esté en "Available" status

### **Error de CORS**
- Agrega tu dominio de Vercel a la lista de origins
- Verifica que no haya trailing slashes

---

## ✅ **Ventajas de Render**

- ✅ **Free tier generoso**: 750 horas/mes gratis
- ✅ **Auto-deploy**: Deploy automático en cada push
- ✅ **PostgreSQL gratis**: Base de datos incluida
- ✅ **SSL automático**: HTTPS configurado automáticamente
- ✅ **Logs en tiempo real**: Debug fácil
- ✅ **Fácil de usar**: Interfaz muy intuitiva

---

## 🎯 **Arquitectura Final**

```
Frontend (Vercel) → Backend (Render) → PostgreSQL (Render)
     ↓                    ↓                 ↓
https://tu-app       https://api          Database
.vercel.app         .onrender.com        (Managed)
```

¡Tu aplicación estará completamente en la nube! 🌥️ 