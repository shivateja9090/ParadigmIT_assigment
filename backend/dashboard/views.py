from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project, Communication, Action
from .serializers import ProjectSerializer, CommunicationSerializer, ActionSerializer

@api_view(['GET'])
def dashboard_data(request):
    projects = Project.objects.all()
    communications = Communication.objects.all()
    actions = Action.objects.all()
    
    data = {
        'projects': ProjectSerializer(projects, many=True).data,
        'communications': CommunicationSerializer(communications, many=True).data,
        'actions': ActionSerializer(actions, many=True).data,
    }
    
    return Response(data)

@api_view(['POST'])
def create_mock_data(request):
    # Clear existing data
    Project.objects.all().delete()
    Communication.objects.all().delete()
    Action.objects.all().delete()
    
    # Create sample projects with weather data
    Project.objects.create(
        name='Site Alpha Solar Farm',
        progress=40,
        capacity='150 MW',
        status='active',
        temperature='23°C',
        wind_speed='12 km/h',
        weather_condition='Clear'
    )
    Project.objects.create(
        name='Devra Wind Project',
        progress=42,
        capacity='50 MW',
        status='active',
        temperature='28°C',
        wind_speed='25 km/h',
        weather_condition='Partly Cloudy'
    )
    Project.objects.create(
        name='Mumbai Metro Extension',
        progress=65,
        capacity='25 KM',
        status='active',
        temperature='32°C',
        wind_speed='8 km/h',
        weather_condition='Sunny'
    )
    
    # Create realistic communications
    Communication.objects.create(
        title='Alfred Insight: Weather Alert',
        message='Heavy rainfall expected in Site Alpha region. Wind speeds may affect solar panel efficiency. Recommend temporary shutdown protocol.',
        priority='high'
    )
    Communication.objects.create(
        title='EPC Contractor Status Update',
        message='All contractors reporting on schedule. Material delivery confirmed for next week. No delays anticipated.',
        priority='low'
    )
    Communication.objects.create(
        title='Alfred Insight: Equipment Health',
        message='Turbine #3 showing 5% efficiency drop. Maintenance team dispatched. Expected resolution: 4 hours.',
        priority='medium'
    )
    Communication.objects.create(
        title='Safety Protocol Alert',
        message='New safety guidelines issued for high-voltage areas. All teams must complete training by Friday.',
        priority='high'
    )
    Communication.objects.create(
        title='EPC Contractor: Material Shortage',
        message='Steel supply delayed by 2 days due to logistics issue. Alternative supplier contacted.',
        priority='medium'
    )
    Communication.objects.create(
        title='Alfred Insight: Performance Optimization',
        message='Solar panel cleaning scheduled for tomorrow. Expected 15% efficiency improvement post-cleaning.',
        priority='low'
    )
    
    # Create sample actions
    Action.objects.create(
        title='Review Weather Impact Assessment',
        priority='high',
        assignedTo='Project Manager'
    )
    Action.objects.create(
        title='Approve Safety Training Schedule',
        priority='high',
        assignedTo='Safety Officer'
    )
    Action.objects.create(
        title='Coordinate Alternative Material Supply',
        priority='medium',
        assignedTo='Procurement Manager'
    )
    Action.objects.create(
        title='Schedule Turbine Maintenance',
        priority='medium',
        assignedTo='Maintenance Supervisor'
    )
    Action.objects.create(
        title='Update Project Timeline',
        priority='low',
        assignedTo='Project Coordinator'
    )
    
    return Response({'message': 'Mock data created successfully with weather information'}) 