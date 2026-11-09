from rest_framework import viewsets
from rest_framework.response import Response

from .models import Item
from .serializers import ItemSerializer


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
