import json
import re
from django.core.management.base import BaseCommand
from core.models import (
    University, Course, UniversityCourse,
    EligibilityCriteria, AdmissionCycle, RequiredDocument, UniversityCourseDocument,
)

UNI_SHORT_NAMES = {
    'Kurukshetra University, Kurukshetra': 'KUK',
    'Maharshi Dayanand University, Rohtak': 'MDU',
    'Guru Jambheshwar Univ. of Sci & Tech (GJUST), Hisar': 'GJU',
    'Central University of Haryana, Mahendergarh': 'CUH',
    'Chaudhary Devi Lal University, Sirsa': 'CDLU',
    'Ch. Ranbir Singh University, Jind': 'CRSU',
    'Ch. Bansi Lal University, Bhiwani': 'CBLU',
    'Indira Gandhi University, Meerpur (Rewari)': 'IGU',
    'Gurugram University, Gurugram': 'GU',
    'BPS Mahila Vishwavidyalaya, Khanpur Kalan': 'BPSMV',
    'Deenbandhu Chhotu Ram Univ. of Sci & Tech, Murthal': 'DCRUST',
    'J.C. Bose Univ. of Sci & Tech YMCA, Faridabad': 'JCBUST',
    'Chaudhary Charan Singh Haryana Agricultural Univ., Hisar': 'CCSHAU',
    'Lala Lajpat Rai Univ. of Veterinary & Animal Sci., Hisar': 'LUVAS',
    'Pandit B.D. Sharma Univ. of Health Sciences, Rohtak': 'UHSR',
    'Shri Vishwakarma Skill University, Palwal': 'SVSU',
    'Sports University of Haryana, Sonipat': 'SUH',
    'State Univ. of Performing & Visual Arts, Rohtak': 'SUPVA',
    'Pt. Lakhmi Chand State Univ. of Perf. & Visual Arts, Rohtak': 'SUPVA',
    'O.P. Jindal Global University, Sonipat': 'JGU',
    'Ashoka University, Sonipat': 'ASHOKA',
    'Amity University, Gurugram': 'AMITY-HR',
    'Manav Rachna University, Faridabad': 'MRU',
    'SGT University, Gurugram': 'SGT',
    'BML Munjal University, Gurugram': 'BML',
    'K.R. Mangalam University, Gurugram': 'KRM',
    'G.D. Goenka University, Gurugram': 'GDG',
    'Apeejay Stya University, Gurugram': 'ASU',
    'The NorthCap University, Gurugram': 'NCU',
    'PDM University, Bahadurgarh': 'PDM',
    'Baba Mastnath University, Rohtak': 'BMNU',
    'MVN University, Palwal': 'MVN',
    'Jagannath University, Bahadurgarh': 'JNU-HR',
    'Al-Falah University, Faridabad': 'AFU',
    'NIILM University, Kaithal': 'NIILM',
    'Starex University, Gurugram': 'STAREX',
    'OM Sterling Global University, Hisar': 'OSGU',
    'Rishihood University, Sonipat': 'RU',
    'World University of Design, Sonipat': 'WUD',
    'Geeta University, Panipat': 'GEETA',
    'Manav Rachna International Institute, Faridabad': 'MRIIRS',
    'NDRI Karnal (deemed, dairy)': 'NDRI',
    'National Brain Research Centre (deemed, no UG)': 'NBRC',
    'Ansal University, Gurugram': 'ANSAL',
    "Lingaya's Vidyapeeth, Faridabad": 'LV',
    "Lingaya's University/related, Faridabad": 'LV',
    'National Law University, Sonipat (NLU Delhi is separate)': 'DBRANLU',
    'Kalpana Chawla Medical University (proposed/health)': 'KCMU',
}

