import json
import re
from django.core.management.base import BaseCommand
from core.models import (
    University, Course, UniversityCourse,
    EligibilityCriteria, AdmissionCycle, RequiredDocument, UniversityCourseDocument,
)

CITY_TO_DISTRICT = {
    'kurukshetra': 'kurukshetra',
    'rohtak': 'rohtak',
    'hisar': 'hisar',
    'sirsa': 'sirsa',
    'jind': 'jind',
    'bhiwani': 'bhiwani',
    'meerpur, rewari': 'rewari',
    'meerpur': 'rewari',
    'meerpur (rewari)': 'rewari',
    'rewari': 'rewari',
    'gurugram': 'gurugram',
    'sonipat': 'sonipat',
    'sonepat': 'sonipat',
    'murthal, sonepat': 'sonipat',
    'murthal': 'sonipat',
    'murthal (sonipat)': 'sonipat',
    'faridabad': 'faridabad',
    'mahendergarh': 'mahendragarh',
    'mahendragarh': 'mahendragarh',
    'karnal': 'karnal',
    'kaithal': 'kaithal',
    'ambala': 'ambala',
    'sohna': 'gurugram',
    'bahadurgarh': 'jhajjar',
    'jhajjar': 'jhajjar',
    'palwal': 'palwal',
    'palwal (dudhola)': 'palwal',
    'palwal/gurugram': 'palwal',
    'panipat': 'panipat',
    'manesar': 'gurugram',
    'kundli': 'sonipat',
    'mullana': 'ambala',
    'mullana (ambala)': 'ambala',
    'khanpur kalan (sonipat)': 'sonipat',
    'bahadurgarh (jhajjar)': 'jhajjar',
    'manesar (gurugram)': 'gurugram',
    'kundli (sonipat)': 'sonipat',
}

UNI_TYPE_MAP = {
    'Central': 'central',
    'Central · Multi-faculty': 'central',
    'State': 'state',
    'State (Women)': 'state',
    'State · Multi-faculty': 'state',
    'State · Sci & Tech': 'state',
    'State · Agriculture': 'state',
    'State · Health Sciences': 'state',
    'State · Veterinary': 'state',
    'State · Horticulture': 'state',
    'State · Law': 'state',
    'State · Performing/Visual Arts': 'state',
    'State · Sanskrit': 'state',
    'State · AYUSH/Health': 'state',
    'State · Skill univ': 'state',
    'State · Sports': 'state',
    "State · Women's univ": 'state',
    'Private': 'private',
    'Private (Deemed)': 'deemed',
    'Deemed': 'deemed',
    'Deemed (Govt)': 'deemed',
    'Deemed (Govt-aided)': 'deemed',
    'Deemed (Govt/ICAR)': 'deemed',
}

FIELD_TO_STREAM = {
    'Arts/Humanities': 'arts',
    'Commerce': 'commerce',
    'Science': 'science',
    'Science/IT': 'science',
    'Engineering': 'engineering',
    'Engineering/Skill': 'engineering',
    'Agri Engineering': 'agriculture',
    'Medical': 'medical',
    'Medicine': 'medical',
    'AYUSH Medicine': 'ayush',
    'Law': 'law',
    'Management': 'management',
    'Education': 'education',
    'IT/Computer': 'computer',
    'Computer Applications': 'computer',
    'Pharmacy': 'pharmacy',
    'Nursing': 'nursing',
    'Dental': 'dental',
    'Allied Health': 'medical',
    'Design': 'design',
    'Design/Fine Arts': 'design',
    'Fine/Performing Arts': 'design',
    'Dairy Tech': 'agriculture',
    'Dairy/Food Tech': 'agriculture',
    'Horticulture': 'agriculture',
    'Agriculture': 'agriculture',
    'Home/Community Sci': 'science',
    'Veterinary': 'veterinary',
    'Sports Science': 'sports',
    'AYUSH': 'ayush',
    'Sanskrit/Arts': 'arts',
    'Skill/Vocational': 'other',
    'Architecture': 'engineering',
    'Neuroscience': 'science',
    'Arts/Science': 'science',
    'Liberal Arts/Sci': 'arts',
    'Dairy Sci': 'agriculture',
    'Food Tech': 'agriculture',
    'Design/Arts': 'design',
}

