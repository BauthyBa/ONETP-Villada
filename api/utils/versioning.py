"""
Custom versioning for the API.
"""
from rest_framework import versioning
from rest_framework.exceptions import NotFound

class NamespaceVersioning(versioning.NamespaceVersioning):
    """
    Versioning that uses the URL namespace to determine the API version.
    
    Example:
    
    # urls.py
    urlpatterns = [
        path('v1/', include((v1_urls, 'v1'), namespace='v1')),
        path('v2/', include((v2_urls, 'v2'), namespace='v2')),
    ]
    
    # settings.py
    REST_FRAMEWORK = {
        'DEFAULT_VERSIONING_CLASS': 'api.utils.versioning.NamespaceVersioning',
        'DEFAULT_VERSION': 'v1',
        'ALLOWED_VERSIONS': ['v1', 'v2'],
    }
    """
    default_version = 'v1'
    allowed_versions = ['v1']
    version_param = 'version'
    
    def determine_version(self, request, *args, **kwargs):
        """
        Determine the API version from the URL namespace.
        """
        resolver_match = getattr(request, 'resolver_match', None)
        if resolver_match is None:
            return self.default_version
            
        namespace = resolver_match.namespace
        if not namespace:
            return self.default_version
            
        # Extract version from namespace (e.g., 'v1:api:user' -> 'v1')
        version = namespace.split(':')[0]
        
        if version not in self.allowed_versions:
            raise NotFound(f"Invalid API version: {version}")
            
        return version


class QueryParameterVersioning(versioning.QueryParameterVersioning):
    """
    Versioning that uses a query parameter to determine the API version.
    
    Example:
    
    # settings.py
    REST_FRAMEWORK = {
        'DEFAULT_VERSIONING_CLASS': 'api.utils.versioning.QueryParameterVersioning',
        'DEFAULT_VERSION': 'v1',
        'ALLOWED_VERSIONS': ['v1', 'v2'],
    }
    
    # Usage
    # /api/endpoint/?version=v1
    # /api/endpoint/?version=v2
    """
    default_version = 'v1'
    allowed_versions = ['v1']
    version_param = 'version'


class AcceptHeaderVersioning(versioning.AcceptHeaderVersioning):
    """
    Versioning that uses the Accept header to determine the API version.
    
    Example:
    
    # settings.py
    REST_FRAMEWORK = {
        'DEFAULT_VERSIONING_CLASS': 'api.utils.versioning.AcceptHeaderVersioning',
        'DEFAULT_VERSION': 'v1',
        'ALLOWED_VERSIONS': ['v1', 'v2'],
    }
    
    # Usage
    # Accept: application/json; version=v1
    # Accept: application/json; version=v2
    """
    default_version = 'v1'
    allowed_versions = ['v1']
    version_param = 'version'


class HostNameVersioning(versioning.HostNameVersioning):
    """
    Versioning that uses the hostname to determine the API version.
    
    Example:
    
    # settings.py
    REST_FRAMEWORK = {
        'DEFAULT_VERSIONING_CLASS': 'api.utils.versioning.HostNameVersioning',
        'DEFAULT_VERSION': 'v1',
        'ALLOWED_VERSIONS': ['v1', 'v2'],
    }
    
    # Usage
    # v1.api.example.com
    # v2.api.example.com
    """
    default_version = 'v1'
    allowed_versions = ['v1']
    version_param = 'version'
    hostname_regex = r'^([a-zA-Z0-9-]+)\.api\..+$'
