import pandas as pd
from django.core.management.base import BaseCommand
from core.models import (
    University, Course, UniversityCourse,
    EligibilityCriteria, AdmissionCycle, RequiredDocument, UniversityCourseDocument,
)

STREAM_MAP = {
    'any': 'other',
    'maths': 'science',
    'science-pcm': 'science',
    'science-pcb': 'science',
    'medical': 'medical',
    'science': 'science',
    'commerce': 'commerce',
    'arts': 'arts',
    'law': 'law',
    'engineering': 'engineering',
    'education': 'education',
    'computer': 'computer',
    'management': 'management',
    'design': 'design',
}

COURSE_STREAM_OVERRIDE = {
    'BCA': 'computer',
    'Bachelor of Computer Application': 'computer',
    'Bachelor of Computer Applications': 'computer',
    'Master of Computer Application': 'computer',
    'LL.B': 'law',
    'B.A. LL.B': 'law',
    'BBA LLB': 'law',
    'Bachelor of Commerce': 'commerce',
    'B.Com': 'commerce',
    'BBA': 'management',
    'BMS': 'management',
    'MBA': 'management',
    'Bachelor of Business Administration': 'management',
    'Bachelor of Hotel': 'management',
    'Master of Hotel': 'management',
    'Bachelor of Tourism': 'management',
    'B.Ed': 'education',
    'ITEP': 'education',
    'Bachelor of Fine Arts': 'design',
    'BFA': 'design',
    'B.Sc. Graphics': 'design',
    'B.Sc. Animation': 'design',
    'B.Sc. Multi Media': 'design',
    'Journalism': 'arts',
    'B.A.': 'arts',
    'Bachelor of Arts': 'arts',
    'Master of Performing Arts': 'design',
    'Physiotherapy': 'medical',
    'Public Health': 'medical',
    'Genetics': 'science',
    'B.Voc. Industrial Biochemistry': 'medical',
    'B.Voc. Environmental Science': 'science',
    'Geology': 'science',
    'B.Sc. Semiconductor': 'science',
    'Data Science': 'computer',
    'Yoga': 'ayush',
    'M.Sc. Physics': 'science',
    'B.Sc. Printing': 'other',
    'Pharmacy': 'pharmacy',
    'Master of Pharmacy': 'pharmacy',
    'Nursing': 'nursing',
}


def guess_stream(course_name, raw_stream):
    for keyword, stream in COURSE_STREAM_OVERRIDE.items():
        if keyword.lower() in course_name.lower():
            return stream
    return STREAM_MAP.get(raw_stream, 'other')


def map_required_stream(raw):
    if not raw or raw == 'any' or pd.isna(raw):
        return ''
    mapping = {
        'maths': 'science',
        'science-pcm': 'science',
        'science-pcb': 'science',
        'medical': 'medical',
        'science': 'science',
        'commerce': 'commerce',
        'arts': 'arts',
    }
    return mapping.get(raw, '')


