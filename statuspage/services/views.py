from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .models import Service, Incident, IncidentUpdate
from .serializers import ServiceSerializer, IncidentSerializer, IncidentUpdateSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        print("🔧 perform_create triggered for:", instance.name)
        self.notify_status_change(instance, event="created")

    def perform_update(self, serializer):
        original = self.get_object()
        instance = serializer.save()
        print("🔧 perform_update triggered for:", instance.name)

        if (
            original.status != instance.status or
            original.name != instance.name or
            original.description != instance.description
        ):
            self.notify_status_change(instance)

    def perform_destroy(self, instance):
        service_id = instance.id
        name = instance.name
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "status_updates",
            {
                "model":"service",
                "type": "send_status_update",
                "data": {
                    "service_id": service_id,
                    "name": name,
                    "event": "deleted",
                },
            }
        )
        instance.delete()

    def notify_status_change(self, service, event="updated"):
        """Broadcasts the service change to all connected WebSocket clients."""
        channel_layer = get_channel_layer()
        data = {
            "model":"service",
            "service_id": service.id,
            "name": service.name,
            "description":service.description,
            "event": event,
        }
        # if event != "deleted":
        #     data.update({
        #         "status": service.status,
        #         "updated_at": str(service.updated_at),
        #     })
        async_to_sync(channel_layer.group_send)(
            "status_updates",
            {
                "type": "send_status_update",  # Must match consumer method name
                "data": data,
            }
        )

@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    User.objects.create_user(username=username, password=password)
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)



class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        print("📢 Incident created:", instance.title)
        self.notify_incident_change(instance, event="created")

    def perform_update(self, serializer):
        original = self.get_object()
        instance = serializer.save()
        print("📢 Incident updated:", instance.title)

        if (
            original.status != instance.status or
            original.title != instance.title or
            original.description != instance.description
        ):
            self.notify_incident_change(instance, event="updated")

    def perform_destroy(self, instance):
        incident_id = instance.id
        title = instance.title
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "status_updates",
            {
                "model":"incident",
                "type": "send_incident_update",
                "data": {
                    "incident_id": incident_id,
                    "title": title,
                    "event": "deleted",
                },
            }
        )
        instance.delete()

    def notify_incident_change(self, incident, event="updated"):
        channel_layer = get_channel_layer()
        data = {
            "model":"incident",
            "incident_id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "status": incident.status,
            "updated_at": str(incident.updated_at),
            "event": event,
        }
        async_to_sync(channel_layer.group_send)(
            "status_updates",
            {
                "type": "send_incident_update",
                "data": data,
            }
        )


class IncidentUpdateViewSet(viewsets.ModelViewSet):
    queryset = IncidentUpdate.objects.all().order_by("-created_at")
    serializer_class = IncidentUpdateSerializer
