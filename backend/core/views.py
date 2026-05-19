from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Count, Prefetch, Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import University, Course, UniversityCourse, AdmissionCycle
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
    ).select_related('university', 'course').prefetch_related(
        Prefetch(
            'admission_cycles',
            queryset=AdmissionCycle.objects.filter(academic_year='2026-2027'),
            to_attr='current_cycles',
        ),
    )
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

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == 'retrieve':
            qs = qs.prefetch_related(
                Prefetch(
                    'admission_cycles',
                    queryset=AdmissionCycle.objects.order_by('-academic_year'),
                ),
                'eligibility_criteria',
                'required_documents__document',
            )
        return qs


@api_view(['GET'])
@permission_classes([AllowAny])
def platform_stats(request):
    stats = University.objects.filter(is_active=True).aggregate(
        universities=Count('id'),
        districts=Count('district', distinct=True),
    )
    stats['programmes'] = Course.objects.filter(is_active=True).count()
    stats['offerings'] = UniversityCourse.objects.filter(is_active=True).count()
    return Response(stats)


@api_view(['GET'])
@permission_classes([AllowAny])
def universities_with_programmes(request):
    level = request.query_params.get('level', 'ug')
    universities = University.objects.filter(
        is_active=True,
        offered_courses__course__level=level,
        offered_courses__is_active=True,
    ).distinct().prefetch_related(
        Prefetch(
            'offered_courses',
            queryset=UniversityCourse.objects.filter(
                is_active=True, course__level=level,
            ).select_related('course'),
            to_attr='level_courses',
        ),
    )

    results = []
    for uni in universities:
        programmes = [uc.course.name for uc in uni.level_courses]
        results.append({
            'id': uni.id,
            'name': uni.name,
            'short_name': uni.short_name,
            'university_type': uni.university_type,
            'district': uni.district,
            'website': uni.website,
            'programme_count': len(programmes),
            'programmes': programmes,
        })

    results.sort(key=lambda x: (-x['programme_count'], x['name']))
    return Response(results)


@api_view(['GET'])
@permission_classes([AllowAny])
def university_programmes(request, uni_id):
    level = request.query_params.get('level', 'ug')
    uc_list = UniversityCourse.objects.filter(
        university_id=uni_id,
        is_active=True,
        course__level=level,
    ).select_related('course').prefetch_related(
        'eligibility_criteria',
        Prefetch(
            'admission_cycles',
            queryset=AdmissionCycle.objects.filter(academic_year='2026-2027'),
            to_attr='current_cycles',
        ),
    ).order_by('course__stream', 'course__name')

    results = []
    for uc in uc_list:
        cycle = uc.current_cycles[0] if uc.current_cycles else None
        criteria = uc.eligibility_criteria.all()
        first_criteria = criteria[0] if criteria else None
        results.append({
            'id': uc.id,
            'course_name': uc.course.name,
            'stream': uc.course.stream,
            'duration_years': str(uc.course.duration_years),
            'total_seats': uc.total_seats,
            'annual_fee': str(uc.annual_fee) if uc.annual_fee else None,
            'entrance_exam': first_criteria.entrance_exam if first_criteria else '',
            'status': cycle.status if cycle else 'unknown',
            'application_end': str(cycle.application_end) if cycle else None,
        })

    return Response(results)
