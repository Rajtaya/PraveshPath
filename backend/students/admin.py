from django.contrib import admin
from .models import StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = [
        '__str__', 'class_12_stream', 'class_12_percentage',
        'preferred_stream', 'category', 'created_at',
    ]
    list_filter = ['class_12_stream', 'category', 'haryana_domicile']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'phone']
    readonly_fields = ['user', 'created_at', 'updated_at']
