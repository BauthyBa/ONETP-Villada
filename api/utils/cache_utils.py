"""
Utility functions for caching API responses.
"""
from functools import wraps
from django.core.cache import cache
from django.utils.encoding import force_bytes
from hashlib import md5
import json


def cache_page(timeout):
    """
    Decorator for caching API responses.
    
    Args:
        timeout (int): Cache timeout in seconds
        
    Returns:
        function: Decorated view function
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            # Generate a cache key based on the request
            cache_key = generate_cache_key(request)
            
            # Try to get the response from cache
            response = cache.get(cache_key)
            if response is not None:
                return response
            
            # Call the view function if the response is not in cache
            response = view_func(request, *args, **kwargs)
            
            # Cache the response if it's a successful response
            if response.status_code == 200:
                cache.set(cache_key, response, timeout)
            
            return response
        return _wrapped_view
    return decorator


def cache_method(timeout=60 * 15, key_prefix=None):
    """
    Decorator for caching method results.
    
    Args:
        timeout (int): Cache timeout in seconds (default: 15 minutes)
        key_prefix (str, optional): Custom cache key prefix
        
    Returns:
        function: Decorated method
    """
    def decorator(method):
        @wraps(method)
        def wrapper(self, *args, **kwargs):
            # Generate a cache key based on the method name and arguments
            cache_key = generate_method_cache_key(method, self, args, kwargs, key_prefix)
            
            # Try to get the result from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Call the method if the result is not in cache
            result = method(self, *args, **kwargs)
            
            # Cache the result
            cache.set(cache_key, result, timeout)
            
            return result
        return wrapper
    return decorator


def generate_cache_key(request):
    """
    Generate a cache key for the given request.
    
    Args:
        request: The HTTP request
        
    Returns:
        str: The cache key
    """
    # Include the request method, path, query parameters, and request body in the cache key
    key_parts = [
        request.method,
        request.get_full_path(),
        json.dumps(request.GET, sort_keys=True),
    ]
    
    # Include the request body for POST, PUT, and PATCH requests
    if request.method in ('POST', 'PUT', 'PATCH'):
        key_parts.append(request.body.decode('utf-8', 'replace'))
    
    # Include the user's authentication status and ID if authenticated
    if hasattr(request, 'user') and request.user.is_authenticated:
        key_parts.append(f"user:{request.user.id}")
    
    # Generate a hash of the key parts
    key = ':'.join(str(part) for part in key_parts)
    return f"api:{md5(force_bytes(key)).hexdigest()}"


def generate_method_cache_key(method, instance, args, kwargs, key_prefix=None):
    """
    Generate a cache key for a method call.
    
    Args:
        method: The method being called
        instance: The instance the method is being called on
        args: Positional arguments passed to the method
        kwargs: Keyword arguments passed to the method
        key_prefix (str, optional): Custom cache key prefix
        
    Returns:
        str: The cache key
    """
    if key_prefix is None:
        key_prefix = f"{method.__module__}.{method.__qualname__}"
    
    # Convert args and kwargs to a string representation
    args_repr = ','.join(repr(arg) for arg in args)
    kwargs_repr = ','.join(f"{k}={repr(v)}" for k, v in sorted(kwargs.items()))
    all_args = ','.join(filter(None, [args_repr, kwargs_repr]))
    
    # Include the instance's ID if it has one
    instance_id = ''
    if hasattr(instance, 'id'):
        instance_id = f":{instance.id}"
    
    # Generate a hash of the key parts
    key = f"{key_prefix}{instance_id}({all_args})"
    return f"method:{md5(force_bytes(key)).hexdigest()}"


def invalidate_cache_key(key_pattern):
    """
    Invalidate all cache keys matching the given pattern.
    
    Args:
        key_pattern (str): The key pattern to match (supports glob patterns)
    """
    from django.core.cache import caches
    from django_redis import get_redis_connection
    
    # Get the default cache
    cache = caches['default']
    
    # If using Redis, use the KEYS command to find matching keys
    if hasattr(cache, 'keys'):
        keys = cache.keys(key_pattern)
        if keys:
            cache.delete_many(keys)
    # Fall back to Django's cache API
    else:
        # This is less efficient as it requires iterating over all keys
        # and checking them against the pattern
        for key in cache._cache.keys():
            if key.startswith(key_pattern):
                cache.delete(key)


def invalidate_model_cache(model_class, instance_id=None):
    """
    Invalidate cache entries for a model instance or all instances of a model.
    
    Args:
        model_class: The model class
        instance_id (int, optional): The ID of a specific instance to invalidate
    """
    if instance_id is not None:
        # Invalidate cache for a specific instance
        cache_key = f"{model_class._meta.model_name}:{instance_id}"
        invalidate_cache_key(f"*{cache_key}*")
    else:
        # Invalidate cache for all instances of the model
        cache_key = f"{model_class._meta.model_name}:*"
        invalidate_cache_key(cache_key)


def cache_result(timeout=60 * 15, key_func=None):
    """
    Decorator for caching the result of a function.
    
    Args:
        timeout (int): Cache timeout in seconds (default: 15 minutes)
        key_func (callable, optional): Function to generate a custom cache key
        
    Returns:
        function: Decorated function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate a cache key
            if key_func is not None:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default cache key based on function name and arguments
                key_parts = [func.__module__, func.__qualname__]
                key_parts.extend(str(arg) for arg in args)
                key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
                cache_key = f"func:{md5(force_bytes(':'.join(str(p) for p in key_parts))).hexdigest()}"
            
            # Try to get the result from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Call the function if the result is not in cache
            result = func(*args, **kwargs)
            
            # Cache the result
            cache.set(cache_key, result, timeout)
            
            return result
        return wrapper
    return decorator
