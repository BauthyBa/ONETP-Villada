"""
Utility functions for generating consistent API responses.
"""
from rest_framework.response import Response
from rest_framework import status


def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    """
    Generate a success response with a consistent format.
    
    Args:
        data: The data to include in the response.
        message (str): A success message.
        status_code (int): The HTTP status code.
    
    Returns:
        Response: A DRF Response object.
    """
    response_data = {
        'success': True,
        'message': message,
    }
    
    if data is not None:
        response_data['data'] = data
    
    return Response(response_data, status=status_code)


def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Generate an error response with a consistent format.
    
    Args:
        message (str): An error message.
        errors: A dictionary of field errors.
        status_code (int): The HTTP status code.
    
    Returns:
        Response: A DRF Response object.
    """
    response_data = {
        'success': False,
        'message': message,
    }
    
    if errors is not None:
        response_data['errors'] = errors
    
    return Response(response_data, status=status_code)


def not_found_response(resource_name, identifier):
    """
    Generate a 404 Not Found response.
    
    Args:
        resource_name (str): The name of the resource that was not found.
        identifier: The identifier used to look up the resource.
    
    Returns:
        Response: A 404 Response object.
    """
    return error_response(
        message=f"{resource_name} with id {identifier} not found.",
        status_code=status.HTTP_404_NOT_FOUND
    )


def permission_denied_response(message="You do not have permission to perform this action."):
    """
    Generate a 403 Forbidden response.
    
    Args:
        message (str): The permission denied message.
    
    Returns:
        Response: A 403 Response object.
    """
    return error_response(
        message=message,
        status_code=status.HTTP_403_FORBIDDEN
    )


def validation_error_response(serializer):
    """
    Generate a 400 Bad Request response for validation errors.
    
    Args:
        serializer: The serializer with validation errors.
    
    Returns:
        Response: A 400 Response object with validation errors.
    """
    return error_response(
        message="Validation error",
        errors=serializer.errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )
