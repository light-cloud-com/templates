"""Project-wide endpoints: the route index, the health check and JSON error pages."""

from django.db import connection
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def index(request):
    return Response(
        {
            "name": "CRUD API (Django)",
            "routes": [
                "GET /health",
                "GET /items?limit=20&offset=0",
                "GET /items/<id>",
                "POST /items",
                "PUT /items/<id>",
                "DELETE /items/<id>",
            ],
        }
    )


@api_view(["GET"])
def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return Response({"status": "ok"})
    except Exception:
        return Response({"error": "Database unavailable"}, status=503)


def not_found(request, exception):
    return JsonResponse({"error": "Not found"}, status=404)


def server_error(request):
    return JsonResponse({"error": "Something went wrong"}, status=500)
