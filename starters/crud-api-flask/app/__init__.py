from datetime import datetime

from flask import Flask
from flask.json.provider import DefaultJSONProvider
from werkzeug.exceptions import HTTPException

from app.db import create_tables, pool
from app.errors import error
from app.routes import health, items


class JSONProvider(DefaultJSONProvider):
    # ISO 8601 timestamps instead of Flask's default HTTP-date format.
    @staticmethod
    def default(o):
        return o.isoformat() if isinstance(o, datetime) else DefaultJSONProvider.default(o)


def create_app() -> Flask:
    """Application factory: opens the database, then builds the app and its blueprints."""
    # Creates the table on start. If the database is unreachable the app does not start.
    pool.open(wait=True)
    create_tables()

    app = Flask(__name__)
    app.json = JSONProvider(app)
    app.register_error_handler(HTTPException, lambda e: error(e.name, e.code))
    app.register_blueprint(health.bp)
    app.register_blueprint(items.bp)
    return app
