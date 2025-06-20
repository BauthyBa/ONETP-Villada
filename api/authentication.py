"""
Custom authentication classes and utilities for the ONIET API.
"""
import logging
from datetime import datetime, timedelta

from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.settings import api_settings as jwt_settings
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

def get_tokens_for_user(user):
    """
    Generate access and refresh tokens for the given user.
    
    Args:
        user: The user instance
        
    Returns:
        dict: Dictionary containing 'access' and 'refresh' tokens
        
    Raises:
        TypeError: If user is not provided
    """
    if not user:
        logger.error("Cannot generate tokens: No user provided")
        raise TypeError("User must be provided to generate tokens")
    
    try:
        # Get the refresh token for the user
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Add custom claims to the access token
        access_token['user'] = {
            'id': user.id,
            'email': user.email,
            'nombre': user.nombre,
            'apellido': user.apellido,
            'tipo_usuario': user.tipo_usuario,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }
        
        # Get the token as a string
        access_token_str = str(access_token)
        refresh_token_str = str(refresh)
        
        logger.debug("Generated new tokens for user %s", user.email)
        
        return {
            'refresh': refresh_token_str,
            'access': access_token_str,
            'token_type': 'Bearer',
            'expires_in': jwt_settings.ACCESS_TOKEN_LIFETIME.total_seconds(),
            'user': {
                'id': user.id,
                'email': user.email,
                'nombre': user.nombre,
                'apellido': user.apellido,
                'tipo_usuario': user.tipo_usuario,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            }
        }
        
    except Exception as e:
        logger.exception("Error generating tokens for user %s: %s", user.email, str(e))
        raise


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that includes user details in the response.
    
    This class extends the default JWT authentication to include additional
    user information in the validated token and provides better error handling.
    """
    
    def get_user(self, validated_token):
        """
        Get the user from the validated token.
        
        Args:
            validated_token: The validated token
            
        Returns:
            User: The user associated with the token
            
        Raises:
            InvalidToken: If the token is invalid or the user doesn't exist
        """
        if not validated_token:
            logger.error("No validated token provided")
            raise InvalidToken('No validated token provided')
            
        try:
            # Get the user using the parent class method
            user = super().get_user(validated_token)
            
            if not user:
                logger.error("No user found for the given token")
                raise InvalidToken('User not found')
                
            if not user.is_active:
                logger.warning("Inactive user attempted to authenticate: %s", user.email)
                raise exceptions.AuthenticationFailed(
                    'User is inactive',
                    code='user_inactive',
                )
            
            # Add user details to the token
            validated_token['user'] = {
                'id': user.id,
                'email': user.email,
                'nombre': user.nombre,
                'apellido': user.apellido,
                'tipo_usuario': user.tipo_usuario,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            }
            
            logger.debug("Authenticated user: %s", user.email)
            return user
            
        except Exception as e:
            logger.exception("Error authenticating user: %s", str(e))
            raise InvalidToken('Error authenticating user')
    
    def get_validated_token(self, raw_token):
        """
        Validate the token and return a validated token wrapper.
        
        Args:
            raw_token: The raw token string
            
        Returns:
            Token: The validated token
            
        Raises:
            InvalidToken: If the token is invalid or expired
        """
        try:
            # Use the parent class to validate the token
            validated_token = super().get_validated_token(raw_token)
            
            # Additional custom validation can be added here
            self._validate_token_type(validated_token)
            
            return validated_token
            
        except TokenError as e:
            logger.warning("Token validation failed: %s", str(e))
            raise InvalidToken(str(e))
        except Exception as e:
            logger.exception("Unexpected error during token validation: %s", str(e))
            raise InvalidToken('Invalid token')
    
    def _validate_token_type(self, token):
        """
        Validate the token type.
        
        Args:
            token: The token to validate
            
        Raises:
            InvalidToken: If the token type is invalid
        """
        if not isinstance(token, (AccessToken, RefreshToken)):
            raise InvalidToken('Invalid token type')
            
        # Check if the token is an access token
        if hasattr(token, 'token_type') and token.token_type != 'access':
            raise InvalidToken('Token type is not an access token')
    
    def authenticate(self, request):
        """
        Authenticate the request and return a user and token.
        
        Args:
            request: The HTTP request
            
        Returns:
            tuple: (user, token) if authentication is successful, None otherwise
        """
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            
            # Check if the token is about to expire soon (within 5 minutes)
            self._check_token_expiration(validated_token)
            
            return user, validated_token
            
        except Exception as e:
            logger.warning("Authentication failed: %s", str(e))
            return None
    
    def _check_token_expiration(self, token):
        """
        Check if the token is about to expire soon.
        
        Args:
            token: The token to check
            
        Returns:
            bool: True if the token is about to expire soon, False otherwise
        """
        if not token or 'exp' not in token:
            return False
            
        exp_timestamp = token['exp']
        exp_datetime = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
        now = timezone.now()
        
        # Check if token expires in less than 5 minutes
        if (exp_datetime - now) < timedelta(minutes=5):
            logger.debug("Token for user %s is about to expire soon", token.get('user', {}).get('email', 'unknown'))
            return True
            
        return False