REQUIRED_STREAM_MAP = {
    'Any': '',
    'Any (10+2)': '',
    'Any (Maths preferred)': '',
    "Any Bachelor's": '',
    'Any (post-grad)': '',
    "Any (relevant Bachelor's)": '',
    'Any (Sanskrit preferred)': 'arts',
    'Science-PCM': 'science',
    'Science-PCB': 'science',
    'Science-PCB/PCM': 'science',
    'Science-PCM/PCB': 'science',
    'Commerce': 'commerce',
    'Commerce / Any': '',
    'Relevant B.Sc': 'science',
    'Relevant B.Sc/B.Tech/MBBS': 'science',
    'B.Com / relevant': 'commerce',
    'BCA/B.Sc-CS/any+Maths': '',
    'B.E./B.Tech relevant': 'engineering',
    "Relevant Bachelor's": '',
    'Relevant UG': '',
    'MBBS': 'medical',
    'B.Pharm': 'pharmacy',
    'LLB': 'law',
    'Shastri/B.A.': 'arts',
}

ENTRANCE_EXAM_PATTERNS = {
    'JEE': 'JEE Main',
    'HSTES': 'HSTES',
    'NEET-UG': 'NEET UG',
    'NEET-PG': 'NEET PG',
    'NEET': 'NEET',
    'NATA': 'NATA',
    'CLAT': 'CLAT',
    'CLAT-PG': 'CLAT PG',
    'CAT': 'CAT/MAT/CMAT',
    'MAT': 'CAT/MAT/CMAT',
    'CMAT': 'CAT/MAT/CMAT',
    'HCMAT': 'CAT/MAT/CMAT',
    'ICAR': 'ICAR AIEEA',
    'AIAPGET': 'AIAPGET',
    'UCEED': 'UCEED',
    'AIEEA': 'ICAR AIEEA',
}

DOCUMENTS = [
    ('10th Marksheet', 'Original or attested copy of Class 10 marksheet', True),
    ('12th Marksheet', 'Original or attested copy of Class 12 marksheet', True),
    ('Character Certificate', 'From last attended institution', True),
    ('Migration Certificate', 'For students from other universities/boards', False),
    ('Domicile Certificate', 'Haryana domicile certificate', False),
    ('Category Certificate', 'SC/ST/BC/EWS certificate if applicable', False),
    ('Passport Size Photos', '4-6 recent passport size photographs', True),
    ('Aadhar Card', 'Copy of Aadhaar card', True),
    ('Income Certificate', 'For fee concession/scholarship', False),
    ('Gap Certificate', 'Affidavit if there is a gap in education', False),
    ('Graduation Marksheet', 'For PG admissions — all semester marksheets', True),
    ('Degree Certificate', 'For PG admissions — original degree', True),
]


