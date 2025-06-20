"""
Utility functions for handling file storage.
"""
import os
import uuid
from datetime import datetime
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings

def get_unique_filename(filename):
    """
    Generate a unique filename.
    
    Args:
        filename (str): The original filename
        
    Returns:
        str: A unique filename
    """
    ext = filename.split('.')[-1].lower()
    return f"{uuid.uuid4().hex}.{ext}"


def get_upload_path(instance, filename, base_path):
    """
    Generate a file path for uploads.
    
    Args:
        instance: The model instance
        filename (str): The original filename
        base_path (str): The base path for the upload
        
    Returns:
        str: The file path
    """
    now = datetime.now()
    filename = get_unique_filename(filename)
    return os.path.join(base_path, f"{now.year}", f"{now.month:02d}", filename)


def save_uploaded_file(file, upload_to):
    """
    Save an uploaded file to the specified path.
    
    Args:
        file: The uploaded file
        upload_to (str): The path to save the file to (relative to MEDIA_ROOT)
        
    Returns:
        str: The path to the saved file (relative to MEDIA_ROOT)
    """
    if not file:
        return None
    
    # Ensure the upload_to directory exists
    os.makedirs(os.path.join(settings.MEDIA_ROOT, os.path.dirname(upload_to)), exist_ok=True)
    
    # Save the file
    file_path = os.path.join(settings.MEDIA_ROOT, upload_to)
    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    return upload_to


def delete_file(file_path):
    """
    Delete a file from storage.
    
    Args:
        file_path (str): The path to the file (relative to MEDIA_ROOT)
        
    Returns:
        bool: True if the file was deleted, False otherwise
    """
    if not file_path:
        return False
    
    full_path = os.path.join(settings.MEDIA_ROOT, file_path)
    
    try:
        if os.path.isfile(full_path):
            os.remove(full_path)
            return True
    except OSError:
        pass
    
    return False


def get_file_url(file_path):
    """
    Get the URL for a file.
    
    Args:
        file_path (str): The path to the file (relative to MEDIA_ROOT)
        
    Returns:
        str: The URL to the file
    """
    if not file_path:
        return None
    
    return f"{settings.MEDIA_URL}{file_path}"


def get_file_content(file_path):
    """
    Get the content of a file.
    
    Args:
        file_path (str): The path to the file (relative to MEDIA_ROOT)
        
    Returns:
        bytes: The file content, or None if the file doesn't exist
    """
    if not file_path:
        return None
    
    full_path = os.path.join(settings.MEDIA_ROOT, file_path)
    
    try:
        with open(full_path, 'rb') as f:
            return f.read()
    except IOError:
        return None


class FileMixin:
    """
    A mixin for models that handle file uploads.
    """
    @classmethod
    def upload_file(cls, file, base_path):
        """
        Upload a file to the specified path.
        
        Args:
            file: The uploaded file
            base_path (str): The base path for the upload
            
        Returns:
            str: The path to the saved file (relative to MEDIA_ROOT)
        """
        if not file:
            return None
            
        filename = get_unique_filename(file.name)
        upload_to = os.path.join(base_path, filename)
        
        return save_uploaded_file(file, upload_to)
    
    def delete_file_field(self, field_name):
        """
        Delete the file associated with a FileField or ImageField.
        
        Args:
            field_name (str): The name of the field
            
        Returns:
            bool: True if the file was deleted, False otherwise
        """
        field = getattr(self, field_name, None)
        if field:
            return delete_file(field.name)
        return False
    
    def get_file_url(self, field_name):
        """
        Get the URL for a FileField or ImageField.
        
        Args:
            field_name (str): The name of the field
            
        Returns:
            str: The URL to the file, or None if the field is empty
        """
        field = getattr(self, field_name, None)
        if field:
            return field.url
        return None
