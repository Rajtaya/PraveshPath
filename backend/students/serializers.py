from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'session_id', 'full_name', 'email', 'phone', 'gender',
            'date_of_birth', 'category', 'class_10_percentage', 'class_10_board',
            'class_12_percentage', 'class_12_board', 'class_12_stream',
            'class_12_subjects', 'preferred_stream', 'preferred_level',
            'preferred_districts', 'max_annual_fee', 'haryana_domicile',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
