import json
import re
from django.core.management.base import BaseCommand
from core.models import (
    University, College, Course, CollegeCourse,
    EligibilityCriteria, AdmissionCycle, RequiredDocument, CollegeCourseDocument,
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
    'rewari': 'rewari',
    'gurugram': 'gurugram',
    'sonipat': 'sonipat',
    'sonepat': 'sonipat',
    'murthal, sonepat': 'sonipat',
    'murthal': 'sonipat',
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
    'palwal/gurugram': 'palwal',
    'panipat': 'panipat',
    'manesar': 'gurugram',
    'kundli': 'sonipat',
    'mullana': 'ambala',
}

UNI_TYPE_MAP = {
    'Central': 'central',
    'State': 'state',
    'State (Women)': 'state',
    'Private': 'private',
    'Private (Deemed)': 'deemed',
    'Deemed': 'deemed',
}

FIELD_TO_STREAM = {
    'Arts/Humanities': 'arts',
    'Commerce': 'commerce',
    'Science': 'science',
    'Science/IT': 'science',
    'Engineering': 'engineering',
    'Engineering/Skill': 'engineering',
    'Medical': 'medical',
    'Law': 'law',
    'Management': 'management',
    'Education': 'education',
    'IT/Computer': 'computer',
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
    'Veterinary': 'veterinary',
    'Sports Science': 'sports',
    'AYUSH': 'ayush',
    'Sanskrit/Arts': 'arts',
    'Skill/Vocational': 'other',
    'Neuroscience': 'science',
}

REQUIRED_STREAM_MAP = {
    'Any': '',
    'Any (Maths preferred)': '',
    'Any Bachelor\'s': '',
    'Any (post-grad)': '',
    'Any (relevant Bachelor\'s)': '',
    'Any (Sanskrit preferred)': 'arts',
    'Science-PCM': 'science',
    'Science-PCB': 'science',
    'Science-PCB/PCM': 'science',
    'Science-PCM/PCB': 'science',
    'Commerce / Any': '',
    'Relevant B.Sc': 'science',
    'Relevant B.Sc/B.Tech/MBBS': 'science',
    'B.Com / relevant': 'commerce',
    'BCA/B.Sc-CS/any+Maths': '',
    'B.E./B.Tech relevant': 'engineering',
    'Relevant Bachelor\'s': '',
    'Relevant UG': '',
    'MBBS': 'medical',
    'B.Pharm': 'pharmacy',
    'LLB': 'law',
    'Shastri/B.A.': 'arts',
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
        'Maharshi Dayanand University': 'MDU',
        'Guru Jambheshwar University of Sci & Tech': 'GJU',
        'Chaudhary Devi Lal University': 'CDLU',
        'Chaudhary Ranbir Singh University': 'CRSU',
        'Chaudhary Bansi Lal University': 'CBLU',
        'Indira Gandhi University': 'IGU',
        'Gurugram University': 'GU',
        'Bhagat Phool Singh Mahila Vishwavidyalaya': 'BPSMV',
        'Deenbandhu Chhotu Ram Univ of Sci & Tech': 'DCRUST',
        'J.C. Bose Univ of Sci & Tech, YMCA': 'JCBUST',
        'Choudhary Charan Singh Haryana Agri Univ': 'CCSHAU',
        'Maharana Pratap Horticultural University': 'MPHU',
        'Lala Lajpat Rai Univ of Vet & Animal Sci': 'LLRUVAS',
        'Pt. B.D. Sharma Univ of Health Sciences': 'UHSR',
        'Shri Krishna AYUSH University': 'SKAU',
        'Dr. B.R. Ambedkar National Law University': 'DBRANLU',
        'State Univ of Performing & Visual Arts': 'SUPVA',
        'Shri Vishwakarma Skill University': 'SVSU',
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
        'M.V.N. University': 'MVN',
        'Jagan Nath University': 'JNU-HR',
        'Al-Falah University': 'AFU',
        'NIILM University': 'NIILM',
        'Starex University': 'STAREX',
        'Om Sterling Global University': 'OSGU',
        'SRM University Haryana': 'SRM-HR',
        'Rishihood University': 'RU',
        'World University of Design': 'WUD',
        'IILM University': 'IILM',
        'Geeta University': 'GEETA',
        'Sanskaram University': 'SANSKARAM',
        'Shree Guru Gobind Singh Tricentenary Univ': 'SGGSTU',
        "Lingaya's Vidyapeeth": 'LV',
        'Maharishi Markandeshwar (Mullana)': 'MMU',
        'Manav Rachna Intl Inst of Research & Studies': 'MRIIRS',
        'National Brain Research Centre': 'NBRC',
        'National Dairy Research Institute': 'NDRI',
        'NIFTEM Kundli': 'NIFTEM',
    }
    return abbreviations.get(name, name[:10].upper().replace(' ', ''))


