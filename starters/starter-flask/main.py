"""Entry point: the WSGI app object lives here as `main:app`."""

import os

from waitress import serve

from app import create_app

app = create_app()

if __name__ == "__main__":
    # Served by waitress rather than app.run(): the development server prints a
    # warning and is single-threaded, and this image is the one that goes live.
    serve(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
