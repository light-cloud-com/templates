from rest_framework.views import exception_handler as drf_exception_handler


def exception_handler(exc, context):
    """Every error leaves as {"error": "..."}."""
    response = drf_exception_handler(exc, context)
    if response is None:
        return None
    data = response.data
    if response.status_code == 404:
        message = "Item not found"
    elif isinstance(data, dict) and "detail" in data:
        message = str(data["detail"])
    elif isinstance(data, dict):
        message = "; ".join(
            f"{'body' if field == 'non_field_errors' else field}: {' '.join(map(str, errors))}"
            for field, errors in data.items()
        )
    else:
        message = str(data)
    response.data = {"error": message}
    return response
