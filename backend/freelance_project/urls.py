from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.middleware.csrf import get_token


def csrf(request):
    return JsonResponse({'message': 'CSRF cookie set', 'csrfToken': get_token(request)})
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/csrf/', csrf, name='csrf'),
    path('api/auth/', include('users.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/auth/', include('users.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)