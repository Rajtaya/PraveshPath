from django.db.models import Q, Prefetch
from core.models import CollegeCourse, EligibilityCriteria, AdmissionCycle


def find_eligible_courses(profile):
    """
    Given a StudentProfile, returns CollegeCourse queryset filtered by eligibility.
    Checks: stream, 10th/12th marks, budget, location, domicile, board.
    """
    base_qs = CollegeCourse.objects.filter(
        is_active=True,
        college__is_active=True,
        course__is_active=True,
    ).select_related(
        'college', 'college__university', 'course'
    ).prefetch_related(
        Prefetch(
            'admission_cycles',
            queryset=AdmissionCycle.objects.filter(academic_year='2026-2027')
        ),
        'eligibility_criteria',
        'required_documents__document',
    )

    if profile.preferred_level:
        base_qs = base_qs.filter(course__level=profile.preferred_level)

    if profile.preferred_stream:
        base_qs = base_qs.filter(
            Q(course__stream=profile.preferred_stream) |
            Q(course__stream='other')
        )

    if profile.max_annual_fee:
        base_qs = base_qs.filter(
            Q(annual_fee__lte=profile.max_annual_fee) |
            Q(annual_fee__isnull=True)
        )

    if profile.preferred_districts:
        districts = [d.strip().lower() for d in profile.preferred_districts.split(',') if d.strip()]
        if districts:
            base_qs = base_qs.filter(college__district__in=districts)

    eligible_ids = []
    for cc in base_qs:
        if _meets_criteria(cc, profile):
            eligible_ids.append(cc.id)

    return CollegeCourse.objects.filter(id__in=eligible_ids).select_related(
        'college', 'college__university', 'course'
    ).prefetch_related(
        Prefetch(
            'admission_cycles',
            queryset=AdmissionCycle.objects.filter(academic_year='2026-2027')
        ),
        'eligibility_criteria',
        'required_documents__document',
    )


def _meets_criteria(college_course, profile):
    criteria_set = college_course.eligibility_criteria.all()

    if not criteria_set:
        return True

    for criteria in criteria_set:
        if _check_single_criteria(criteria, profile):
            return True

    return False


def _check_single_criteria(criteria, profile):
    if criteria.min_10th_percentage and profile.class_10_percentage < criteria.min_10th_percentage:
        return False

    if criteria.min_12th_percentage and profile.class_12_percentage < criteria.min_12th_percentage:
        return False

    if criteria.required_stream and criteria.required_stream != profile.class_12_stream:
        return False

    if criteria.board_type != 'any':
        student_board = profile.class_12_board.lower()
        if criteria.board_type not in student_board:
            return False

    if criteria.domicile_required and not profile.haryana_domicile:
        return False

    if criteria.required_subjects:
        required = {s.strip().lower() for s in criteria.required_subjects.split(',')}
        student_subjects = {s.strip().lower() for s in profile.class_12_subjects.split(',')}
        if not required.issubset(student_subjects):
            return False

    return True
