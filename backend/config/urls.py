from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        'name': 'PraveshPath API',
        'version': '1.0',
        'endpoints': {
            'auth': {
                'register': '/api/students/auth/register/',
                'login': '/api/students/auth/login/',
                'me': '/api/students/auth/me/',
                'token_refresh': '/api/students/auth/token/refresh/',
            },
            'profile': {
                'create_or_update': '/api/students/profile/',
                'my_profile': '/api/students/profile/me/',
            },
            'universities': '/api/universities/',
            'courses': '/api/courses/',
            'university_courses': '/api/university-courses/',
            'browse_universities': '/api/browse/universities/',
            'match_results': '/api/match/results/',
            'quick_match': '/api/match/quick/',
        },
        'admin': '/admin/',
        'frontend': 'http://localhost:5173',
    })


urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/students/', include('students.urls')),
    path('api/match/', include('matcher.urls')),
]
