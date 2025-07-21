from rest_framework import serializers
from .models import Project, Communication, Action

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'progress', 'capacity', 'status', 'temperature', 'wind_speed', 'weather_condition', 'lat', 'lng']

class CommunicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Communication
        fields = '__all__'

class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = '__all__' 