from django.core.management.base import BaseCommand
from core.models import (
    University, Course, UniversityCourse,
    EligibilityCriteria, AdmissionCycle, RequiredDocument, UniversityCourseDocument,
)

KUK_UTD_PROGRAMMES = [
    {
        'name': 'B.Com. (Professional) AEDP',
        'short_name': 'BCom Prof',
        'stream': 'commerce',
        'level': 'ug',
        'duration': 3,
        'seats': 40,
        'annual_fee': 60000,
        'min_12th': 0,
        'required_stream': '',
        'required_subjects': '',
        'entrance_exam': '',
    },
    {
        'name': 'B.A. Journalism & Mass Communication',
        'short_name': 'BA JMC',
        'stream': 'arts',
        'level': 'ug',
        'duration': 4,
        'seats': 60,
        'annual_fee': 43396,
        'min_12th': 50,
        'required_stream': '',
        'required_subjects': 'English',
        'entrance_exam': '',
    },
    {
        'name': 'B.Sc. Graphics & Animation',
        'short_name': 'BSc GA',
        'stream': 'design',
        'level': 'ug',
        'duration': 4,
        'seats': 60,
        'annual_fee': 55113,
        'min_12th': 50,
        'required_stream': '',
        'required_subjects': 'English',
        'entrance_exam': '',
    },
    {
        'name': 'B.Sc. Multi Media',
        'short_name': 'BSc MM',
        'stream': 'design',
        'level': 'ug',
        'duration': 4,
        'seats': 60,
        'annual_fee': 53392,
        'min_12th': 50,
        'required_stream': '',
        'required_subjects': 'English',
        'entrance_exam': '',
    },
    {
        'name': 'B.Sc. Printing & Packaging Technology',
        'short_name': 'BSc PPT',
        'stream': 'science',
        'level': 'ug',
        'duration': 4,
        'seats': 60,
        'annual_fee': 50966,
        'min_12th': 50,
        'required_stream': '',
        'required_subjects': '',
        'entrance_exam': '',
    },
    {
        'name': 'MBA 5-Yr Integrated Practice Oriented Programme',
        'short_name': 'MBA 5Yr',
        'stream': 'management',
        'level': 'ug',
        'duration': 5,
        'seats': 60,
        'annual_fee': 74348,
        'min_12th': 50,
        'required_stream': '',
        'required_subjects': 'English',
        'entrance_exam': '',
    },
    {
        'name': 'BBA (Hons.)',
        'short_name': 'BBA Hons',
        'stream': 'management',
        'level': 'ug',
        'duration': 4,
        'seats': 60,
        'annual_fee': 74348,
        'min_12th': 50,
        'required_stream': '',
        'required_subjects': 'English',
        'entrance_exam': '',
    },
    {
        'name': 'BMS (Event Management) AEDP',
        'short_name': 'BMS EM',
        'stream': 'management',
        'level': 'ug',
        'duration': 3,
        'seats': 40,
        'annual_fee': 60000,
        'min_12th': 0,
        'required_stream': '',
        'required_subjects': '',
        'entrance_exam': '',
    },
    {
        'name': 'Bachelor of Hotel Management & Catering Technology (BHM&CT)',
        'short_name': 'BHMCT',
        'stream': 'management',
        'level': 'ug',
        'duration': 4,
        'seats': 60,
        'annual_fee': 74309,
        'min_12th': 0,
        'required_stream': '',
        'required_subjects': '',
        'entrance_exam': '',
    },
    {
        'name': 'B.A. B.Ed (ITEP)',
        'short_name': 'BA BEd ITEP',
        'stream': 'education',
        'level': 'ug',
        'duration': 4,
        'seats': 50,
        'annual_fee': 30505,
        'min_12th': 50,
        'required_stream': '',
        'required_subjects': '',
        'entrance_exam': 'NCET 2026',
    },
    {
        'name': 'B.Sc. B.Ed (ITEP)',
        'short_name': 'BSc BEd ITEP',
        'stream': 'education',
        'level': 'ug',
        'duration': 4,
        'seats': 50,
        'annual_fee': 30505,
        'min_12th': 50,
        'required_stream': 'science',
        'required_subjects': '',
        'entrance_exam': 'NCET 2026',
    },
    {
        'name': 'B.Com. B.Ed (ITEP)',
        'short_name': 'BCom BEd ITEP',
        'stream': 'education',
        'level': 'ug',
        'duration': 4,
        'seats': 50,
        'annual_fee': 30505,
        'min_12th': 50,
        'required_stream': 'commerce',
        'required_subjects': '',
        'entrance_exam': 'NCET 2026',
    },
    {
        'name': 'Bachelor of Fine Arts (BFA)',
        'short_name': 'BFA',
        'stream': 'design',
        'level': 'ug',
        'duration': 4,
        'seats': 50,
        'annual_fee': 51364,
        'min_12th': 0,
        'required_stream': '',
        'required_subjects': 'English',
        'entrance_exam': '',
    },
    {
        'name': 'MPA (Master of Performing Arts) 5-Yr Integrated',
        'short_name': 'MPA 5Yr',
        'stream': 'design',
        'level': 'ug',
        'duration': 5,
        'seats': 40,
        'annual_fee': 12300,
        'min_12th': 45,
        'required_stream': '',
        'required_subjects': 'English',
        'entrance_exam': '',
    },
    {
        'name': 'B.A. LL.B. (Hons.) 5-Yr Integrated',
        'short_name': 'BA LLB 5Yr',
        'stream': 'law',
        'level': 'ug',
        'duration': 5,
        'seats': 120,
        'annual_fee': 102237,
        'min_12th': 45,
        'required_stream': '',
        'required_subjects': 'English',
        'entrance_exam': '',
    },
    {
        'name': 'B.Voc. Industrial Biochemistry AEDP',
        'short_name': 'BVoc IndBio',
        'stream': 'science',
        'level': 'ug',
        'duration': 3,
        'seats': 40,
        'annual_fee': 50000,
        'min_12th': 0,
        'required_stream': 'science',
        'required_subjects': 'Physics, Chemistry, Biology',
        'entrance_exam': '',
    },
    {
        'name': 'B.Voc. Environmental Science & Sustainability (B.Voc. ESS) AEDP',
        'short_name': 'BVoc ESS',
        'stream': 'science',
        'level': 'ug',
        'duration': 3,
        'seats': 40,
        'annual_fee': 50000,
        'min_12th': 0,
        'required_stream': '',
        'required_subjects': '',
        'entrance_exam': '',
    },
    {
        'name': 'BCA (Industry Linked) AEDP',
        'short_name': 'BCA IL',
        'stream': 'computer',
        'level': 'ug',
        'duration': 3,
        'seats': 60,
        'annual_fee': 60000,
        'min_12th': 0,
        'required_stream': '',
        'required_subjects': '',
        'entrance_exam': '',
    },
    {
        'name': 'M.Tech. Applied Geology 5-Yr Integrated',
        'short_name': 'MTech Geo 5Y',
        'stream': 'science',
        'level': 'ug',
        'duration': 5,
        'seats': 20,
        'annual_fee': 55468,
        'min_12th': 0,
        'required_stream': 'science',
        'required_subjects': 'Physics, Maths',
        'entrance_exam': '',
    },
    {
        'name': 'B.Sc. Geology Professional AEDP',
        'short_name': 'BSc Geo',
        'stream': 'science',
        'level': 'ug',
        'duration': 3,
        'seats': 40,
        'annual_fee': 50000,
        'min_12th': 0,
        'required_stream': 'science',
        'required_subjects': '',
        'entrance_exam': '',
    },
    {
        'name': 'B.Sc. Semiconductor Electronics & Information Technology AEDP',
        'short_name': 'BSc SemiElec',
        'stream': 'science',
        'level': 'ug',
        'duration': 3,
        'seats': 40,
        'annual_fee': 50000,
        'min_12th': 0,
        'required_stream': 'science',
        'required_subjects': 'Physics, Maths',
        'entrance_exam': '',
    },
    {
        'name': 'B.Sc. Data Science AEDP',
        'short_name': 'BSc DS',
        'stream': 'computer',
        'level': 'ug',
        'duration': 3,
        'seats': 50,
        'annual_fee': 50000,
        'min_12th': 0,
        'required_stream': '',
        'required_subjects': 'Maths',
        'entrance_exam': '',
    },
    {
        'name': 'B.A. Business & Economics Analytics AEDP',
        'short_name': 'BA BEA',
        'stream': 'commerce',
        'level': 'ug',
        'duration': 3,
        'seats': 40,
        'annual_fee': 50000,
        'min_12th': 0,
        'required_stream': '',
        'required_subjects': '',
        'entrance_exam': '',
    },
]

DOCUMENTS = [
    ('10th Marksheet', True),
    ('12th Marksheet', True),
    ('Character Certificate', True),
    ('Passport Size Photos', True),
    ('Aadhar Card', True),
    ('Domicile Certificate', False),
    ('Category Certificate', False),
    ('Migration Certificate', False),
]


class Command(BaseCommand):
    help = 'Import KUK UTD 2026 handbook data (23 UG programmes with real seats, fees, dates)'

    def handle(self, *args, **options):
        kuk = University.objects.get(short_name='KUK')

        kuk.naac_grade = 'A++'
        kuk.website = 'https://www.kuk.ac.in'
        kuk.admission_portal = 'https://iums.kuk.ac.in/anon_admissionHome.htm'
        kuk.established_year = 1956
        kuk.save()
        self.stdout.write(f'Updated KUK university info (NAAC A++, portal, etc.)')

        doc_map = {}
        for name, mandatory in DOCUMENTS:
            doc = RequiredDocument.objects.filter(name=name).first()
            if doc:
                doc_map[name] = (doc, mandatory)

        uc_created = 0
        course_created = 0

        for prog in KUK_UTD_PROGRAMMES:
            course, c_created = Course.objects.get_or_create(
                name=prog['name'],
                level=prog['level'],
                defaults={
                    'short_name': prog['short_name'],
                    'stream': prog['stream'],
                    'duration_years': prog['duration'],
                }
            )
            if c_created:
                course_created += 1

            uc, uc_new = UniversityCourse.objects.get_or_create(
                university=kuk,
                course=course,
                defaults={
                    'total_seats': prog['seats'],
                    'annual_fee': prog['annual_fee'],
                }
            )
            if not uc_new:
                uc.total_seats = prog['seats']
                uc.annual_fee = prog['annual_fee']
                uc.save()
            else:
                uc_created += 1

            EligibilityCriteria.objects.update_or_create(
                university_course=uc,
                defaults={
                    'min_12th_percentage': prog['min_12th'] if prog['min_12th'] else None,
                    'required_stream': prog['required_stream'],
                    'required_subjects': prog['required_subjects'],
                    'entrance_exam': prog['entrance_exam'],
                    'domicile_required': False,
                }
            )

            AdmissionCycle.objects.update_or_create(
                university_course=uc,
                academic_year='2026-2027',
                defaults={
                    'application_start': '2026-05-07',
                    'application_end': '2026-05-31',
                    'application_link': 'https://iums.kuk.ac.in/anon_admissionHome.htm',
                    'application_fee': 1200,
                    'status': 'upcoming',
                    'merit_list_date': '2026-06-08',
                    'notes': 'Normal admission: 08.06-23.06.2026. Late fee (Rs.1000): 24.06-30.06.2026. Classes: 15.07.2026.',
                }
            )

            for doc_name, mandatory in DOCUMENTS:
                if doc_name in doc_map:
                    doc_obj, mand = doc_map[doc_name]
                    UniversityCourseDocument.objects.get_or_create(
                        university_course=uc,
                        document=doc_obj,
                        defaults={'is_mandatory': mandatory},
                    )

        self.stdout.write(self.style.SUCCESS(
            f'\nKUK UTD import complete!\n'
            f'  New courses created: {course_created}\n'
            f'  University-courses created: {uc_created}\n'
            f'  All with real seats, fees, and admission dates\n'
            f'\n  DB totals:\n'
            f'    Universities: {University.objects.count()}\n'
            f'    Courses: {Course.objects.count()}\n'
            f'    University-courses: {UniversityCourse.objects.count()}\n'
        ))
