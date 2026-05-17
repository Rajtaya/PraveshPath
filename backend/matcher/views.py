from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from students.models import StudentProfile
from core.serializers import CollegeCourseDetailSerializer
from .engine import find_eligible_courses


@api_view(['GET'])
def match_results(request, session_id):
    try:
        profile = StudentProfile.objects.get(session_id=session_id)
    except StudentProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    eligible = find_eligible_courses(profile)
    serializer = CollegeCourseDetailSerializer(eligible, many=True)

    return Response({
        'profile': {
            'name': profile.full_name,
            'stream': profile.class_12_stream,
            '12th_percentage': str(profile.class_12_percentage),
            'category': profile.category,
        },
        'total_matches': eligible.count(),
        'results': serializer.data,
    })


@api_view(['POST'])
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
    import uuid

    data = request.data.copy()
    data['session_id'] = f"quick-{uuid.uuid4()}"
    data.setdefault('full_name', 'Quick Search')

    serializer = StudentProfileSerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    profile = serializer.save()
    eligible = find_eligible_courses(profile)
    result_serializer = CollegeCourseDetailSerializer(eligible, many=True)

    response_data = {
        'total_matches': eligible.count(),
        'results': result_serializer.data,
    }

    profile.delete()
    return Response(response_data)
