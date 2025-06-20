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
from django.contrib.auth.hashers import make_password
User = get_user_model()
admin_user, created = User.objects.get_or_create(
    email='admin@tourpackages.com',
    defaults={
        'nombre': 'Admin',
        'apellido': 'User',
        'tipo_usuario': 'admin',
        'is_staff': True,
        'is_superuser': True,
        'password': make_password('admin1234')
    }
)
if created:
    print('✅ Superuser created successfully!')
else:
    # Update password and permissions
    admin_user.password = make_password('admin1234')
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.tipo_usuario = 'admin'
    admin_user.save()
    print('✅ Superuser updated successfully!')
print(f'📧 Email: {admin_user.email}')
print(f'🔑 Password: admin1234')
" 