from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'full_name', 'email', 'phone', 'gender',
            'date_of_birth', 'category', 'class_10_percentage', 'class_10_board',
            'class_12_percentage', 'class_12_board', 'class_12_stream',
            'class_12_subjects', 'preferred_stream', 'preferred_level',
            'preferred_districts', 'max_annual_fee', 'haryana_domicile',
            'created_at',
        ]
        read_only_fields = ['id', 'full_name', 'email', 'created_at']

    def get_full_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.email
        return ''

    def get_email(self, obj):
        if obj.user:
            return obj.user.email
        return ''