def make_short_name(name):
    abbreviations = {
        'Central University of Haryana': 'CUH',
        'Kurukshetra University': 'KUK',
        'Kurukshetra University (KUK)': 'KUK',
        'Maharshi Dayanand University': 'MDU',
        'Maharshi Dayanand University (MDU)': 'MDU',
        'Guru Jambheshwar University of Sci & Tech': 'GJU',
        'Guru Jambheshwar Univ. of Sci & Tech (GJUST)': 'GJU',
        'Chaudhary Devi Lal University': 'CDLU',
        'Chaudhary Devi Lal University (CDLU)': 'CDLU',
        'Chaudhary Ranbir Singh University': 'CRSU',
        'Chaudhary Ranbir Singh University (CRSU)': 'CRSU',
        'Chaudhary Bansi Lal University': 'CBLU',
        'Chaudhary Bansi Lal University (CBLU)': 'CBLU',
        'Indira Gandhi University': 'IGU',
        'Indira Gandhi University (IGU)': 'IGU',
        'Gurugram University': 'GU',
        'Gurugram University (GU)': 'GU',
        'Bhagat Phool Singh Mahila Vishwavidyalaya': 'BPSMV',
        'Bhagat Phool Singh Mahila Vishwavidyalaya (BPSMV)': 'BPSMV',
        'Deenbandhu Chhotu Ram Univ of Sci & Tech': 'DCRUST',
        'Deenbandhu Chhotu Ram Univ. of Sci & Tech (DCRUST)': 'DCRUST',
        'J.C. Bose Univ of Sci & Tech, YMCA': 'JCBUST',
        'J.C. Bose Univ. of Sci & Tech, YMCA': 'JCBUST',
        'Choudhary Charan Singh Haryana Agri Univ': 'CCSHAU',
        'Chaudhary Charan Singh Haryana Agri. Univ. (CCSHAU)': 'CCSHAU',
        'Maharana Pratap Horticultural University': 'MPHU',
        'Maharana Pratap Horticultural University (MHU)': 'MPHU',
        'Lala Lajpat Rai Univ of Vet & Animal Sci': 'LLRUVAS',
        'Lala Lajpat Rai Univ. of Vet & Animal Sci (LUVAS)': 'LLRUVAS',
        'Pt. B.D. Sharma Univ of Health Sciences': 'UHSR',
        'Pt. Bhagwat Dayal Sharma Univ. of Health Sci (UHSR)': 'UHSR',
        'Shri Krishna AYUSH University': 'SKAU',
        'Dr. B.R. Ambedkar National Law University': 'DBRANLU',
        'State Univ of Performing & Visual Arts': 'SUPVA',
        'State Univ. of Performing & Visual Arts (PLCSUPVA)': 'SUPVA',
        'Shri Vishwakarma Skill University': 'SVSU',
        'Shri Vishwakarma Skill University (SVSU)': 'SVSU',
        'Maharishi Balmiki Sanskrit University': 'MBSU',
        'Sports University of Haryana': 'SUH',
        'O.P. Jindal Global University': 'JGU',
        'Ashoka University': 'ASHOKA',
        'Amity University Haryana': 'AMITY-HR',
        'Manav Rachna University': 'MRU',
        'SGT University': 'SGT',
        'BML Munjal University': 'BML',
        'K.R. Mangalam University': 'KRM',
        'G.D. Goenka University': 'GDG',
        'Apeejay Stya University': 'ASU',
        'Sushant University': 'SUSHANT',
        'The NorthCap University': 'NCU',
        'PDM University': 'PDM',
        'Baba Mast Nath University': 'BMNU',
        'Baba Mastnath University': 'BMNU',
        'M.V.N. University': 'MVN',
        'Jagan Nath University': 'JNU-HR',
        'Al-Falah University': 'AFU',
        'NIILM University': 'NIILM',
        'Starex University': 'STAREX',
        'Om Sterling Global University': 'OSGU',
        'SRM University Haryana': 'SRM-HR',
        'SRM University, Delhi-NCR': 'SRM-HR',
        'Rishihood University': 'RU',
        'World University of Design': 'WUD',
        'IILM University': 'IILM',
        'Geeta University': 'GEETA',
        'Sanskaram University': 'SANSKARAM',
        'Shree Guru Gobind Singh Tricentenary Univ': 'SGGSTU',
        "Lingaya's Vidyapeeth": 'LV',
        'Maharishi Markandeshwar (Mullana)': 'MMU',
        'Maharishi Markandeshwar University (MMU)': 'MMU',
        'Maharishi Markandeshwar (Deemed to be Univ.)': 'MMU-D',
        'Manav Rachna Intl Inst of Research & Studies': 'MRIIRS',
        'Manav Rachna Intl. Inst. of Research & Studies (MRIIRS)': 'MRIIRS',
        'National Brain Research Centre': 'NBRC',
        'National Brain Research Centre (NBRC)': 'NBRC',
        'National Dairy Research Institute': 'NDRI',
        'ICAR-National Dairy Research Institute (NDRI)': 'NDRI',
        'NIFTEM Kundli': 'NIFTEM',
        'NIFTEM-K (Nat. Inst. Food Tech, Entrepreneurship & Mgmt)': 'NIFTEM',
    }
    return abbreviations.get(name, name[:10].upper().replace(' ', ''))


def parse_duration(dur_str):
    match = re.search(r'(\d+\.?\d*)', dur_str)
    if match:
        return float(match.group(1))
    return 3.0


def extract_entrance_exam(subjects_text):
    if not subjects_text:
        return ''
    exams_found = []
    for keyword, exam_name in ENTRANCE_EXAM_PATTERNS.items():
        if keyword in subjects_text and exam_name not in exams_found:
            exams_found.append(exam_name)
    if 'entrance' in subjects_text.lower() and not exams_found:
        return 'Entrance exam required'
    return ', '.join(exams_found)


def detect_format(data):
    """Detect whether this is the old or new JSON format."""
    first_uni = data['universities'][0]
    if 'university' in first_uni:
        return 'v2'
    return 'v1'


