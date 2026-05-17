from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UniversityViewSet, CollegeViewSet, CourseViewSet, CollegeCourseViewSet

router = DefaultRouter()
router.register('universities', UniversityViewSet)
router.register('colleges', CollegeViewSet)
router.register('courses', CourseViewSet)
router.register('college-courses', CollegeCourseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
