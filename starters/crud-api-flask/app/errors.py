from flask import jsonify


def error(message, status):
    """Every error leaves as {"error": "..."}."""
    return jsonify(error=message), status
