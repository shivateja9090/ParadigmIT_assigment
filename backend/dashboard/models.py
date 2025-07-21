from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=200)
    progress = models.IntegerField(default=0)
    capacity = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='active')
    temperature = models.CharField(max_length=10, default='23°C')
    wind_speed = models.CharField(max_length=10, default='12 km/h')
    weather_condition = models.CharField(max_length=20, default='Clear')
    lat = models.FloatField(default=28.6139)
    lng = models.FloatField(default=77.2090)

    def __str__(self):
        return self.name


class Communication(models.Model):
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, default='medium')

    def __str__(self):
        return self.title


class Action(models.Model):
    title = models.CharField(max_length=200)
    priority = models.CharField(max_length=10, default='medium')
    assignedTo = models.CharField(max_length=100)

    def __str__(self):
        return self.title 