import os

from flask import Flask, jsonify
from waitress import serve

app = Flask(__name__)


@app.get("/")
def index():
    return jsonify(message="Hello from Flask on Light Cloud")


if __name__ == "__main__":
    # Served by waitress rather than app.run(): the development server prints a
    # warning and is single-threaded, and this image is the one that goes live.
    serve(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
