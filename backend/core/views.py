from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import University, College, Course, CollegeCourse
from .serializers import (
    UniversitySerializer, CollegeSerializer, CourseSerializer,
    CollegeCourseListSerializer, CollegeCourseDetailSerializer,
)


class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = University.objects.filter(is_active=True)
    serializer_class = UniversitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['university_type', 'district']
    search_fields = ['name', 'short_name', 'city']


class CollegeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = College.objects.filter(is_active=True).select_related('university')
    serializer_class = CollegeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['university', 'college_type', 'district', 'co_education', 'hostel_available']
    search_fields = ['name', 'city']


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['level', 'stream']
    search_fields = ['name', 'short_name']


class CollegeCourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CollegeCourse.objects.filter(
        is_active=True
    ).select_related('college', 'college__university', 'course')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'course__stream', 'course__level', 'college__district',
        'college__college_type', 'college__university',
    ]
    search_fields = ['college__name', 'course__name']
    ordering_fields = ['annual_fee', 'total_seats']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CollegeCourseDetailSerializer
        return CollegeCourseListSerializer
