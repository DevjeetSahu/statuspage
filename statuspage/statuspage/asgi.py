import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
import services.routing  # adjust to your app name

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "statuspage.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            services.routing.websocket_urlpatterns
        )
    ),
})
