from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        'name': 'CED Platform API',
        'version': '1.0',
        'endpoints': {
            'universities': '/api/universities/',
            'colleges': '/api/colleges/',
            'courses': '/api/courses/',
            'college_courses': '/api/college-courses/',
            'create_profile': '/api/students/profile/',
            'match_results': '/api/match/results/<session_id>/',
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
