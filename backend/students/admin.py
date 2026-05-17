from django.contrib import admin
from .models import StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'class_12_stream', 'class_12_percentage',
        'preferred_stream', 'category', 'created_at',
    ]
    list_filter = ['class_12_stream', 'category', 'haryana_domicile']
    search_fields = ['full_name', 'email', 'session_id']
    readonly_fields = ['session_id', 'created_at', 'updated_at']
