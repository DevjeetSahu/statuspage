# services/models.py

from django.db import models
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class Service(models.Model):
    STATUS_CHOICES = [
        ("operational", "Operational"),
        ("degraded", "Degraded Performance"),
        ("partial_outage", "Partial Outage"),
        ("major_outage", "Major Outage"),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="operational")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_name = self.name
        self._original_description = self.description
        self._original_status = self.status

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        should_notify = (
            is_new or
            self.status != self._original_status or
            self.name != self._original_name or
            self.description != self._original_description
        )

        if should_notify:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "status_updates",  # group name
                {
                    "type": "send_status_update",
                    "data": {
                        "type": "service_created" if is_new else "service_update",
                        "id": self.id,
                        "name": self.name,
                        "description": self.description,
                        "status": self.status,
                        "updated_at": str(self.updated_at),
                    },
                },
            )

        # Update original values after saving
        self._original_name = self.name
        self._original_description = self.description
        self._original_status = self.status
  

    def __str__(self):
        return self.name
    
class Incident(models.Model):
    STATUS_CHOICES = [
        ("investigating", "Investigating"),
        ("identified", "Identified"),
        ("monitoring", "Monitoring"),
        ("resolved", "Resolved"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="investigating")
    affected_services = models.ManyToManyField("Service", related_name="incidents")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.title


class IncidentUpdate(models.Model):
    incident = models.ForeignKey(Incident, related_name="updates", on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Update for {self.incident.title} at {self.created_at}"
