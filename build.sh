#!/bin/bash

# Build script for Railway deployment
echo "🔄 Installing Python dependencies..."
pip install -r requirements.txt

echo "🔄 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Build completed!" 