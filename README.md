# 🌟 Sistema de Gestión de Paquetes Turísticos

Una aplicación web moderna desarrollada en **React** con **TypeScript** y **FastAPI** que permite gestionar paquetes turísticos con un sistema completo de autenticación, carrito de compras y panel administrativo.

## ✨ Características Principales

### 🔐 Autenticación y Autorización
- ✅ Sistema de autenticación JWT - **IMPLEMENTADO**
- ✅ Registro de usuarios con formularios
- ✅ Login con email y contraseña
- ✅ Roles de usuario (Cliente, Admin)
- ✅ Protección de rutas por rol

### 🎯 Funcionalidades Core
- ✅ **Gestión de Paquetes Turísticos**: CRUD completo
- ✅ **Carrito de Compras**: Agregar, quitar, modificar cantidades
- ✅ **Sistema de Ventas**: Proceso de checkout y historial
- ✅ **Panel de Administración**: Gestión completa del sistema
- ✅ **Dashboard de Usuario**: Vista personalizada para clientes

### 💼 Características del Sistema
- **Autenticación con JWT**: Login/registro seguro
- **Panel de Administración**: Gestión de paquetes, usuarios y ventas
- **Carrito Inteligente**: Persistencia y cálculos automáticos
- **Interfaz Responsive**: Diseño adaptativo con Tailwind CSS
- **Notificaciones**: Sistema de alertas para el usuario

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **React Router Dom** para navegación
- **Tailwind CSS** para estilos
- **Axios** para requests HTTP
- **JWT** para autenticación

### Backend
- **FastAPI** con Python
- **SQLAlchemy** para ORM
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **Pydantic** para validación de datos

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- Python 3.9+
- PostgreSQL
- Git

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd tour-packages
```

### 2. Configurar el Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configurar variables de entorno
Crear archivo `.env` en el directorio backend:
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost/tour_packages_db
SECRET_KEY=tu_clave_secreta_super_segura
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Configurar el Frontend
```bash
cd frontend
npm install
```

### 5. Ejecutar la aplicación
```bash
# Terminal 1 - Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2 - Frontend  
cd frontend && npm start
```

## 🏗️ Estructura del Proyecto

```
tour-packages/
├── backend/
│   ├── app/
│   │   ├── api/            # Endpoints de la API
│   │   │   ├── auth/       # Autenticación
│   │   │   ├── paquetes/   # Gestión de paquetes
│   │   │   ├── carritos/    # Gestión de carritos
│   │   │   └── ventas/      # Gestión de ventas
│   │   ├── core/           # Configuración y seguridad
│   │   ├── crud/           # Operaciones de base de datos
│   │   ├── db/             # Configuración de BD
│   │   ├── models/         # Modelos SQLAlchemy
│   │   └── schemas/        # Esquemas Pydantic
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── contexts/       # Contextos de React
│   │   ├── pages/          # Páginas principales
│   │   └── types/          # Tipos TypeScript
│   └── package.json
└── README.md
```

## 🛠️ API Endpoints

### Autenticación
- `POST /api/v1/login/access-token` - Login con credenciales
- `POST /api/v1/usuarios/` - Registro de usuarios
- `GET /api/v1/usuarios/me` - Obtener perfil del usuario

### Paquetes
- `GET /api/v1/paquetes/` - Listar paquetes
- `POST /api/v1/paquetes/` - Crear paquete (Admin)
- `PUT /api/v1/paquetes/{id}` - Actualizar paquete (Admin)
- `DELETE /api/v1/paquetes/{id}` - Eliminar paquete (Admin)

### Carrito y Ventas
- `GET /api/v1/carritos/activo` - Obtener carrito activo
- `POST /api/v1/carritos/items` - Agregar item al carrito
- `POST /api/v1/ventas/` - Realizar compra
- `GET /api/v1/ventas/mis-ventas` - Historial de compras

## 🎨 Características de la UI

- **Diseño Moderno**: Interfaz limpia con gradientes y animaciones
- **Responsive**: Adaptable a dispositivos móviles y desktop
- **Accesibilidad**: Componentes accesibles y navegación por teclado
- **Notificaciones**: Sistema de alerts para feedback inmediato
- **Temas**: Colores coherentes con la marca

## 🧪 Testing y Desarrollo

### Estructura de Testing
- Tests unitarios para componentes React
- Tests de integración para APIs
- Validación de formularios
- Tests de autenticación

### Comandos útiles
```bash
# Frontend
npm test              # Ejecutar tests
npm run build        # Build para producción
npm run lint         # Verificar código

# Backend
pytest               # Ejecutar tests
uvicorn app.main:app --reload --port 8000
```

## 🚀 Características Técnicas

- **Arquitectura moderna**: Separación clara Frontend/Backend
- **Seguridad**: JWT tokens, validación de entrada, protección CORS
- **Performance**: Lazy loading, optimización de imágenes
- **Escalabilidad**: Estructura modular y componentizada
- **Mantenibilidad**: Código TypeScript tipado y documentado

## 🎯 Funcionalidades Destacadas

### Para Usuarios (Clientes)
1. **Registro y Login**: Sistema de autenticación completo
2. **Explorar Paquetes**: Catálogo con filtros y búsqueda
3. **Carrito de Compras**: Gestión de paquetes seleccionados
4. **Historial de Compras**: Seguimiento de ventas realizadas
5. **Perfil Personal**: Actualización de datos personales

### Para Administradores
1. **Panel de Control**: Dashboard con métricas importantes
2. **Gestión de Paquetes**: CRUD completo de paquetes turísticos
3. **Gestión de Usuarios**: Administración de cuentas de usuario
4. **Reportes de Ventas**: Análisis de ventas y estadísticas
5. **Configuración del Sistema**: Parámetros generales

---

## 📄 Notas Adicionales

- La aplicación utiliza JWT para autenticación segura
- Los tokens se almacenan en localStorage del navegador
- El sistema incluye validación tanto frontend como backend
- Todas las rutas están protegidas según roles de usuario

**Desarrollado con ❤️ usando tecnologías modernas** 