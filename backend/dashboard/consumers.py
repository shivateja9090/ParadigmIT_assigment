import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from datetime import datetime
import random

class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("dashboard", self.channel_name)
        await self.accept()
        
        # Send initial data
        await self.send_initial_data()
        
        # Start periodic updates
        asyncio.create_task(self.periodic_updates())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("dashboard", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'flag_risk':
            await self.handle_flag_risk(data)
        elif message_type == 'clarify_message':
            await self.handle_clarify_message(data)
        elif message_type == 'update_message':
            await self.handle_update_message(data)
        elif message_type == 'complete_action':
            await self.handle_complete_action(data)

    async def send_initial_data(self):
        data = await self.get_dashboard_data()
        await self.send(text_data=json.dumps({
            'type': 'initial_data',
            'data': data
        }))

    async def periodic_updates(self):
        while True:
            await asyncio.sleep(30)  # 30 seconds
            await self.send_alfred_insight()

    async def send_alfred_insight(self):
        insights = [
            {
                'title': 'Alfred Insight: Weather Alert',
                'message': 'Lightning detected within 10km radius. Recommend immediate shutdown of outdoor equipment.',
                'priority': 'high'
            },
            {
                'title': 'Alfred Insight: Performance Alert',
                'message': 'Solar panel efficiency dropped by 8% due to dust accumulation. Cleaning recommended.',
                'priority': 'medium'
            },
            {
                'title': 'Alfred Insight: Equipment Health',
                'message': 'Turbine #2 vibration levels normal. All systems operating within parameters.',
                'priority': 'low'
            },
            {
                'title': 'Alfred Insight: Predictive Maintenance',
                'message': 'Generator maintenance due in 48 hours. Parts ordered and team notified.',
                'priority': 'medium'
            }
        ]
        
        insight = random.choice(insights)
        await self.create_communication(insight)
        
        await self.send(text_data=json.dumps({
            'type': 'alfred_insight',
            'data': insight
        }))

    @database_sync_to_async
    def get_dashboard_data(self):
        from .serializers import ProjectSerializer, CommunicationSerializer, ActionSerializer
        from .models import Project, Communication, Action
        
        projects = Project.objects.all()
        communications = Communication.objects.all()
        actions = Action.objects.all()
        
        return {
            'projects': ProjectSerializer(projects, many=True).data,
            'communications': CommunicationSerializer(communications, many=True).data,
            'actions': ActionSerializer(actions, many=True).data,
        }

    @database_sync_to_async
    def create_communication(self, insight_data):
        from .models import Communication
        Communication.objects.create(
            title=insight_data['title'],
            message=insight_data['message'],
            priority=insight_data['priority']
        )

    async def handle_flag_risk(self, data):
        communication_id = data.get('communication_id')
        await self.log_action(f"Risk flagged for communication {communication_id}")
        
        await self.send(text_data=json.dumps({
            'type': 'risk_flagged',
            'message': f'Risk flagged for communication {communication_id}',
            'timestamp': datetime.now().isoformat()
        }))

    async def handle_clarify_message(self, data):
        communication_id = data.get('communication_id')
        await self.log_action(f"Clarification requested for communication {communication_id}")
        
        await self.send(text_data=json.dumps({
            'type': 'clarification_requested',
            'message': f'Clarification requested for communication {communication_id}',
            'timestamp': datetime.now().isoformat()
        }))

    async def handle_update_message(self, data):
        communication_id = data.get('communication_id')
        await self.log_action(f"Update requested for communication {communication_id}")
        
        await self.send(text_data=json.dumps({
            'type': 'update_requested',
            'message': f'Update requested for communication {communication_id}',
            'timestamp': datetime.now().isoformat()
        }))

    async def handle_complete_action(self, data):
        action_id = data.get('action_id')
        await self.log_action(f"Action {action_id} marked as complete")
        
        await self.send(text_data=json.dumps({
            'type': 'action_completed',
            'message': f'Action {action_id} marked as complete',
            'timestamp': datetime.now().isoformat()
        }))

    @database_sync_to_async
    def log_action(self, message):
        # In a real application, you would log to a database
        print(f"[{datetime.now()}] {message}") 