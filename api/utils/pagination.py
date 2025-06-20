"""
Custom pagination classes for the API.
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    A standard page number pagination style with custom page size.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'results': data
        })


class LargeResultsSetPagination(StandardResultsSetPagination):
    """
    For endpoints that might return a large number of items.
    """
    page_size = 25
    max_page_size = 200


class SmallResultsSetPagination(StandardResultsSetPagination):
    """
    For endpoints that should return a small number of items.
    """
    page_size = 5
    max_page_size = 20
