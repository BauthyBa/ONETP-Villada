"""
Base views and viewset for the API.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination class for API views."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BaseViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet that includes default pagination and permission classes.
    """
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        # Admin users can do everything
        if self.request.user.is_staff or self.request.user.is_superuser:
            permission_classes = [IsAuthenticated]
        # Regular users can only read
        elif self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        # Regular users cannot create/update/delete
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = self.permission_classes
            
        return [permission() for permission in permission_classes]
    
    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        context = super().get_serializer_context()
        context.update({
            'request': self.request,
            'format': self.format_kwarg,
            'view': self
        })
        return context
    
    def perform_create(self, serializer):
        """
        Save the object with the current user as the creator.
        """
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """
        Save the object with the current user as the last modifier.
        """
        serializer.save(updated_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate an inactive instance."""
        instance = self.get_object()
        instance.is_active = True
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate an active instance."""
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
