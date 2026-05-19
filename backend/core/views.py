from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import University, Course, UniversityCourse
from .serializers import (
    UniversitySerializer, CourseSerializer,
    UniversityCourseListSerializer, UniversityCourseDetailSerializer,
)


class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = University.objects.filter(is_active=True)
    serializer_class = UniversitySerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['university_type', 'district']
    search_fields = ['name', 'short_name', 'city']


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['level', 'stream']
    search_fields = ['name', 'short_name']


class UniversityCourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UniversityCourse.objects.filter(
        is_active=True
    ).select_related('university', 'course')
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'course__stream', 'course__level', 'university__district',
        'university__university_type', 'university',
    ]
    search_fields = ['university__name', 'course__name']
    ordering_fields = ['annual_fee', 'total_seats']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UniversityCourseDetailSerializer
        return UniversityCourseListSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def platform_stats(request):
    return Response({
        'universities': University.objects.filter(is_active=True).count(),
        'programmes': Course.objects.filter(is_active=True).count(),
        'offerings': UniversityCourse.objects.filter(is_active=True).count(),
        'districts': University.objects.filter(is_active=True).values('district').distinct().count(),
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def universities_with_programmes(request):
    """Return universities that have courses at the given level, with programme list."""
    level = request.query_params.get('level', 'ug')
    universities = University.objects.filter(
        is_active=True,
        offered_courses__course__level=level,
        offered_courses__is_active=True,
    ).distinct()

    results = []
    for uni in universities:
        programmes = Course.objects.filter(
            level=level,
            universities__university=uni,
            universities__is_active=True,
        ).distinct().values_list('name', flat=True)
        results.append({
            'id': uni.id,
            'name': uni.name,
            'short_name': uni.short_name,
            'university_type': uni.university_type,
            'district': uni.district,
            'website': uni.website,
            'programme_count': len(programmes),
            'programmes': list(programmes),
        })

    results.sort(key=lambda x: (-x['programme_count'], x['name']))
    return Response(results)


@api_view(['GET'])
@permission_classes([AllowAny])
def university_programmes(request, uni_id):
    """Return programmes offered by a university for a given level."""
    level = request.query_params.get('level', 'ug')
    uc_list = UniversityCourse.objects.filter(
        university_id=uni_id,
        is_active=True,
        course__level=level,
    ).select_related('course').prefetch_related(
        'eligibility_criteria', 'admission_cycles',
    ).order_by('course__stream', 'course__name')

    results = []
    for uc in uc_list:
        cycle = uc.admission_cycles.filter(academic_year='2026-2027').first()
        criteria = uc.eligibility_criteria.first()
        results.append({
            'id': uc.id,
            'course_name': uc.course.name,
            'stream': uc.course.stream,
            'duration_years': str(uc.course.duration_years),
            'total_seats': uc.total_seats,
            'annual_fee': str(uc.annual_fee) if uc.annual_fee else None,
            'entrance_exam': criteria.entrance_exam if criteria else '',
            'status': cycle.status if cycle else 'unknown',
            'application_end': str(cycle.application_end) if cycle else None,
        })

    return Response(results)