def parse_duration(dur_str):
    match = re.search(r'(\d+\.?\d*)', dur_str)
    if match:
        return float(match.group(1))
    return 3.0


class Command(BaseCommand):
    help = 'Import full Haryana dataset from JSON file'

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

        if options['clear']:
            self.stdout.write('Clearing existing data...')
            CollegeCourseDocument.objects.all().delete()
            AdmissionCycle.objects.all().delete()
            EligibilityCriteria.objects.all().delete()
            CollegeCourse.objects.all().delete()
            College.objects.all().delete()
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
        cc_count = 0

        for uni_data in data['universities']:
            uni_name = uni_data['name']
            city = uni_data['city']
            district = CITY_TO_DISTRICT.get(city.lower(), city.lower().split(',')[0].strip())
            short = make_short_name(uni_name)
            uni_type = UNI_TYPE_MAP.get(uni_data['type'], 'state')

            website = uni_data.get('website', '')
            if website and not website.startswith('http'):
                website = f'https://{website}'

            uni, created = University.objects.update_or_create(
                short_name=short,
                defaults={
                    'name': uni_name,
                    'university_type': uni_type,
                    'city': city,
                    'district': district,
                    'website': website,
                }
            )
            uni_count += 1

            college, _ = College.objects.update_or_create(
                name=f'{uni_name} (Main Campus)',
                university=uni,
                defaults={
                    'college_type': 'govt' if uni_type in ('state', 'central') else 'private',
                    'city': city,
                    'district': district,
                    'website': website,
                }
            )

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

                cc, cc_created = CollegeCourse.objects.get_or_create(
                    college=college,
                    course=course,
                )
                if cc_created:
                    cc_count += 1

                req_stream_raw = c.get('required_stream', '')
                req_stream = REQUIRED_STREAM_MAP.get(req_stream_raw, '')
                req_subjects = c.get('required_subjects', '')

                EligibilityCriteria.objects.get_or_create(
                    college_course=cc,
                    defaults={
                        'min_12th_percentage': 45.00 if level == 'ug' else None,
                        'required_stream': req_stream,
                        'required_subjects': req_subjects,
                    }
                )

                AdmissionCycle.objects.get_or_create(
                    college_course=cc,
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
                    CollegeCourseDocument.objects.get_or_create(
                        college_course=cc,
                        document=doc_obj,
                        defaults={'is_mandatory': mandatory}
                    )

                for optional_doc in ['Domicile Certificate', 'Category Certificate', 'Migration Certificate']:
                    doc_obj, _ = doc_map[optional_doc]
                    CollegeCourseDocument.objects.get_or_create(
                        college_course=cc,
                        document=doc_obj,
                        defaults={'is_mandatory': False}
                    )

        self.stdout.write(self.style.SUCCESS(
            f'\nImport complete!\n'
            f'  Universities: {uni_count}\n'
            f'  New courses:  {course_count}\n'
            f'  College-courses: {cc_count}\n'
            f'  Total in DB: {University.objects.count()} unis, '
            f'{Course.objects.count()} courses, '
            f'{CollegeCourse.objects.count()} college-courses, '
            f'{EligibilityCriteria.objects.count()} criteria'
        ))
