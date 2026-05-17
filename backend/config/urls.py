from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/students/', include('students.urls')),
    path('api/match/', include('matcher.urls')),
]
