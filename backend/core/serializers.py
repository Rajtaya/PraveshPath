from rest_framework import serializers
from .models import (
    University, Course, UniversityCourse,
    EligibilityCriteria, AdmissionCycle, RequiredDocument, UniversityCourseDocument,
)


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = [
            'id', 'name', 'short_name', 'university_type', 'city',
            'district', 'website', 'admission_portal', 'established_year',
            'naac_grade', 'nirf_rank',
        ]


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'short_name', 'level', 'stream', 'duration_years']


class EligibilityCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibilityCriteria
        fields = [
            'min_10th_percentage', 'min_12th_percentage', 'required_stream',
            'required_subjects', 'board_type', 'min_age', 'max_age',
            'entrance_exam', 'domicile_required', 'category_reservation',
        ]


class AdmissionCycleSerializer(serializers.ModelSerializer):
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionCycle
        fields = [
            'academic_year', 'application_start', 'application_end',
            'application_link', 'application_fee', 'status',
            'counselling_date', 'merit_list_date', 'days_remaining', 'notes',
        ]

    def get_days_remaining(self, obj):
        from django.utils import timezone
        if obj.status == AdmissionCycle.Status.OPEN:
            delta = obj.application_end - timezone.now().date()
            return max(0, delta.days)
        return None


class DocumentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='document.name')
    description = serializers.CharField(source='document.description')

    class Meta:
        model = UniversityCourseDocument
        fields = ['name', 'description', 'is_mandatory']


class UniversityCourseDetailSerializer(serializers.ModelSerializer):
    university = UniversitySerializer()
    course = CourseSerializer()
    eligibility = EligibilityCriteriaSerializer(source='eligibility_criteria', many=True)
    admission_cycles = AdmissionCycleSerializer(many=True)
    documents = DocumentSerializer(source='required_documents', many=True)

    class Meta:
        model = UniversityCourse
        fields = [
            'id', 'university', 'course', 'total_seats', 'annual_fee',
            'eligibility', 'admission_cycles', 'documents',
        ]


class UniversityCourseListSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.name')
    university_short_name = serializers.CharField(source='university.short_name')
    university_district = serializers.CharField(source='university.district')
    university_type = serializers.CharField(source='university.university_type')
    university_website = serializers.URLField(source='university.website', read_only=True)
    course_name = serializers.CharField(source='course.name')
    course_stream = serializers.CharField(source='course.stream')
    course_level = serializers.CharField(source='course.level')
    current_status = serializers.SerializerMethodField()
    application_deadline = serializers.SerializerMethodField()

    class Meta:
        model = UniversityCourse
        fields = [
            'id', 'university_name', 'university_short_name',
            'university_district', 'university_type', 'university_website',
            'course_name', 'course_stream', 'course_level', 'total_seats',
            'annual_fee', 'current_status', 'application_deadline',
        ]

    def get_current_status(self, obj):
        cycle = obj.admission_cycles.filter(academic_year='2026-2027').first()
        return cycle.status if cycle else 'unknown'

    def get_application_deadline(self, obj):
        cycle = obj.admission_cycles.filter(academic_year='2026-2027').first()
        return cycle.application_end if cycle else None
