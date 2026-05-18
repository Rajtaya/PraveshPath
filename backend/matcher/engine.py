import re
from django.db.models import Q, Prefetch
from core.models import UniversityCourse, EligibilityCriteria, AdmissionCycle


def find_eligible_courses(profile):
    """
    Given a StudentProfile, returns UniversityCourse queryset filtered by eligibility.
    Checks: stream, 10th/12th marks, budget, location, domicile, board.
    """
    base_qs = UniversityCourse.objects.filter(
        is_active=True,
        university__is_active=True,
        course__is_active=True,
    ).select_related(
        'university', 'course'
    ).prefetch_related(
        Prefetch(
            'admission_cycles',
            queryset=AdmissionCycle.objects.order_by('-academic_year')
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
        districts = [d.strip() for d in profile.preferred_districts.split(',') if d.strip()]
        if districts:
            base_qs = base_qs.filter(university__district__in=districts)

    eligible_ids = []
    for uc in base_qs:
        if _meets_criteria(uc, profile):
            eligible_ids.append(uc.id)

    return UniversityCourse.objects.filter(id__in=eligible_ids).select_related(
        'university', 'course'
    ).prefetch_related(
        Prefetch(
            'admission_cycles',
            queryset=AdmissionCycle.objects.order_by('-academic_year')
        ),
        'eligibility_criteria',
        'required_documents__document',
    )


def _meets_criteria(university_course, profile):
    criteria_set = university_course.eligibility_criteria.all()

    if not criteria_set:
        return True

    for criteria in criteria_set:
        if _check_single_criteria(criteria, profile):
            return True

    return False


SKIP_SUBJECT_PHRASES = {
    'any', 'any 10+2', 'any 10+2 subjects', 'preferred', 'maths preferred',
    'maths required', 'accountancy/maths preferred', "bachelor's degree",
    "bachelor's any stream", 'relevant ug', 'relevant ug subject',
    'maths at ug or 10+2', 'b.com preferred', "relevant bachelor's",
    'any with maths', 'any subjects', 'none specific',
    "any bachelor's; entrance", "any bachelor's; entrance (cat/mat/cmat/hcmat)",
    "bachelor's + entrance", "bachelor's in relevant subject",
    "bachelor's with maths (10+2 or grad)", "b.com / relevant bachelor's",
    "b.sc in relevant subject", "b.sc agri/relevant", "b.sc horti/agri",
    "relevant bachelor's", "relevant bachelor's + trial",
    "relevant bachelor's/b.voc", "shastri/relevant bachelor's",
    "any stream + sports proficiency/fitness test",
    "any stream at 10+2 + clat", "any stream at 10+2 + aptitude/portfolio",
    "any stream; sanskrit background preferred",
    "mathematics/cs preferred (univ-specific)",
    "commerce/accountancy at 10+2 (or any per univ.)",
    "stream depends on trade: tech trades expect pcm", "trade-dependent",
    "ll.b + clat-pg", "mbbs + neet-pg", "bams + aiapget", "b.v.sc",
    "science stream at 10+2",
    "pcb or pcm/agriculture at 10+2; icar/entrance",
    "maths at 10+2 + nata", "maths at 10+2 + nata/jee-paper2",
    "pcm at 10+2; entrance",
    "any stream", "any stream + ashoka aptitude/holistic admission",
    "any stream + clat/own entrance",
    "any stream + design aptitude (uceed/own test) + portfolio",
    "any bachelor's; cat/mat/own entrance",
    "none specific; own entrance/merit",
    "b.com/relevant bachelor's", "bachelor's with maths",
    "maths/cs preferred (univ-specific)",
    "commerce at 10+2 (or any per univ.)",
    "b.sc/b.tech/mbbs relevant + entrance",
    "relevant bachelor's + entrance", "relevant bachelor's + portfolio",
    "relevant bachelor's + icar",
    "master's relevant + entrance", "master's relevant + entrance/interview",
    "master's relevant + icar",
    "science stream as relevant to major",
}

KNOWN_SUBJECTS = {
    'physics', 'chemistry', 'math', 'maths', 'mathematics',
    'biology', 'english', 'hindi', 'economics', 'accountancy',
    'business studies', 'computer science', 'physical education',
    'history', 'geography', 'political science', 'sociology',
    'psychology', 'sanskrit', 'home science', 'biotechnology',
    'commerce',
}


def _extract_subjects(text):
    """Extract actual subject names from a requirement string, ignoring noise."""
    clean = re.sub(r'\+\s*(entrance|neet|jee|nata|hstes|icar).*', '', text, flags=re.IGNORECASE)
    clean = re.sub(r';\s*entrance.*', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\(.*?\)', '', clean)
    parts = re.split(r'[,+]', clean)
    subjects = set()
    for p in parts:
        s = p.strip().lower()
        if s in KNOWN_SUBJECTS:
            subjects.add(s)
        elif s == 'cs':
            subjects.add('computer science')
        elif s == 'biotech':
            subjects.add('biotechnology')
    return subjects


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

    if criteria.required_subjects and profile.class_12_subjects:
        req_text = criteria.required_subjects.strip().lower()
        if req_text not in SKIP_SUBJECT_PHRASES:
            required = _extract_subjects(req_text)
            if required:
                student_subjects = {s.strip().lower() for s in profile.class_12_subjects.split(',')}
                norm_student = set()
                for s in student_subjects:
                    norm_student.add(s)
                    if s in ('math', 'mathematics'):
                        norm_student.add('maths')
                    if s == 'maths':
                        norm_student.add('math')
                        norm_student.add('mathematics')
                if not required.issubset(norm_student):
                    return False

    return True
