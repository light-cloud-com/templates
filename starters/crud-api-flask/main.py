"""Entry point: Light Cloud starts the app with `gunicorn main:app`."""

from app import create_app

app = create_app()
