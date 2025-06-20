#!/bin/bash

# Railway startup script for Django
set -e

echo "🚀 Starting ONIET Django application..."

# Check if we're in production
if [ -n "$DATABASE_URL" ]; then
    echo "📊 Production environment detected"
    echo "🔧 Running database migrations..."
    python3 manage.py migrate --noinput
    
    echo "📦 Collecting static files..."
    python3 manage.py collectstatic --noinput
    
    echo "🔍 Running deployment checks..."
    python3 manage.py check --deploy
    
    echo "⏳ Waiting 3 seconds before starting server..."
    sleep 3
    
    echo "🌐 Starting Gunicorn server..."
    exec gunicorn config.wsgi:application \
        --bind 0.0.0.0:$PORT \
        --workers 2 \
        --timeout 120 \
        --preload \
        --access-logfile - \
        --error-logfile - \
        --log-level info
else
    echo "🔧 Development environment detected"
    echo "🔧 Running database migrations..."
    python3 manage.py migrate
    
    echo "🌐 Starting development server..."
    exec python3 manage.py runserver 0.0.0.0:$PORT
fi 