UNI_TYPE_MAP = {
    'State': 'state',
    'State (Women)': 'state',
    'State (Tech)': 'state',
    'State (Agri)': 'state',
    'State (Health)': 'state',
    'State (Vet)': 'state',
    'State (Law)': 'state',
    'State (Skill)': 'state',
    'State (Sports)': 'state',
    'State (Arts)': 'state',
    'Central': 'central',
    'Private': 'private',
    'Deemed': 'deemed',
}

CITY_TO_DISTRICT = {
    'kurukshetra': 'kurukshetra',
    'rohtak': 'rohtak',
    'hisar': 'hisar',
    'sirsa': 'sirsa',
    'jind': 'jind',
    'bhiwani': 'bhiwani',
    'meerpur (rewari)': 'rewari',
    'meerpur': 'rewari',
    'rewari': 'rewari',
    'gurugram': 'gurugram',
    'sonipat': 'sonipat',
    'sonepat': 'sonipat',
    'murthal': 'sonipat',
    'faridabad': 'faridabad',
    'mahendergarh': 'mahendragarh',
    'mahendragarh': 'mahendragarh',
    'karnal': 'karnal',
    'kaithal': 'kaithal',
    'ambala': 'ambala',
    'bahadurgarh': 'jhajjar',
    'palwal': 'palwal',
    'panipat': 'panipat',
    'khanpur kalan': 'sonipat',
}

STREAM_KEYWORDS = {
    'B.A.': 'arts', 'M.A.': 'arts', 'Shastri': 'arts',
    'B.Com': 'commerce', 'M.Com': 'commerce',
    'B.Sc': 'science', 'M.Sc': 'science',
    'B.Tech': 'engineering', 'M.Tech': 'engineering', 'B.E.': 'engineering',
    'MBBS': 'medical', 'B.Pharm': 'pharmacy', 'M.Pharm': 'pharmacy',
    'BCA': 'computer', 'MCA': 'computer',
    'BBA': 'management', 'MBA': 'management', 'BMS': 'management', 'BHM': 'management',
    'B.Ed': 'education', 'M.Ed': 'education',
    'LL.B': 'law', 'LL.M': 'law', 'BA LL.B': 'law',
    'B.Voc': 'other', 'Diploma': 'other',
    'BFA': 'design', 'MFA': 'design', 'B.Des': 'design',
    'Nursing': 'nursing', 'B.Sc Nursing': 'nursing',
    'B.V.Sc': 'veterinary',
    'BAMS': 'ayush', 'BHMS': 'ayush',
}

SKIP_UNIS = {
    'Ch. Devi Lal Univ. note / others (state)',
    'Haryana (other state university placeholder)',
    'GNA/other private university placeholder',
    'Sat Kabir University / SRM-type (private)',
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
]


def guess_stream(programme_name):
    for keyword, stream in STREAM_KEYWORDS.items():
        if keyword in programme_name:
            return stream
    return 'other'


def extract_city(uni_name):
    match = re.search(r',\s*(.+?)(?:\s*\(.*\))?$', uni_name)
    if match:
        return match.group(1).strip()
    return ''


def parse_eligibility(elig_text):
    result = {
        'min_12th': None,
        'required_stream': '',
        'required_subjects': '',
        'entrance_exam': '',
    }
    if not elig_text:
        return result

    pct_match = re.search(r'(\d+)%', elig_text)
    if pct_match:
        result['min_12th'] = int(pct_match.group(1))

    lower = elig_text.lower()
    if 'science' in lower and ('pcm' in lower or 'pcb' in lower):
        result['required_stream'] = 'science'
    elif 'commerce' in lower:
        result['required_stream'] = 'commerce'

    for exam in ['NEET', 'JEE', 'CLAT', 'NATA', 'CAT', 'MAT', 'HSTES', 'ICAR', 'NCET', 'CUET']:
        if exam in elig_text.upper():
            result['entrance_exam'] = exam
            break
    if 'entrance' in lower and not result['entrance_exam']:
        result['entrance_exam'] = 'Entrance exam required'

    return result


