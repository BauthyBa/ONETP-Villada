"""
Utility functions for handling file uploads and storage.
"""
import os
import uuid
from datetime import datetime
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings

def get_upload_path(instance, filename, subfolder):
    """
    Generate a unique file path for uploaded files.
    
    Args:
        instance: The model instance where the file is being attached.
        filename (str): The original filename.
        subfolder (str): The subfolder within MEDIA_ROOT to save the file.
    
    Returns:
        str: A unique file path.
    """
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    now = datetime.now()
    return os.path.join(subfolder, f"{now.year}", f"{now.month:02d}", filename)


def save_uploaded_file(file, subfolder, content_type=None):
    """
    Save an uploaded file to the specified subfolder.
    
    Args:
        file: The uploaded file object.
        subfolder (str): The subfolder within MEDIA_ROOT to save the file.
        content_type (str, optional): The content type of the file.
    
    Returns:
        str: The path to the saved file relative to MEDIA_ROOT.
    """
    if not file:
        return None
    
    # Generate a unique filename
    ext = file.name.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    now = datetime.now()
    filepath = os.path.join(subfolder, f"{now.year}", f"{now.month:02d}", filename)
    
    # Save the file
    if hasattr(file, 'temporary_file_path'):
        # File was uploaded to a temporary location
        with open(file.temporary_file_path(), 'rb') as f:
            default_storage.save(filepath, ContentFile(f.read()))
    else:
        # File is in memory
        default_storage.save(filepath, ContentFile(file.read()))
    
    return filepath


def delete_file(filepath):
    """
    Delete a file from storage if it exists.
    
    Args:
        filepath (str): The path to the file relative to MEDIA_ROOT.
    
    Returns:
        bool: True if the file was deleted, False otherwise.
    """
    if not filepath:
        return False
    
    full_path = os.path.join(settings.MEDIA_ROOT, filepath)
    if default_storage.exists(full_path):
        default_storage.delete(full_path)
        return True
    return False


def get_file_url(filepath):
    """
    Get the full URL for a file path.
    
    Args:
        filepath (str): The path to the file relative to MEDIA_ROOT.
    
    Returns:
        str: The full URL to the file.
    """
    if not filepath:
        return None
    
    return f"{settings.MEDIA_URL}{filepath}"