class Command(BaseCommand):
    help = 'Import UG + PG data from the relational Excel datasets'

    def add_arguments(self, parser):
        parser.add_argument(
            '--ug', default='Data /Haryana_Universities_Course_Eligibility.xlsx',
        )
        parser.add_argument(
            '--pg', default='Data /Haryana_Universities_PG_Course_Eligibility.xlsx',
        )
        parser.add_argument('--clear', action='store_true', help='Clear all existing data first')

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            UniversityCourseDocument.objects.all().delete()
            AdmissionCycle.objects.all().delete()
            EligibilityCriteria.objects.all().delete()
            UniversityCourse.objects.all().delete()
            Course.objects.all().delete()
            University.objects.all().delete()
            RequiredDocument.objects.all().delete()

        stats = {'uni': 0, 'course': 0, 'uc': 0, 'elig': 0, 'adm': 0, 'doc': 0, 'ccdoc': 0}

        self._import_file(options['ug'], 'ug', stats)

        if options['pg']:
            try:
                self._import_file(options['pg'], 'pg', stats)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'PG import skipped: {e}'))

        self.stdout.write(self.style.SUCCESS(
            f'\nImport complete!\n'
            f'  Universities: {stats["uni"]} created\n'
            f'  Courses: {stats["course"]} created\n'
            f'  University-Courses: {stats["uc"]} created\n'
            f'  Eligibility: {stats["elig"]} created\n'
            f'  Admission Cycles: {stats["adm"]} created\n'
            f'  Documents: {stats["doc"]} created\n'
            f'  Course-Documents: {stats["ccdoc"]} created\n'
            f'\n  DB totals:\n'
            f'    Universities: {University.objects.count()}\n'
            f'    Courses: {Course.objects.count()}\n'
            f'    University-Courses: {UniversityCourse.objects.count()}\n'
            f'    Eligibility: {EligibilityCriteria.objects.count()}\n'
        ))

    def _import_file(self, filepath, level, stats):
        self.stdout.write(f'\nImporting {level.upper()} from {filepath}...')
        xls = pd.ExcelFile(filepath)

        unis_df = pd.read_excel(xls, 'Universities')
        colleges_df = pd.read_excel(xls, 'Colleges')
        courses_df = pd.read_excel(xls, 'Courses')
        cc_df = pd.read_excel(xls, 'College_Courses')
        elig_df = pd.read_excel(xls, 'Eligibility_Criteria')

        adm_df = None
        if 'Admission_Cycles' in xls.sheet_names:
            adm_df = pd.read_excel(xls, 'Admission_Cycles')

        docs_df = None
        ccdocs_df = None
        if 'Required_Documents' in xls.sheet_names:
            docs_df = pd.read_excel(xls, 'Required_Documents')
        if 'CollegeCourse_Documents' in xls.sheet_names:
            ccdocs_df = pd.read_excel(xls, 'CollegeCourse_Documents')

        college_to_uni = {}
        for _, row in colleges_df.iterrows():
            college_to_uni[row['college_id']] = row['university_id']

        uni_map = {}
        for _, row in unis_df.iterrows():
            uni, created = University.objects.update_or_create(
                short_name=row['short_name'],
                defaults={
                    'name': row['name'],
                    'university_type': row.get('university_type', 'state'),
                    'city': row.get('city', ''),
                    'district': row.get('district', ''),
                    'website': row.get('website', '') or '',
                    'established_year': int(row['established_year']) if pd.notna(row.get('established_year')) else None,
                }
            )
            uni_map[row['university_id']] = uni
            if created:
                stats['uni'] += 1
                self.stdout.write(f'  + University: {uni.short_name}')

        course_map = {}
        for _, row in courses_df.iterrows():
            stream = guess_stream(row['name'], row.get('stream', 'other'))
            duration = float(row.get('duration_years', 3))
            short = row['name'][:30] if len(row['name']) > 30 else row['name']

            course, created = Course.objects.get_or_create(
                name=row['name'],
                level=level,
                defaults={
                    'short_name': short,
                    'stream': stream,
                    'duration_years': duration,
                }
            )
            course_map[row['course_id']] = course
            if created:
                stats['course'] += 1

        doc_map = {}
        if docs_df is not None:
            for _, row in docs_df.iterrows():
                doc, created = RequiredDocument.objects.update_or_create(
                    name=row['name'],
                    defaults={'description': row.get('description', '') or ''}
                )
                doc_map[row['document_id']] = doc
                if created:
                    stats['doc'] += 1

        uc_map = {}
        for _, row in cc_df.iterrows():
            uni_id = college_to_uni.get(row['college_id'])
            if not uni_id or uni_id not in uni_map:
                continue
            uni = uni_map[uni_id]
            course_id = row['course_id']
            if course_id not in course_map:
                continue
            course = course_map[course_id]

            seats = int(row['total_seats']) if pd.notna(row.get('total_seats')) else None
            fee = float(row['annual_fee']) if pd.notna(row.get('annual_fee')) else None

            uc, created = UniversityCourse.objects.get_or_create(
                university=uni,
                course=course,
                defaults={
                    'total_seats': seats,
                    'annual_fee': fee,
                }
            )
            uc_map[row['college_course_id']] = uc
            if created:
                stats['uc'] += 1

        for _, row in elig_df.iterrows():
            cc_id = row['college_course_id']
            if cc_id not in uc_map:
                continue
            uc = uc_map[cc_id]

            if level == 'ug':
                min_12th = float(row['min_12th_percentage']) if pd.notna(row.get('min_12th_percentage')) else None
                req_stream = map_required_stream(row.get('required_stream', ''))
                req_subjects = str(row.get('required_subjects', '')) if pd.notna(row.get('required_subjects')) else ''
                entrance = ''
                note = str(row.get('note', '')) if pd.notna(row.get('note')) else ''
            else:
                min_12th = float(row['min_bachelor_percentage']) if pd.notna(row.get('min_bachelor_percentage')) else None
                req_stream = ''
                req_subjects = str(row.get('required_bachelor_degree', '')) if pd.notna(row.get('required_bachelor_degree')) else ''
                entrance = str(row.get('entrance_exam', '')) if pd.notna(row.get('entrance_exam')) else ''
                note = str(row.get('note', '')) if pd.notna(row.get('note')) else ''

            if req_subjects == '(none)':
                req_subjects = ''

            domicile = bool(row.get('domicile_required', False))

            EligibilityCriteria.objects.update_or_create(
                university_course=uc,
                defaults={
                    'min_12th_percentage': min_12th,
                    'required_stream': req_stream,
                    'required_subjects': req_subjects,
                    'entrance_exam': entrance,
                    'domicile_required': domicile,
                }
            )
            stats['elig'] += 1

        if adm_df is not None:
            for _, row in adm_df.iterrows():
                cc_id = row['college_course_id']
                if cc_id not in uc_map:
                    continue
                uc = uc_map[cc_id]

                status = row.get('status', 'upcoming')
                if status not in ('open', 'upcoming', 'closed', 'counselling'):
                    status = 'upcoming'

                app_start = pd.to_datetime(row.get('application_start'))
                app_end = pd.to_datetime(row.get('application_end'))

                AdmissionCycle.objects.update_or_create(
                    university_course=uc,
                    academic_year=row.get('academic_year', '2026-2027'),
                    defaults={
                        'application_start': app_start.date() if pd.notna(app_start) else '2026-06-01',
                        'application_end': app_end.date() if pd.notna(app_end) else '2026-07-31',
                        'status': status,
                    }
                )
                stats['adm'] += 1

        if ccdocs_df is not None:
            for _, row in ccdocs_df.iterrows():
                cc_id = row['college_course_id']
                doc_id = row['document_id']
                if cc_id not in uc_map or doc_id not in doc_map:
                    continue

                UniversityCourseDocument.objects.get_or_create(
                    university_course=uc_map[cc_id],
                    document=doc_map[doc_id],
                    defaults={'is_mandatory': bool(row.get('is_mandatory', True))}
                )
                stats['ccdoc'] += 1

        self.stdout.write(self.style.SUCCESS(f'  {level.upper()} import done.'))