class Command(BaseCommand):
    help = 'Import university programmes from flat-row JSON (haryana_university_ug_programmes.json)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            default='../files (5)/haryana_university_ug_programmes.json',
            help='Path to JSON file',
        )
        parser.add_argument('--clear', action='store_true', help='Clear existing data before import')

    def handle(self, *args, **options):
        with open(options['file']) as f:
            data = json.load(f)

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

        uni_cache = {}
        uni_count = 0
        course_count = 0
        uc_count = 0
        skipped = 0

        for row in data['rows']:
            uni_full = row['university']
            if uni_full in SKIP_UNIS:
                skipped += 1
                continue

            if uni_full not in uni_cache:
                short = UNI_SHORT_NAMES.get(uni_full)
                if not short:
                    short = uni_full[:10].upper().replace(' ', '').replace(',', '')
                    self.stdout.write(self.style.WARNING(f'  No short name for: {uni_full} -> {short}'))

                raw_type = row.get('type', 'State')
                uni_type = UNI_TYPE_MAP.get(raw_type, 'state')
                city = extract_city(uni_full)
                city_key = city.lower().strip()
                district = CITY_TO_DISTRICT.get(city_key, city_key.split(',')[0].strip())

                uni, created = University.objects.update_or_create(
                    short_name=short,
                    defaults={
                        'name': re.sub(r',\s*\w+(\s*\(.*\))?$', '', uni_full).strip(),
                        'university_type': uni_type,
                        'city': city,
                        'district': district,
                    }
                )
                uni_cache[uni_full] = uni
                if created:
                    uni_count += 1

            uni = uni_cache[uni_full]
            programme_name = row['programme']
            stream = guess_stream(programme_name)

            short_course = programme_name[:30] if len(programme_name) > 30 else programme_name

            course, c_created = Course.objects.get_or_create(
                name=programme_name,
                level='ug',
                defaults={
                    'short_name': short_course,
                    'stream': stream,
                    'duration_years': 3,
                }
            )
            if c_created:
                course_count += 1

            uc, uc_created = UniversityCourse.objects.get_or_create(
                university=uni,
                course=course,
            )
            if uc_created:
                uc_count += 1

            elig = parse_eligibility(row.get('eligibility', ''))
            EligibilityCriteria.objects.update_or_create(
                university_course=uc,
                defaults={
                    'min_12th_percentage': elig['min_12th'],
                    'required_stream': elig['required_stream'],
                    'required_subjects': elig['required_subjects'],
                    'entrance_exam': elig['entrance_exam'],
                }
            )

            AdmissionCycle.objects.get_or_create(
                university_course=uc,
                academic_year='2026-2027',
                defaults={
                    'application_start': '2026-06-01',
                    'application_end': '2026-07-31',
                    'status': 'upcoming',
                }
            )

            for doc_name, mandatory in [
                ('10th Marksheet', True), ('12th Marksheet', True),
                ('Character Certificate', True), ('Passport Size Photos', True),
                ('Aadhar Card', True), ('Domicile Certificate', False),
                ('Category Certificate', False),
            ]:
                if doc_name in doc_map:
                    doc_obj, _ = doc_map[doc_name]
                    UniversityCourseDocument.objects.get_or_create(
                        university_course=uc,
                        document=doc_obj,
                        defaults={'is_mandatory': mandatory},
                    )

        self.stdout.write(self.style.SUCCESS(
            f'\nImport complete!\n'
            f'  Universities: {uni_count} new ({len(uni_cache)} total processed)\n'
            f'  Courses: {course_count} new\n'
            f'  University-courses: {uc_count} new\n'
            f'  Rows skipped (placeholders): {skipped}\n'
            f'\n  DB totals:\n'
            f'    Universities: {University.objects.count()}\n'
            f'    Courses: {Course.objects.count()}\n'
            f'    University-courses: {UniversityCourse.objects.count()}\n'
            f'    Eligibility criteria: {EligibilityCriteria.objects.count()}\n'
        ))
