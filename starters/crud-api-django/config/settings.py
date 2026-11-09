import os
import secrets

# This API has no sessions, forms or signed cookies, so a random key per start is enough.
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY") or secrets.token_urlsafe(50)
DEBUG = False
# Light Cloud routes only your app's own domains here.
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = ["rest_framework", "items"]
MIDDLEWARE = []
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
USE_TZ = True
TIME_ZONE = "UTC"
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

# Light Cloud sets DB_HOST ("host" or "host:port"), DB_NAME, DB_USER and DB_PASSWORD.
# sslmode=require: TLS on, certificate not verified (the database's certificate is
# platform-internal). Set DB_SSLMODE=disable for a local database without TLS.
_host, _, _port = os.environ.get("DB_HOST", "localhost").partition(":")
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": _host,
        "PORT": _port or "5432",
        "NAME": os.environ.get("DB_NAME", "postgres"),
        "USER": os.environ.get("DB_USER", "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", ""),
        "OPTIONS": {"sslmode": os.environ.get("DB_SSLMODE", "require")},
        "CONN_MAX_AGE": 60,
        "CONN_HEALTH_CHECKS": True,
    }
}

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "UNAUTHENTICATED_USER": None,
    "EXCEPTION_HANDLER": "items.views.exception_handler",
}

LOGGING = {
    "version": 1,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
