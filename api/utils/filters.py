"""
Custom filters for the API.
"""
import django_filters
from django.db import models
from django.db.models import Q


class BaseFilterSet(django_filters.FilterSet):
    """
    Base filter set with common functionality.
    """
    # Add common filters here
    search = django_filters.CharFilter(method='filter_search')
    ordering = django_filters.OrderingFilter(
        fields=(
            ('id', 'id'),
            ('created_at', 'created_at'),
            ('updated_at', 'updated_at'),
        ),
        field_labels={
            'id': 'ID',
            'created_at': 'Created At',
            'updated_at': 'Updated At',
        }
    )
    
    class Meta:
        abstract = True
        filter_overrides = {
            models.BooleanField: {
                'filter_class': django_filters.BooleanFilter,
                'extra': lambda f: {
                    'widget': django_filters.widgets.BooleanWidget
                },
            },
        }
    
    def filter_search(self, queryset, name, value):
        """
        Filter the queryset using a search term.
        
        This method should be overridden by subclasses to implement
        custom search functionality.
        """
        if not value:
            return queryset
            
        # Default search implementation that looks for the search term
        # in all CharField and TextField fields
        or_conditions = Q()
        
        for field in self.Meta.model._meta.fields:
            if isinstance(field, (models.CharField, models.TextField)):
                or_conditions |= Q(**{f"{field.name}__icontains": value})
        
        return queryset.filter(or_conditions)


class DateRangeFilter(django_filters.FilterSet):
    """
    Filter for date ranges.
    
    Example:
    
    class MyFilter(DateRangeFilter):
        start_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
        end_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    """
    start_date = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        abstract = True


class RelatedOrderingFilter(django_filters.OrderingFilter):
    """
    Extends OrderingFilter to support ordering by fields in related models.
    
    Example:
    
    class MyFilter(BaseFilterSet):
        order_by = RelatedOrderingFilter(
            fields=(
                ('id', 'id'),
                ('user__username', 'username'),
                ('user__email', 'email'),
            ),
            field_labels={
                'id': 'ID',
                'user__username': 'Username',
                'user__email': 'Email',
            }
        )
    """
    def filter(self, qs, value):
        if value in django_filters.filters.EMPTY_VALUES:
            return qs
            
        ordering = [self.get_ordering_value(param) for param in value]
        return qs.order_by(*ordering)


class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    """
    Filter for a list of numbers.
    
    Example:
    
    class MyFilter(BaseFilterSet):
        ids = NumberInFilter(field_name='id', lookup_expr='in')
    """
    pass


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    """
    Filter for a list of strings.
    
    Example:
    
    class MyFilter(BaseFilterSet):
        usernames = CharInFilter(field_name='username', lookup_expr='in')
    """
    pass


class ListFilter(django_filters.Filter):
    """
    Filter for a comma-separated list of values.
    
    Example:
    
    class MyFilter(BaseFilterSet):
        status = ListFilter(field_name='status', lookup_expr='in')
        
        # In the URL: ?status=active,pending
    """
    def filter(self, qs, value):
        if not value:
            return qs
            
        # Split the value by commas and strip whitespace
        values = [v.strip() for v in value.split(',') if v.strip()]
        
        # If no valid values, return the queryset as-is
        if not values:
            return qs
            
        # Apply the filter
        lookup = f"{self.field_name}__{self.lookup_expr}"
        return qs.filter(**{lookup: values})


class StatusFilter(django_filters.ChoiceFilter):
    """
    Filter for status fields with predefined choices.
    
    Example:
    
    class MyFilter(BaseFilterSet):
        status = StatusFilter(choices=(
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('pending', 'Pending'),
        ))
    """
    def __init__(self, *args, **kwargs):
        # If no choices are provided, use the model field's choices
        if 'choices' not in kwargs and hasattr(self, 'field_name'):
            model = self.parent.Meta.model
            field = model._meta.get_field(self.field_name)
            if hasattr(field, 'choices') and field.choices:
                kwargs['choices'] = field.choices
                
        super().__init__(*args, **kwargs)


class RangeFilter(django_filters.RangeFilter):
    """
    Filter for a range of values.
    
    Example:
    
    class MyFilter(BaseFilterSet):
        price = RangeFilter()
        
        # In the URL: ?price_min=10&price_max=100
    """
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('lookup_expr', 'range')
        super().__init__(*args, **kwargs)


class MultipleLookupFilter(django_filters.Filter):
    """
    Filter that supports multiple lookup expressions.
    
    Example:
    
    class MyFilter(BaseFilterSet):
        name = MultipleLookupFilter(lookups=(
            ('exact', 'Exact match'),
            ('icontains', 'Contains (case-insensitive)'),
            ('istartswith', 'Starts with (case-insensitive)'),
        ))
        
        # In the URL: ?name__exact=test or ?name__icontains=test
    """
    def __init__(self, *args, lookups=None, **kwargs):
        self.lookups = lookups or (('exact', 'Exact match'),)
        super().__init__(*args, **kwargs)
    
    def filter(self, qs, value):
        if not value:
            return qs
            
        lookup = self.lookup_expr or 'exact'
        
        # If the lookup is not in the allowed lookups, use the first one
        if lookup not in dict(self.lookups):
            lookup = self.lookups[0][0]
            
        # Apply the filter
        lookup = f"{self.field_name}__{lookup}"
        return qs.filter(**{lookup: value})
