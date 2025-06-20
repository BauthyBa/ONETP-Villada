# This file helps Railway detect this as a Python project
# The actual Django application is served via gunicorn in Procfile

import os
import sys

if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv) 