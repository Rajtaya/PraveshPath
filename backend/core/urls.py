from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UniversityViewSet, CourseViewSet, UniversityCourseViewSet,
    universities_with_programmes, university_programmes,
)

router = DefaultRouter()
router.register('universities', UniversityViewSet)
router.register('courses', CourseViewSet)
router.register('university-courses', UniversityCourseViewSet)

urlpatterns = [
    path('browse/universities/', universities_with_programmes, name='browse-universities'),
    path('browse/universities/<int:uni_id>/programmes/', university_programmes, name='browse-uni-programmes'),
    path('', include(router.urls)),
]
