from flask import request


def parse_item():
    """Returns ((name, description), None) or (None, error message) for the request body."""
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return None, "Send a JSON object"
    name = body.get("name")
    name = name.strip() if isinstance(name, str) else ""
    description = body.get("description")
    if not 1 <= len(name) <= 200:
        return None, "name is required and must be 1 to 200 characters"
    if description is not None and not isinstance(description, str):
        return None, "description must be a string"
    return (name, description), None


def int_arg(key, default, low, high):
    """The query parameter as an int, the default when absent, None when invalid."""
    value = request.args.get(key)
    if value is None:
        return default
    return int(value) if value.isdigit() and low <= int(value) <= high else None
