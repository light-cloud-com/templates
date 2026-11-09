from django.db import connection
from django.http import JsonResponse
from rest_framework import serializers, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from .models import Item


class StrictCharField(serializers.CharField):
    """A CharField that rejects numbers instead of turning them into text."""

    def to_internal_value(self, data):
        if not isinstance(data, str):
            self.fail("invalid")
        return super().to_internal_value(data)


class ItemSerializer(serializers.ModelSerializer):
    name = StrictCharField(max_length=200)
    # default=None: a PUT without description clears it, like every other field.
    description = StrictCharField(allow_null=True, allow_blank=True, default=None)

    class Meta:
        model = Item
        fields = ["id", "name", "description", "created_at", "updated_at"]


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    http_method_names = ["get", "post", "put", "delete"]

    def list(self, request):
        try:
            limit = int(request.query_params.get("limit", 20))
            offset = int(request.query_params.get("offset", 0))
        except ValueError:
            limit = offset = -1
        if not 1 <= limit <= 100 or offset < 0:
            return Response({"error": "limit must be 1 to 100 and offset 0 or more"}, status=400)
        return Response(ItemSerializer(self.queryset[offset : offset + limit], many=True).data)


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


def not_found(request, exception):
    return JsonResponse({"error": "Not found"}, status=404)


def server_error(request):
    return JsonResponse({"error": "Something went wrong"}, status=500)
