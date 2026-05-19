from django.conf import settings as django_settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .auth_serializers import RegisterSerializer, LoginSerializer, UserSerializer

User = get_user_model()


def _get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = _get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.validated_data['user']
        tokens = _get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login_view(request):
    credential = request.data.get('credential')
    if not credential:
        return Response({'error': 'Google credential is required.'}, status=status.HTTP_400_BAD_REQUEST)

    client_id = django_settings.GOOGLE_OAUTH_CLIENT_ID
    if not client_id:
        return Response({'error': 'Google OAuth is not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        idinfo = id_token.verify_oauth2_token(
            credential, google_requests.Request(), client_id
        )
    except ValueError:
        return Response({'error': 'Invalid Google token.'}, status=status.HTTP_400_BAD_REQUEST)

    email = idinfo['email'].lower()
    full_name = idinfo.get('name', '')
    parts = full_name.strip().split(' ', 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else ''

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=None,
            first_name=first_name,
            last_name=last_name,
        )
        from .models import StudentProfile
        StudentProfile.objects.create(user=user)

    tokens = _get_tokens_for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'tokens': tokens,
    })
