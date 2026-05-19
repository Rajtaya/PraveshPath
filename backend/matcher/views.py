from decimal import Decimal, InvalidOperation
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
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

    if not profile.highest_qualification:
        return Response({'error': 'Please complete your profile first', 'code': 'profile_incomplete'}, status=status.HTTP_400_BAD_REQUEST)

    eligible = find_eligible_courses(profile)
    serializer = UniversityCourseDetailSerializer(eligible, many=True)

    return Response({
        'profile': {
            'name': request.user.get_full_name(),
            'highest_qualification': profile.get_highest_qualification_display(),
            'stream': profile.class_12_stream or profile.graduation_stream or '',
            '12th_percentage': str(profile.class_12_percentage) if profile.class_12_percentage else '',
            'graduation_percentage': str(profile.graduation_percentage) if profile.graduation_percentage else '',
            'category': profile.category,
        },
        'total_matches': len(eligible),
        'results': serializer.data,
    })


def _safe_decimal(value, min_val=0, max_val=100):
    if value is None or value == '':
        return None
    try:
        d = Decimal(str(value))
        if d < min_val or d > max_val:
            return None
        return d
    except (InvalidOperation, ValueError):
        return None


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def quick_match(request):
    required = ['class_10_percentage', 'class_12_percentage', 'class_12_stream']
    for field in required:
        if field not in request.data:
            return Response(
                {'error': f'Missing required field: {field}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    data = request.data
    stream_choices = {c[0] for c in StudentProfile.Qualification.choices}
    stream = data.get('class_12_stream', '')

    profile = StudentProfile(
        highest_qualification=data.get('highest_qualification', 'higher_secondary'),
        class_10_percentage=_safe_decimal(data.get('class_10_percentage')),
        class_12_percentage=_safe_decimal(data.get('class_12_percentage')),
        class_12_stream=stream,
        class_12_board=data.get('class_12_board', ''),
        class_12_subjects=data.get('class_12_subjects', ''),
        graduation_percentage=_safe_decimal(data.get('graduation_percentage')),
        graduation_stream=data.get('graduation_stream', ''),
        category=data.get('category', 'general'),
        haryana_domicile=data.get('haryana_domicile', True),
        preferred_districts=data.get('preferred_districts', ''),
        max_annual_fee=_safe_decimal(data.get('max_annual_fee'), 0, 99999999),
    )

    eligible = find_eligible_courses(profile)
    result_serializer = UniversityCourseDetailSerializer(eligible, many=True)

    return Response({
        'total_matches': len(eligible),
        'results': result_serializer.data,
    })