class Command(BaseCommand):
    help = 'Import Haryana dataset from JSON file (supports v1 and v2 formats)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file', default='/tmp/ced_files/haryana_universities_courses.json',
            help='Path to JSON file'
        )
        parser.add_argument(
            '--clear', action='store_true',
            help='Clear existing data before import'
        )

    def handle(self, *args, **options):
        with open(options['file']) as f:
            data = json.load(f)

        fmt = detect_format(data)
        self.stdout.write(f'Detected format: {fmt}')

        if options['clear']:
            self.stdout.write('Clearing existing data...')
            UniversityCourseDocument.objects.all().delete()
            AdmissionCycle.objects.all().delete()
            EligibilityCriteria.objects.all().delete()
            UniversityCourse.objects.all().delete()
            Course.objects.all().delete()
            University.objects.all().delete()
            RequiredDocument.objects.all().delete()

        doc_map = {}
        for name, desc, mandatory in DOCUMENTS:
            doc, _ = RequiredDocument.objects.update_or_create(
                name=name, defaults={'description': desc}
            )
            doc_map[name] = (doc, mandatory)

        uni_count = 0
        course_count = 0
        uc_count = 0
        updated_count = 0

        for uni_data in data['universities']:
            if fmt == 'v2':
                uni_name = uni_data['university']
                city = uni_data['city']
                established = uni_data.get('established')
                ownership = uni_data.get('ownership', '')
            else:
                uni_name = uni_data['name']
                city = uni_data['city']
                established = uni_data.get('established')
                ownership = ''

            city_key = city.lower().strip()
            district = CITY_TO_DISTRICT.get(city_key)
            if not district:
                clean = re.sub(r'\(.*?\)', '', city_key).strip()
                district = CITY_TO_DISTRICT.get(clean, clean.split(',')[0].strip())

            short = make_short_name(uni_name)
            raw_type = uni_data.get('type', '')
            uni_type = UNI_TYPE_MAP.get(raw_type, '')
            if not uni_type:
                ownership_lower = ownership.lower()
                if 'deemed' in ownership_lower:
                    uni_type = 'deemed'
                elif 'private' in ownership_lower:
                    uni_type = 'private'
                elif 'central' in ownership_lower:
                    uni_type = 'central'
                else:
                    uni_type = 'state'

            website = uni_data.get('website', '')
            if website and not website.startswith('http'):
                website = f'https://{website}'

            uni_defaults = {
                'name': uni_name,
                'university_type': uni_type,
                'city': city,
                'district': district,
                'website': website,
            }
            if established:
                uni_defaults['established_year'] = int(established)

            uni, created = University.objects.update_or_create(
                short_name=short,
                defaults=uni_defaults,
            )
            uni_count += 1

            for c in uni_data['courses']:
                course_name = c['course']
                field = c['field']
                level = c['level'].lower()
                stream = FIELD_TO_STREAM.get(field, 'other')
                duration = parse_duration(c['duration'])

                short_course = course_name
                if len(short_course) > 30:
                    short_course = short_course[:30]

                course, created_c = Course.objects.get_or_create(
                    name=course_name,
                    level=level,
                    defaults={
                        'short_name': short_course,
                        'stream': stream,
                        'duration_years': duration,
                    }
                )
                if created_c:
                    course_count += 1

                uc, uc_created = UniversityCourse.objects.get_or_create(
                    university=uni,
                    course=course,
                )
                if uc_created:
                    uc_count += 1

                req_stream_raw = c.get('required_stream', '')
                req_stream = REQUIRED_STREAM_MAP.get(req_stream_raw, '')
                req_subjects = c.get('required_subjects', '')
                entrance = extract_entrance_exam(req_subjects)

                criteria_defaults = {
                    'min_12th_percentage': 45.00 if level == 'ug' else None,
                    'required_stream': req_stream,
                    'required_subjects': req_subjects,
                }
                if entrance:
                    criteria_defaults['entrance_exam'] = entrance

                criteria, crit_created = EligibilityCriteria.objects.update_or_create(
                    university_course=uc,
                    defaults=criteria_defaults,
                )
                if not crit_created:
                    updated_count += 1

                AdmissionCycle.objects.get_or_create(
                    university_course=uc,
                    academic_year='2026-2027',
                    defaults={
                        'application_start': '2026-06-01',
                        'application_end': '2026-07-31',
                        'status': 'upcoming',
                    }
                )

                ug_docs = [
                    '10th Marksheet', '12th Marksheet', 'Character Certificate',
                    'Passport Size Photos', 'Aadhar Card',
                ]
                pg_docs = [
                    '10th Marksheet', '12th Marksheet', 'Graduation Marksheet',
                    'Degree Certificate', 'Character Certificate',
                    'Passport Size Photos', 'Aadhar Card',
                ]
                base_docs = pg_docs if level == 'pg' else ug_docs

                for doc_name in base_docs:
                    doc_obj, mandatory = doc_map[doc_name]
                    UniversityCourseDocument.objects.get_or_create(
                        university_course=uc,
                        document=doc_obj,
                        defaults={'is_mandatory': mandatory}
                    )

                for optional_doc in ['Domicile Certificate', 'Category Certificate', 'Migration Certificate']:
                    doc_obj, _ = doc_map[optional_doc]
                    UniversityCourseDocument.objects.get_or_create(
                        university_course=uc,
                        document=doc_obj,
                        defaults={'is_mandatory': False}
                    )

        self.stdout.write(self.style.SUCCESS(
            f'\nImport complete!\n'
            f'  Universities: {uni_count} (format: {fmt})\n'
            f'  New courses:  {course_count}\n'
            f'  University-courses: {uc_count} new\n'
            f'  Criteria updated: {updated_count}\n'
            f'  Total in DB: {University.objects.count()} unis, '
            f'{Course.objects.count()} courses, '
            f'{UniversityCourse.objects.count()} university-courses, '
            f'{EligibilityCriteria.objects.count()} criteria'
        ))
