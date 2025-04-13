# services/serializers.py

from rest_framework import serializers
from .models import Service, Incident, IncidentUpdate

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class IncidentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentUpdate
        fields = '__all__'


class IncidentSerializer(serializers.ModelSerializer):
    affected_services = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Service.objects.all()
    )

    class Meta:
        model = Incident
        fields = "__all__"
