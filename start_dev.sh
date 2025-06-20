#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
PROJECT_DIR="/home/bautista/ONIET"
VENV_DIR="${PROJECT_DIR}/venv_django"  # Usamos el venv de Django

# Función para mostrar mensajes de error
error() {
  echo -e "${RED}Error: $1${NC}" >&2
  exit 1
}

# Función para limpiar y salir
cleanup() {
  echo -e "\n${YELLOW}Deteniendo servidores...${NC}"
  pkill -f "python manage.py runserver" || true
  pkill -f "react-scripts start" || true
  exit 0
}

# Verificar si el directorio del proyecto existe
if [ ! -d "$PROJECT_DIR" ]; then
  error "El directorio del proyecto no existe: $PROJECT_DIR"
fi

# Verificar si el entorno virtual existe
if [ ! -d "$VENV_DIR" ]; then
  echo -e "${YELLOW}Creando entorno virtual...${NC}"
  python3 -m venv "$VENV_DIR" || error "No se pudo crear el entorno virtual"
  
  # Activar el entorno virtual
  source "${VENV_DIR}/bin/activate"
  
  # Actualizar pip
  echo -e "${YELLOW}Actualizando pip...${NC}"
  pip install --upgrade pip || error "Error al actualizar pip"
  
  # Instalar dependencias
  echo -e "${YELLOW}Instalando dependencias...${NC}"
  pip install -r "${PROJECT_DIR}/requirements-combined.txt" || error "Error al instalar dependencias"
  
  echo -e "${GREEN}Entorno virtual creado exitosamente${NC}"
else
  # Activar el entorno virtual existente
  source "${VENV_DIR}/bin/activate"
fi

# Capturar la señal de interrupción (Ctrl+C)
trap cleanup SIGINT

echo -e "\n${GREEN}Iniciando servidor de desarrollo...${NC}"

# Iniciar el backend en segundo plano
echo -e "${YELLOW}Iniciando backend Django...${NC}"
cd "$PROJECT_DIR"
python manage.py runserver > backend.log 2>&1 &
BACKEND_PID=$!

echo -e "${YELLOW}Iniciando frontend React...${NC}"
# Esperar un momento antes de iniciar el frontend
sleep 3

# Iniciar el frontend en segundo plano
cd "${PROJECT_DIR}/frontend"
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Mostrar información útil
echo -e "\n${GREEN}✅ Backend Django ejecutándose en: http://localhost:8000${NC}"
echo -e "${GREEN}✅ Frontend React ejecutándose en: http://localhost:3000${NC}"

echo -e "\n${BLUE}📌 Rutas disponibles en el backend:${NC}"
echo -e "${BLUE}   • Panel de administración: ${GREEN}http://localhost:8000/admin/${NC}"
echo -e "${BLUE}   • API REST: ${GREEN}http://localhost:8000/api/v1/${NC}"
echo -e "${BLUE}   • Autenticación: ${GREEN}http://localhost:8000/api/v1/auth/${NC}"

echo -e "\n${YELLOW}📝 Logs del backend: ${PROJECT_DIR}/backend.log"
echo -e "📝 Logs del frontend: ${PROJECT_DIR}/frontend.log"

echo -e "${YELLOW}🛑 Presiona Ctrl+C para detener los servidores${NC}\n"

# Mantener el script en ejecución
wait $BACKEND_PID $FRONTEND_PID
