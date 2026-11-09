import os

from django.core.management import call_command
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
application = get_wsgi_application()

# Applies migrations on start, so a fresh database needs no manual step.
# If the database is unreachable the app does not start.
call_command("migrate", interactive=False, verbosity=1)
