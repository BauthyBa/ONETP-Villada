#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_color() {
    printf "${1}${2}${NC}\n"
}

# Banner del proyecto
print_banner() {
    echo ""
    print_color $CYAN "╔══════════════════════════════════════════════════════════════╗"
    print_color $CYAN "║                                                              ║"
    print_color $CYAN "║        🏞️  SISTEMA DE PAQUETES TURÍSTICOS - ONIET 2025      ║"
    print_color $CYAN "║                                                              ║"
    print_color $CYAN "║  🚀 Sistema completo con JWT, Carrito y Panel Admin       ║"
    print_color $CYAN "║                                                              ║"
    print_color $CYAN "╚══════════════════════════════════════════════════════════════╝"
    echo ""
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para verificar dependencias
check_dependencies() {
    print_color $BLUE "🔍 Verificando dependencias del sistema..."
    
    local missing_deps=()
    
    if ! command_exists docker; then
        missing_deps+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("docker-compose")
    fi
    
    if ! command_exists python3; then
        missing_deps+=("python3")
    fi
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_color $RED "❌ Faltan las siguientes dependencias:"
        for dep in "${missing_deps[@]}"; do
            print_color $RED "   - $dep"
        done
        print_color $YELLOW "📋 Por favor instala las dependencias faltantes y vuelve a ejecutar el script."
        exit 1
    fi
    
    print_color $GREEN "✅ Todas las dependencias están instaladas"
}

# Función para iniciar PostgreSQL
start_database() {
    print_color $BLUE "🐘 Iniciando base de datos PostgreSQL..."
    
    if docker-compose up -d postgres; then
        print_color $GREEN "✅ PostgreSQL iniciado correctamente"
        
        # Esperar a que la base de datos esté lista
        print_color $YELLOW "⏳ Esperando a que PostgreSQL esté listo..."
        sleep 10
    else
        print_color $RED "❌ Error al iniciar PostgreSQL"
        exit 1
    fi
}

# Función para configurar el backend
setup_backend() {
    print_color $BLUE "🔧 Configurando backend (FastAPI)..."
    
    cd backend || exit 1
    
    # Crear entorno virtual si no existe
    if [ ! -d "venv" ]; then
        print_color $YELLOW "📦 Creando entorno virtual de Python..."
        python3 -m venv venv
    fi
    
    # Activar entorno virtual
    source venv/bin/activate
    
    # Instalar dependencias
    print_color $YELLOW "📦 Instalando dependencias de Python..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    print_color $GREEN "✅ Backend configurado correctamente"
    cd ..
}

# Función para configurar el frontend
setup_frontend() {
    print_color $BLUE "🔧 Configurando frontend (React + TypeScript)..."
    
    cd frontend || exit 1
    
    # Instalar dependencias
    print_color $YELLOW "📦 Instalando dependencias de Node.js..."
    npm install
    
    print_color $GREEN "✅ Frontend configurado correctamente"
    cd ..
}

# Función para iniciar el backend
start_backend() {
    print_color $BLUE "🚀 Iniciando servidor backend..."
    
    cd backend || {
        print_color $RED "❌ Error: No se pudo acceder al directorio backend"
        exit 1
    }
    
    # Verificar si el entorno virtual existe
    if [ ! -d "venv" ]; then
        print_color $YELLOW "📦 Creando entorno virtual de Python..."
        python3 -m venv venv || {
            print_color $RED "❌ Error al crear el entorno virtual"
            exit 1
        }
    fi
    
    # Activar entorno virtual
    source venv/bin/activate || {
        print_color $RED "❌ Error al activar el entorno virtual"
        exit 1
    }
    
    # Verificar si las dependencias están instaladas
    if [ ! -f ".deps_installed" ]; then
        print_color $YELLOW "📦 Instalando dependencias de Python..."
        pip install --upgrade pip
        pip install -r requirements.txt || {
            print_color $RED "❌ Error al instalar las dependencias"
            exit 1
        }
        touch .deps_installed
    fi
    
    # Inicializar base de datos
    print_color $YELLOW "🗄️ Inicializando base de datos..."
    python -c "from app.db.init_db import init_db; init_db()" || {
        print_color $RED "❌ Error al inicializar la base de datos"
        exit 1
    }
    
    # Iniciar servidor
    print_color $YELLOW "🌐 Iniciando servidor FastAPI..."
    python start.py &
    BACKEND_PID=$!
    
    # Esperar a que el servidor esté listo
    print_color $YELLOW "⏳ Esperando a que el servidor esté listo..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/health > /dev/null; then
            print_color $GREEN "✅ Backend iniciado correctamente en http://localhost:8000"
            print_color $CYAN "📚 Documentación API: http://localhost:8000/docs"
            cd ..
            return 0
        fi
        sleep 1
    done
    
    print_color $RED "❌ Error: El servidor backend no respondió después de 30 segundos"
    kill $BACKEND_PID 2>/dev/null
    cd ..
    exit 1
}

# Función para iniciar el frontend
start_frontend() {
    print_color $BLUE "🚀 Iniciando servidor frontend..."
    
    cd frontend || exit 1
    
    print_color $YELLOW "🌐 Iniciando servidor React..."
    npm start &
    FRONTEND_PID=$!
    
    print_color $GREEN "✅ Frontend iniciado en http://localhost:3000"
    
    cd ..
}

# Función para mostrar información del sistema
show_system_info() {
    echo ""
    print_color $PURPLE "╔══════════════════════════════════════════════════════════════╗"
    print_color $PURPLE "║                    🎉 SISTEMA INICIADO                       ║"
    print_color $PURPLE "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    print_color $GREEN "🌐 Accesos del Sistema:"
    print_color $CYAN "   • Frontend:        http://localhost:3000"
    print_color $CYAN "   • Backend API:     http://localhost:8000"
    print_color $CYAN "   • Documentación:   http://localhost:8000/docs"
    print_color $CYAN "   • Base de Datos:   PostgreSQL en puerto 5432"
    echo ""
    print_color $GREEN "👤 Usuarios de Prueba:"
    print_color $YELLOW "   • Admin:    admin@tourpackages.com / admin123"
    print_color $YELLOW "   • Cliente:  cliente@test.com / cliente123"
    echo ""
    print_color $GREEN "🔧 Configuración de Autenticación:"
    print_color $YELLOW "   • Sistema:  Autenticación JWT nativa"
    print_color $YELLOW "   • Login:    http://localhost:3000/login"
    print_color $YELLOW "   • Registro: http://localhost:3000/register"
    echo ""
    print_color $GREEN "✨ Funcionalidades Disponibles:"
    print_color $CYAN "   • 🏞️  Catálogo de paquetes turísticos"
    print_color $CYAN "   • 🛒 Carrito de compras avanzado"
    print_color $CYAN "   • 👨‍💼 Panel de administración completo"
    print_color $CYAN "   • 🔔 Sistema de notificaciones"
    print_color $CYAN "   • 📊 Dashboards informativos"
    print_color $CYAN "   • 🔍 Filtros y búsqueda avanzada"
    print_color $CYAN "   • 🔐 Autenticación con JWT"
    echo ""
    print_color $BLUE "📋 Para detener el sistema, presiona Ctrl+C"
    echo ""
}

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    print_color $YELLOW "🛑 Deteniendo servicios..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        print_color $GREEN "✅ Backend detenido"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        print_color $GREEN "✅ Frontend detenido"
    fi
    
    print_color $CYAN "👋 ¡Gracias por usar el Sistema de Paquetes Turísticos!"
    exit 0
}

# Configurar trap para limpiar al salir
trap cleanup SIGINT SIGTERM

# Función principal
main() {
    print_banner
    
    # Verificar dependencias
    check_dependencies
    
    # Iniciar base de datos
    start_database
    
    # Configurar backend
    setup_backend
    
    # Configurar frontend
    setup_frontend
    
    # Iniciar servicios
    start_backend
    sleep 5  # Esperar a que el backend esté listo
    
    start_frontend
    sleep 5  # Esperar a que el frontend esté listo
    
    # Mostrar información del sistema
    show_system_info
    
    # Mantener el script corriendo
    print_color $BLUE "🔄 Sistema ejecutándose... (Ctrl+C para detener)"
    while true; do
        sleep 1
    done
}

# Verificar si el script se está ejecutando directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 