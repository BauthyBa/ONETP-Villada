"""
Custom throttling classes for the API.
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle, ScopedRateThrottle


class AnonBurstRateThrottle(AnonRateThrottle):
    """
    Limits the rate of API calls that may be made by anonymous users.
    
    Should be used to prevent short bursts of requests from a single IP address.
    """
    scope = 'anon_burst'


class AnonSustainedRateThrottle(AnonRateThrottle):
    """
    Limits the rate of API calls that may be made by anonymous users.
    
    Should be used to prevent sustained high-frequency requests from a single IP address.
    """
    scope = 'anon_sustained'


class UserBurstRateThrottle(UserRateThrottle):
    """
    Limits the rate of API calls that may be made by a single user.
    
    Should be used to prevent short bursts of requests from a single user.
    """
    scope = 'user_burst'


class UserSustainedRateThrottle(UserRateThrottle):
    """
    Limits the rate of API calls that may be made by a single user.
    
    Should be used to prevent sustained high-frequency requests from a single user.
    """
    scope = 'user_sustained'


class StaffBypassThrottle(ScopedRateThrottle):
    """
    A throttle that allows staff users to bypass rate limiting.
    
    For non-staff users, applies the default rate limiting.
    """
    def allow_request(self, request, view):
        # Allow staff users to bypass throttling
        if request.user and request.user.is_staff:
            return True
            
        return super().allow_request(request, view)


class MethodScopedRateThrottle(ScopedRateThrottle):
    """
    A throttle that applies different rate limits based on the HTTP method.
    
    The scope will be determined by the view's `throttle_scope` attribute
    with the HTTP method appended (e.g., 'view:get', 'view:post').
    """
    def get_scope(self, request, view):
        scope = super().get_scope(request, view)
        if scope is None:
            return None
            
        # Append the HTTP method to the scope
        return f"{scope}:{request.method.lower()}"


class UserOrIPRateThrottle(UserRateThrottle):
    """
    A throttle that limits the rate of API calls by both user and IP address.
    
    The rate limit is applied to both authenticated users (by user ID)
    and anonymous users (by IP address).
    """
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            # Use the user ID for authenticated users
            ident = request.user.pk
        else:
            # Use the IP address for anonymous users
            ident = self.get_ident(request)
            
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class ConcurrentRequestThrottle(UserRateThrottle):
    """
    A throttle that limits the number of concurrent requests per user.
    
    This is useful for preventing users from making too many simultaneous
    requests that could overwhelm the server.
    """
    scope = 'concurrent'
    
    def allow_request(self, request, view):
        # Allow staff users to bypass throttling
        if request.user and request.user.is_staff:
            return True
            
        # Check if the user has exceeded the concurrent request limit
        if self.rate is None:
            return True
            
        self.key = self.get_cache_key(request, view)
        if self.key is None:
            return True
            
        # Get the current number of concurrent requests
        current_requests = self.cache.get(self.key, 0)
        
        # Check if the user has reached the limit
        if current_requests >= self.num_requests:
            return self.throttle_failure()
            
        # Increment the concurrent request count
        self.cache.set(self.key, current_requests + 1, self.duration)
        return True
    
    def wait(self):
        """
        How long to wait before allowing another request.
        
        Since this is for concurrent requests, we can't provide a specific
        wait time. Instead, we'll return None to indicate that the client
        should retry after a short delay.
        """
        return None
    
    def throttle_success(self):
        """
        Called when a request is successful.
        """
        if hasattr(self, 'key') and self.key is not None:
            # Decrement the concurrent request count
            current_requests = self.cache.get(self.key, 1)
            if current_requests > 0:
                self.cache.set(self.key, current_requests - 1, self.duration)
                
        return True
