from django.urls import include, path
from rest_framework.routers import SimpleRouter

from items import views

router = SimpleRouter(trailing_slash=False)
router.register("items", views.ItemViewSet)

urlpatterns = [
    path("", views.index),
    path("health", views.health),
    path("", include(router.urls)),
]

handler404 = "items.views.not_found"
handler500 = "items.views.server_error"
