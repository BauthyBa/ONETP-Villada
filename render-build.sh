#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run database migrations
python manage.py migrate

# Create superuser if it doesn't exist
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@tour.com').exists():
    User.objects.create_superuser(
        email='admin@tour.com',
        password='admin1234',
        nombre='Admin',
        apellido='User',
        tipo_usuario='admin'
    )
    print('Superuser created successfully')
else:
    print('Superuser already exists')
" 