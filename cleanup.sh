#!/bin/bash

# Script para limpiar archivos innecesarios para el despliegue

echo "🔍 Iniciando limpieza del proyecto..."

# Directorio raíz del proyecto
PROJECT_ROOT="$(pwd)"

# Función para verificar si un directorio existe y eliminarlo
remove_dir() {
    if [ -d "$1" ]; then
        echo "🗑️  Eliminando directorio: $1"
        rm -rf "$1"
    fi
}

# Función para verificar si un archivo existe y eliminarlo
remove_file() {
    if [ -f "$1" ]; then
        echo "🗑️  Eliminando archivo: $1"
        rm -f "$1"
    fi
}

# Limpiar frontend
echo "\n🧹 Limpiando frontend..."
cd "$PROJECT_ROOT/frontend" || exit 1
remove_dir "node_modules"
remove_dir ".next"
remove_file "npm-debug.log*"
remove_file "yarn-debug.log*"
remove_file "yarn-error.log*"

# Limpiar backend
echo "\n🧹 Limpiando backend..."
cd "$PROJECT_ROOT/backend" || exit 1
remove_dir "__pycache__"
remove_dir ".pytest_cache"
remove_dir "htmlcov"
remove_file "*.pyc"
remove_file "*.pyo"
remove_file "*.pyd"
remove_file ".coverage"

# Limpiar directorios de entorno virtual
remove_dir "env"
remove_dir "venv"
remove_dir ".venv"
remove_dir "ENV"

# Limpiar directorios de IDEs
echo "\n🧹 Limpiando archivos de IDEs..."
cd "$PROJECT_ROOT" || exit 1
remove_dir ".vscode"
remove_dir ".idea"
remove_file "*.swo"
remove_file "*.swp"
remove_file "*~"

# Limpiar archivos temporales del sistema
echo "\n🧹 Limpiando archivos temporales..."
find "$PROJECT_ROOT" -type f -name "*.tmp" -delete
find "$PROJECT_ROOT" -type f -name "*.temp" -delete
find "$PROJECT_ROOT" -type f -name "*.log" -delete
find "$PROJECT_ROOT" -type f -name ".DS_Store" -delete

# Limpiar archivos de caché de Python
echo "\n🧹 Limpiando archivos de caché de Python..."
find "$PROJECT_ROOT" -type d -name "__pycache__" -exec rm -rf {} +
find "$PROJECT_ROOT" -type f -name "*.py[co]" -delete
find "$PROJECT_ROOT" -type d -name "*.egg-info" -exec rm -rf {} +
find "$PROJECT_ROOT" -type d -name "dist" -exec rm -rf {} +
find "$PROJECT_ROOT" -type d -name "build" -exec rm -rf {} +

# Reconstruir archivos necesarios
echo "\n🔧 Reconstruyendo dependencias..."
cd "$PROJECT_ROOT/frontend" && npm install --silent
cd "$PROJECT_ROOT/backend" && python -m pip install -r requirements.txt --quiet

echo "\n✨ ¡Limpieza completada con éxito!"
echo "✅ El proyecto está listo para el despliegue."
echo "\n📌 Recuerda configurar las variables de entorno necesarias antes de desplegar."
echo "   Revisa el archivo DEPLOY.md para instrucciones detalladas."
