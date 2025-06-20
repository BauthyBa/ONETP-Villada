#!/usr/bin/env python3
"""
Populate default categories and sample tour packages.
Run: python setup_default_data.py
"""
import os
import django
import random
from decimal import Decimal
from datetime import date, timedelta

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import CategoriaPaquete, Paquete  # noqa: E402, after django.setup()

# ------------------ Default Data ------------------ #
CATEGORIES = [
    ('aventura', 'Experiencias de aventura'),
    ('playa', 'Vacaciones de playa'),
    ('cultura', 'Viajes culturales'),
    ('gastronomia', 'Rutas gastronómicas'),
    ('naturaleza', 'Escapadas a la naturaleza'),
    ('city_tour', 'Tours de ciudad'),
    ('crucero', 'Cruceros y travesías'),
    ('nieve', 'Destinos de nieve'),
    ('safari', 'Safaris y fauna'),
    ('relax', 'Bienestar y relax'),
]

ARG_DESTINOS = [
    ('Bariloche', 'Aventura en la Patagonia'),
    ('Mendoza', 'Rutas del vino'),
    ('Iguazú', 'Cataratas imponentes'),
    ('Salta', 'Paisajes del norte'),
    ('Buenos Aires', 'City tour capitalino'),
    ('Ushuaia', 'Fin del mundo'),
    ('El Calafate', 'Glaciares majestuosos'),
    ('Córdoba', 'Sierras y tradición'),
]

INTL_DESTINOS = [
    ('Río de Janeiro', 'Playas y carnaval'),
    ('Cartagena', 'Ciudad amurallada'),
    ('Machu Picchu', 'Misterios incas'),
    ('Cancún', 'Caribe mexicano'),
    ('Nueva York', 'La Gran Manzana'),
    ('París', 'Ciudad del amor'),
    ('Roma', 'Historia eterna'),
    ('Tokio', 'Tradición y tecnología'),
    ('Madrid', 'Capital vibrante'),
    ('Sídney', 'Iconos australianos'),
]

# --------------------------------------------------- #


def create_categories():
    for nombre, descripcion in CATEGORIES:
        cat, created = CategoriaPaquete.objects.get_or_create(
            nombre=nombre.capitalize(),
            defaults={'descripcion': descripcion}
        )
        if created:
            print(f"✅ Categoría creada: {cat.nombre}")


def random_price():
    return Decimal(random.randint(50000, 250000))


def random_dates():
    start = date.today() + timedelta(days=random.randint(15, 120))
    end = start + timedelta(days=random.randint(3, 10))
    return start, end


def create_sample_packages(quantity: int = 10):
    all_destinos = ARG_DESTINOS + INTL_DESTINOS
    categorias = list(CategoriaPaquete.objects.all())
    if not categorias:
        print("⚠️ No hay categorías para asignar a los paquetes. Ejecute primero create_categories().")
        return

    for i in range(quantity):
        destino = random.choice(all_destinos)
        nombre, descripcion = destino
        precio = random_price()
        duracion = random.randint(3, 14)
        cupo_max = random.randint(10, 40)
        fecha_inicio, fecha_fin = random_dates()
        categoria = random.choice(categorias)

        paquete, created = Paquete.objects.get_or_create(
            nombre=f"{nombre} Experience {i+1}",
            defaults={
                'descripcion': descripcion,
                'precio': precio,
                'duracion_dias': duracion,
                'cupo_maximo': cupo_max,
                'fecha_inicio': fecha_inicio,
                'fecha_fin': fecha_fin,
                'destino': nombre,
                'categoria': categoria,
            }
        )
        if created:
            print(f"✅ Paquete creado: {paquete.nombre} - {categoria.nombre}")


if __name__ == '__main__':
    print("🌐 Creando categorías por defecto...")
    create_categories()

    print("📦 Creando paquetes de ejemplo...")
    create_sample_packages(10)

    print("🎉 Datos iniciales cargados correctamente.") 