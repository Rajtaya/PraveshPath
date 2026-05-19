import re
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=True, min_length=2)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True, max_length=15)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def validate_phone(self, value):
        cleaned = re.sub(r'[\s\-]', '', value)
        if not re.match(r'^(\+91)?[6-9]\d{9}$', cleaned):
            raise serializers.ValidationError(
                'Enter a valid Indian phone number (10 digits starting with 6-9).'
            )
        return cleaned

    def validate_password(self, value):
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError('Password must contain at least 1 uppercase letter.')
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError('Password must contain at least 1 lowercase letter.')
        if not re.search(r'\d', value):
            raise serializers.ValidationError('Password must contain at least 1 digit.')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError('Password must contain at least 1 special character.')
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        phone = validated_data.pop('phone')
        full_name = validated_data.pop('full_name')
        email = validated_data['email']
        password = validated_data['password']

        parts = full_name.strip().split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        # Create a StudentProfile stub with the phone number
        from .models import StudentProfile
        StudentProfile.objects.create(user=user, phone=phone)

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, data):
        user = authenticate(
            request=self.context.get('request'),
            email=data['email'],
            password=data['password'],
        )
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        data['user'] = user
        return data


class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    full_name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_phone(self, obj):
        profile = getattr(obj, 'student_profile', None)
        return profile.phone if profile else ''
