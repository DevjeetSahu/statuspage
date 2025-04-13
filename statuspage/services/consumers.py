# services/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Add this connection to the "status_updates" group:
        await self.channel_layer.group_add("status_updates", self.channel_name)
        await self.accept()
        print("✅ WebSocket connected:", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("status_updates", self.channel_name)
        print("🔌 WebSocket disconnected:", close_code)

    # This method is called by group_send(). Its name MUST match the "type" value.
    async def send_status_update(self, event):
        # event["data"] should contain the updated service information.
        print("📨 Broadcasting update to client:", event["data"])
        await self.send(text_data=json.dumps(event["data"]))

    
