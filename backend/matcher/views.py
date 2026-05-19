from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from students.models import StudentProfile
from core.serializers import UniversityCourseDetailSerializer
from .engine import find_eligible_courses


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_results(request):
    try:
        profile = request.user.student_profile
    except StudentProfile.DoesNotExist:
        return Response({'error': 'Profile not found', 'code': 'profile_missing'}, status=status.HTTP_404_NOT_FOUND)

    if not profile.class_12_stream or not profile.class_12_percentage:
        return Response({'error': 'Please complete your profile first', 'code': 'profile_incomplete'}, status=status.HTTP_400_BAD_REQUEST)

    eligible = find_eligible_courses(profile)
    serializer = UniversityCourseDetailSerializer(eligible, many=True)

    return Response({
        'profile': {
            'name': request.user.get_full_name(),
            'stream': profile.class_12_stream,
            '12th_percentage': str(profile.class_12_percentage),
            'category': profile.category,
        },
        'total_matches': eligible.count(),
        'results': serializer.data,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def quick_match(request):
    """Match without saving a full profile — for anonymous/quick lookups."""
    required = ['class_10_percentage', 'class_12_percentage', 'class_12_stream']
    for field in required:
        if field not in request.data:
            return Response(
                {'error': f'Missing required field: {field}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    from students.serializers import StudentProfileSerializer

    data = request.data.copy()

    serializer = StudentProfileSerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Create a temporary profile (no user attached) for matching, then delete it
    profile = serializer.save()
    eligible = find_eligible_courses(profile)
    result_serializer = UniversityCourseDetailSerializer(eligible, many=True)

    response_data = {
        'total_matches': eligible.count(),
        'results': result_serializer.data,
    }

    profile.delete()
    return Response(response_data)
