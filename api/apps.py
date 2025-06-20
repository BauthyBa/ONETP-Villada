from django.apps import AppConfig


class ApiConfig(AppConfig):
    """Configuration for the API app."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    verbose_name = 'API de ONIET'
    
    def ready(self):
        # Import signals to register them
        import api.signals  # noqa
