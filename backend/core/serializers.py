from rest_framework import serializers
from .models import (
    University, College, Course, CollegeCourse,
    EligibilityCriteria, AdmissionCycle, RequiredDocument, CollegeCourseDocument,
)


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = [
            'id', 'name', 'short_name', 'university_type', 'city',
            'district', 'website', 'admission_portal', 'established_year',
            'naac_grade', 'nirf_rank',
        ]


class CollegeSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.short_name', read_only=True)

    class Meta:
        model = College
        fields = [
            'id', 'name', 'university', 'university_name', 'college_type',
            'city', 'district', 'website', 'naac_grade', 'co_education',
            'hostel_available',
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
        model = CollegeCourseDocument
        fields = ['name', 'description', 'is_mandatory']


class CollegeCourseDetailSerializer(serializers.ModelSerializer):
    college = CollegeSerializer()
    course = CourseSerializer()
    eligibility = EligibilityCriteriaSerializer(source='eligibility_criteria', many=True)
    admission_cycles = AdmissionCycleSerializer(many=True)
    documents = DocumentSerializer(source='required_documents', many=True)

    class Meta:
        model = CollegeCourse
        fields = [
            'id', 'college', 'course', 'total_seats', 'annual_fee',
            'eligibility', 'admission_cycles', 'documents',
        ]


class CollegeCourseListSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name')
    college_city = serializers.CharField(source='college.city')
    college_district = serializers.CharField(source='college.district')
    college_type = serializers.CharField(source='college.college_type')
    university_name = serializers.CharField(source='college.university.short_name')
    course_name = serializers.CharField(source='course.name')
    course_stream = serializers.CharField(source='course.stream')
    course_level = serializers.CharField(source='course.level')
    current_status = serializers.SerializerMethodField()
    application_deadline = serializers.SerializerMethodField()

    class Meta:
        model = CollegeCourse
        fields = [
            'id', 'college_name', 'college_city', 'college_district',
            'college_type', 'university_name', 'course_name', 'course_stream',
            'course_level', 'total_seats', 'annual_fee', 'current_status',
            'application_deadline',
        ]

    def get_current_status(self, obj):
        cycle = obj.admission_cycles.filter(academic_year='2026-2027').first()
        return cycle.status if cycle else 'unknown'

    def get_application_deadline(self, obj):
        cycle = obj.admission_cycles.filter(academic_year='2026-2027').first()
        return cycle.application_end if cycle else None
