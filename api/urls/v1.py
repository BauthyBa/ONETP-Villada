"""
API v1 URL Configuration
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.authentication import CustomTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

from ..views import (
    authentication as auth_views,
    usuarios as usuario_views,
    paquetes as paquete_views,
    carritos as carrito_views,
    ventas as venta_views,
)

# Create a router for our API views
router = DefaultRouter()

# User views
router.register(r'usuarios', usuario_views.UsuarioViewSet, basename='usuario')

# Package views
router.register(r'categorias-paquetes', paquete_views.CategoriaPaqueteViewSet, basename='categoria-paquete')
router.register(r'paquetes', paquete_views.PaqueteViewSet, basename='paquete')

# Cart views
router.register(r'carritos', carrito_views.CarritoViewSet, basename='carrito')
router.register(r'carrito-items', carrito_views.CarritoItemViewSet, basename='carrito-item')

# Sale views
router.register(r'ventas', venta_views.VentaViewSet, basename='venta')

# The API URLs are now determined automatically by the router
urlpatterns = [
    # Authentication
    path('auth/register/', auth_views.RegisterView.as_view(), name='auth-register'),
    path('auth/login/', auth_views.LoginView.as_view(), name='auth-login'),
    path('auth/logout/', auth_views.LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', auth_views.UserProfileView.as_view(), name='auth-me'),
    
    # JWT Authentication
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Include router URLs
    path('', include(router.urls)),
    
    # Custom endpoints
    path('paquetes/destacados/', 
         paquete_views.PaqueteViewSet.as_view({'get': 'destacados'}), 
         name='paquetes-destacados'),
    path('paquetes/categorias/', 
         paquete_views.PaqueteViewSet.as_view({'get': 'categorias'}), 
         name='paquetes-categorias'),
    
    # Cart endpoints
    path('carrito/agregar-item/', 
         carrito_views.CarritoViewSet.as_view({'post': 'agregar_item'}), 
         name='carrito-agregar-item'),
    path('carrito/mi-carrito/', 
         carrito_views.CarritoViewSet.as_view({'get': 'mi_carrito'}), 
         name='mi-carrito'),
    path('carrito/vaciar/', 
         carrito_views.CarritoViewSet.as_view({'post': 'vaciar'}), 
         name='vaciar-carrito'),
    
    # Sale endpoints
    path('ventas/confirmar-pago/', 
         venta_views.VentaViewSet.as_view({'post': 'confirmar_pago'}), 
         name='confirmar-pago'),
    path('mis-compras/', 
         venta_views.VentaViewSet.as_view({'get': 'mis_compras'}), 
         name='mis-compras'),
]
