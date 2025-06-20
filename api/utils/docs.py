"""
Utilities for API documentation.
"""
from drf_yasg import openapi

# Common response schemas
RESPONSE_400 = {
    'error': 'Bad Request',
    'message': 'Invalid input.',
    'errors': {
        'field_name': ['Error message']
    }
}

RESPONSE_401 = {
    'error': 'Unauthorized',
    'message': 'Authentication credentials were not provided.'
}

RESPONSE_403 = {
    'error': 'Forbidden',
    'message': 'You do not have permission to perform this action.'
}

RESPONSE_404 = {
    'error': 'Not Found',
    'message': 'The requested resource was not found.'
}

RESPONSE_500 = {
    'error': 'Internal Server Error',
    'message': 'An error occurred while processing your request.'
}

# Common parameters
PAGE_PARAMETER = openapi.Parameter(
    'page',
    openapi.IN_QUERY,
    description='A page number within the paginated result set.',
    type=openapi.TYPE_INTEGER,
    default=1
)

PAGE_SIZE_PARAMETER = openapi.Parameter(
    'page_size',
    openapi.IN_QUERY,
    description='Number of results to return per page.',
    type=openapi.TYPE_INTEGER,
    default=10
)

SEARCH_PARAMETER = openapi.Parameter(
    'search',
    openapi.IN_QUERY,
    description='A search term.',
    type=openapi.TYPE_STRING
)

ORDERING_PARAMETER = openapi.Parameter(
    'ordering',
    openapi.IN_QUERY,
    description='Which field to use when ordering the results.',
    type=openapi.TYPE_STRING
)

# Common response schemas
def get_paginated_response_schema(schema):
    """
    Get a paginated response schema.
    
    Args:
        schema: The schema for the results
        
    Returns:
        dict: The paginated response schema
    """
    return {
        'type': 'object',
        'properties': {
            'count': {
                'type': 'integer',
                'example': 123
            },
            'next': {
                'type': 'string',
                'format': 'uri',
                'nullable': True,
                'example': 'http://api.example.org/endpoint/?page=4'
            },
            'previous': {
                'type': 'string',
                'format': 'uri',
                'nullable': True,
                'example': 'http://api.example.org/endpoint/?page=2'
            },
            'results': schema
        }
    }


def get_error_response_schema(description="Error response"):
    """
    Get an error response schema.
    
    Args:
        description (str): The schema description
        
    Returns:
        dict: The error response schema
    """
    return {
        'type': 'object',
        'properties': {
            'error': {
                'type': 'string',
                'example': 'Bad Request'
            },
            'message': {
                'type': 'string',
                'example': 'Invalid input.'
            },
            'errors': {
                'type': 'object',
                'additionalProperties': {
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    }
                },
                'example': {
                    'field_name': ['This field is required.']
                }
            }
        },
        'description': description
    }


def get_success_response_schema(schema, description="Success response"):
    """
    Get a success response schema.
    
    Args:
        schema: The schema for the data
        description (str): The schema description
        
    Returns:
        dict: The success response schema
    """
    return {
        'type': 'object',
        'properties': {
            'success': {
                'type': 'boolean',
                'example': True
            },
            'message': {
                'type': 'string',
                'example': 'Operation completed successfully.'
            },
            'data': schema
        },
        'description': description
    }


def get_list_response_schema(schema, description="List response"):
    """
    Get a list response schema.
    
    Args:
        schema: The schema for the items in the list
        description (str): The schema description
        
    Returns:
        dict: The list response schema
    """
    return {
        'type': 'object',
        'properties': {
            'count': {
                'type': 'integer',
                'example': 123
            },
            'next': {
                'type': 'string',
                'format': 'uri',
                'nullable': True,
                'example': 'http://api.example.org/endpoint/?page=4'
            },
            'previous': {
                'type': 'string',
                'format': 'uri',
                'nullable': True,
                'example': 'http://api.example.org/endpoint/?page=2'
            },
            'results': {
                'type': 'array',
                'items': schema
            }
        },
        'description': description
    }
