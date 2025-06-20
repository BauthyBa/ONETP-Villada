from django.db import migrations, models
import uuid
from datetime import date, timedelta
import random
from decimal import Decimal

CATEGORIES = [
    ('Aventura', 'Experiencias de aventura'),
    ('Playa', 'Vacaciones de playa'),
    ('Cultura', 'Viajes culturales'),
    ('Gastronomía', 'Rutas gastronómicas'),
    ('Naturaleza', 'Escapadas a la naturaleza'),
    ('City tour', 'Tours de ciudad'),
    ('Crucero', 'Cruceros y travesías'),
    ('Nieve', 'Destinos de nieve'),
    ('Safari', 'Safaris y fauna'),
    ('Relax', 'Bienestar y relax'),
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


def random_price():
    return Decimal(random.randint(50000, 250000))


def random_dates():
    start = date.today() + timedelta(days=random.randint(30, 180))
    end = start + timedelta(days=random.randint(3, 12))
    return start, end


def create_default(apps, schema_editor):
    Categoria = apps.get_model('api', 'CategoriaPaquete')
    Paquete = apps.get_model('api', 'Paquete')

    # Create categories
    for nombre, descripcion in CATEGORIES:
        Categoria.objects.get_or_create(nombre=nombre, defaults={'descripcion': descripcion})

    categorias = list(Categoria.objects.all())

    all_destinos = ARG_DESTINOS + INTL_DESTINOS
    for i in range(10):
        destino_nombre, desc = random.choice(all_destinos)
        categoria = random.choice(categorias)

        Paquete.objects.get_or_create(
            nombre=f"{destino_nombre} Experience {i+1}",
            defaults={
                'descripcion': desc,
                'precio': random_price(),
                'duracion_dias': random.randint(3, 14),
                'cupo_maximo': random.randint(15, 40),
                'dificultad': random.choice(['baja', 'media', 'alta']),
                'categoria': categoria,
                'incluye': '',
                'no_incluye': '',
            }
        )


def reverse_default(apps, schema_editor):
    # Optionally delete inserted data
    Categoria = apps.get_model('api', 'CategoriaPaquete')
    Paquete = apps.get_model('api', 'Paquete')
    Paquete.objects.filter(nombre__icontains='Experience').delete()
    Categoria.objects.filter(nombre__in=[c[0] for c in CATEGORIES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default, reverse_default),
    ] 