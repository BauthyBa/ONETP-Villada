#!/bin/bash

# Build script for Railway deployment
echo "🔄 Installing Python dependencies..."
pip3 install --break-system-packages -r requirements.txt

echo "🔄 Collecting static files..."
python3 manage.py collectstatic --noinput

echo "✅ Build completed!" 