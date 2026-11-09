from django.urls import include, path

from . import views

urlpatterns = [
    path("", views.index),
    path("health", views.health),
    path("", include("items.urls")),
]

handler404 = "config.views.not_found"
handler500 = "config.views.server_error"
