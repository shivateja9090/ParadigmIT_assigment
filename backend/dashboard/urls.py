from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_data),
    path('create-mock-data/', views.create_mock_data),
] 