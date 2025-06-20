"""
Utility functions for JWT token handling.
"""
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.utils import timezone

def get_tokens_for_user(user):
    """
    Generate access and refresh tokens for the given user.
    
    Args:
        user: The user to generate tokens for
        
    Returns:
        dict: A dictionary containing the access and refresh tokens
    """
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['user_id'] = str(user.id)
    refresh['email'] = user.email
    refresh['tipo_usuario'] = user.tipo_usuario
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'expires_in': int(timedelta(minutes=5).total_seconds()),
        'token_type': 'Bearer',
    }


def get_user_from_token(token):
    """
    Get a user from a JWT token.
    
    Args:
        token (str): The JWT token
        
    Returns:
        User: The user associated with the token, or None if the token is invalid
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        return User.objects.get(id=user_id)
    except (TokenError, KeyError, User.DoesNotExist):
        return None


def refresh_token(refresh_token_str):
    """
    Refresh an access token using a refresh token.
    
    Args:
        refresh_token_str (str): The refresh token
        
    Returns:
        dict: A dictionary containing the new access token, or None if the refresh token is invalid
    """
    try:
        refresh = RefreshToken(refresh_token_str)
        access_token = str(refresh.access_token)
        
        # Add custom claims to the new access token
        refresh['user_id'] = refresh.payload['user_id']
        refresh['email'] = refresh.payload['email']
        refresh['tipo_usuario'] = refresh.payload['tipo_usuario']
        
        return {
            'access': access_token,
            'expires_in': int(timedelta(minutes=5).total_seconds()),
            'token_type': 'Bearer',
        }
    except TokenError:
        return None


def blacklist_token(token):
    """
    Add a token to the blacklist.
    
    Args:
        token (str): The token to blacklist
        
    Returns:
        bool: True if the token was blacklisted, False otherwise
    """
    try:
        # This will raise an exception if the token is invalid
        RefreshToken(token).blacklist()
        return True
    except TokenError:
        return False


def get_token_expiration(token):
    """
    Get the expiration datetime of a token.
    
    Args:
        token (str): The JWT token
        
    Returns:
        datetime: The expiration datetime, or None if the token is invalid
    """
    try:
        access_token = AccessToken(token)
        return timezone.datetime.fromtimestamp(access_token['exp'], tz=timezone.utc)
    except TokenError:
        return None
