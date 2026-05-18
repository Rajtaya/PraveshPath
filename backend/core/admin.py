from django.contrib import admin
from .models import (
    University, Course, UniversityCourse,
    EligibilityCriteria, AdmissionCycle, RequiredDocument, UniversityCourseDocument,
)


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_name', 'university_type', 'city', 'naac_grade', 'is_active']
    list_filter = ['university_type', 'district', 'is_active']
    search_fields = ['name', 'short_name', 'city']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_name', 'level', 'stream', 'duration_years']
    list_filter = ['level', 'stream']
    search_fields = ['name', 'short_name']


class EligibilityCriteriaInline(admin.TabularInline):
    model = EligibilityCriteria
    extra = 1


class AdmissionCycleInline(admin.TabularInline):
    model = AdmissionCycle
    extra = 1


class UniversityCourseDocumentInline(admin.TabularInline):
    model = UniversityCourseDocument
    extra = 1


@admin.register(UniversityCourse)
class UniversityCourseAdmin(admin.ModelAdmin):
    list_display = ['university', 'course', 'total_seats', 'annual_fee', 'is_active']
    list_filter = ['course__stream', 'course__level', 'university__district']
    search_fields = ['university__name', 'course__name']
    inlines = [EligibilityCriteriaInline, AdmissionCycleInline, UniversityCourseDocumentInline]


@admin.register(AdmissionCycle)
class AdmissionCycleAdmin(admin.ModelAdmin):
    list_display = ['university_course', 'academic_year', 'application_start', 'application_end', 'status']
    list_filter = ['status', 'academic_year']


@admin.register(RequiredDocument)
class RequiredDocumentAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
