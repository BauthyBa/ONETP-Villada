"""
Custom permission classes for the API.
"""
from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to admin users.
        return request.user and request.user.is_staff


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.usuario == request.user


class IsAdminOrSelf(permissions.BasePermission):
    """
    Custom permission to only allow admins or the user themselves to access the view.
    """
    def has_permission(self, request, view):
        # Only allow authenticated users
        if not request.user.is_authenticated:
            return False
            
        # Allow admins to do anything
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        # For non-admin users, only allow access to their own data
        user_id = view.kwargs.get('pk')
        return str(request.user.id) == str(user_id)


class IsVendedorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow vendedores to create/update/delete objects.
    Read-only for non-vendedores.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to vendedores.
        return request.user.is_authenticated and request.user.tipo_usuario == 'vendedor'


class IsAdminOrVendedor(permissions.BasePermission):
    """
    Custom permission to only allow admins or vendedores to access the view.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or 
            request.user.is_superuser or 
            request.user.tipo_usuario == 'vendedor'
        )


class IsAdminOrVendedorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins or vendedores to edit objects.
    Read-only for others.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to admins or vendedores.
        return request.user.is_authenticated and (
            request.user.is_staff or 
            request.user.is_superuser or 
            request.user.tipo_usuario == 'vendedor'
        )


class IsAdminOrOwner(permissions.BasePermission):
    """
    Custom permission to only allow admins or the owner of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        # Check if the user is the owner of the object
        if hasattr(obj, 'usuario'):
            return obj.usuario == request.user
            
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        return False
