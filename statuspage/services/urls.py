# services/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, IncidentViewSet, IncidentUpdateViewSet
from .views import register


router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'incident-updates', IncidentUpdateViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register),
]
