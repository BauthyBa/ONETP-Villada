"""
URL configuration for the API endpoints.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import views
from .views import usuarios as usuarios_views
from .views import paquetes as paquetes_views
from .views import carritos as carritos_views
from .views import ventas as ventas_views

# Create a router
router = DefaultRouter()

# Register viewsets with the router
router.register(r'usuarios', usuarios_views.UsuarioViewSet)
router.register(r'paquetes', paquetes_views.PaqueteViewSet)
router.register(r'carritos', carritos_views.CarritoViewSet)
router.register(r'ventas', ventas_views.VentaViewSet)

# Additional URL patterns
urlpatterns = [
    # Include DRF router URLs
    path('', include(router.urls)),
    
    # Authentication
    path('auth/register/', usuarios_views.RegisterView.as_view(), name='auth_register'),
    path('auth/login/', usuarios_views.LoginView.as_view(), name='auth_login'),
    path('auth/me/', usuarios_views.UserProfileView.as_view(), name='user_profile'),
    
    # Additional endpoints
    path('paquetes/categoria/<str:categoria>/', 
         paquetes_views.PaqueteByCategoriaView.as_view(), 
         name='paquete-by-categoria'),
    path('carritos/usuario/<int:usuario_id>/', 
         carritos_views.CarritoByUsuarioView.as_view(), 
         name='carrito-by-usuario'),
    path('ventas/usuario/<int:usuario_id>/', 
         ventas_views.VentasByUsuarioView.as_view(), 
         name='ventas-by-usuario'),
]
