import uuid
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import StudentProfile
from .serializers import StudentProfileSerializer


@api_view(['POST'])
def create_profile(request):
    data = request.data.copy()
    if 'session_id' not in data:
        data['session_id'] = str(uuid.uuid4())

    serializer = StudentProfileSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
def profile_detail(request, session_id):
    try:
        profile = StudentProfile.objects.get(session_id=session_id)
    except StudentProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)

    serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
