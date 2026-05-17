from django.core.management.base import BaseCommand
from core.models import (
    University, College, Course, CollegeCourse,
    EligibilityCriteria, AdmissionCycle, RequiredDocument, CollegeCourseDocument,
)


UNIVERSITIES = [
    {
        'name': 'Kurukshetra University',
        'short_name': 'KUK',
        'university_type': 'state',
        'city': 'Kurukshetra',
        'district': 'kurukshetra',
        'website': 'https://www.kuk.ac.in',
        'admission_portal': 'https://admission.kuk.ac.in',
        'established_year': 1956,
        'naac_grade': 'A+',
    },
    {
        'name': 'Maharshi Dayanand University',
        'short_name': 'MDU',
        'university_type': 'state',
        'city': 'Rohtak',
        'district': 'rohtak',
        'website': 'https://www.mdurohtak.ac.in',
        'admission_portal': 'https://admission.mdurohtak.ac.in',
        'established_year': 1976,
        'naac_grade': 'A+',
    },
    {
        'name': 'Guru Jambheshwar University of Science & Technology',
        'short_name': 'GJU',
        'university_type': 'state',
        'city': 'Hisar',
        'district': 'hisar',
        'website': 'https://www.gjust.ac.in',
        'established_year': 1995,
        'naac_grade': 'A',
    },
    {
        'name': 'Chaudhary Ranbir Singh University',
        'short_name': 'CRSU',
        'university_type': 'state',
        'city': 'Jind',
        'district': 'jind',
        'website': 'https://www.crsu.ac.in',
        'established_year': 2014,
        'naac_grade': 'B++',
    },
    {
        'name': 'Deenbandhu Chhotu Ram University of Science & Technology',
        'short_name': 'DCRUST',
        'university_type': 'state',
        'city': 'Murthal',
        'district': 'sonipat',
        'website': 'https://www.dcrustm.ac.in',
        'established_year': 1987,
        'naac_grade': 'A',
    },
    {
        'name': 'Bhagat Phool Singh Mahila Vishwavidyalaya',
        'short_name': 'BPSMV',
        'university_type': 'state',
        'city': 'Khanpur Kalan',
        'district': 'sonipat',
        'website': 'https://www.bfriendspu.ac.in',
        'established_year': 2006,
        'naac_grade': 'A',
    },
    {
        'name': 'Chaudhary Bansi Lal University',
        'short_name': 'CBLU',
        'university_type': 'state',
        'city': 'Bhiwani',
        'district': 'bhiwani',
        'website': 'https://www.cblu.ac.in',
        'established_year': 2014,
        'naac_grade': 'B+',
    },
    {
        'name': 'Indira Gandhi University',
        'short_name': 'IGU',
        'university_type': 'state',
        'city': 'Meerpur',
        'district': 'rewari',
        'website': 'https://www.igu.ac.in',
        'established_year': 2013,
    },
    {
        'name': 'Chaudhary Devi Lal University',
        'short_name': 'CDLU',
        'university_type': 'state',
        'city': 'Sirsa',
        'district': 'sirsa',
        'website': 'https://www.cdlu.ac.in',
        'established_year': 2003,
        'naac_grade': 'B+',
    },
    {
        'name': 'Shri Vishwakarma Skill University',
        'short_name': 'SVSU',
        'university_type': 'state',
        'city': 'Palwal',
        'district': 'palwal',
        'website': 'https://www.svsu.ac.in',
        'established_year': 2016,
    },
]

COURSES = [
    {'name': 'Bachelor of Arts', 'short_name': 'B.A.', 'level': 'ug', 'stream': 'arts', 'duration_years': 3},
    {'name': 'Bachelor of Science', 'short_name': 'B.Sc.', 'level': 'ug', 'stream': 'science', 'duration_years': 3},
    {'name': 'Bachelor of Commerce', 'short_name': 'B.Com.', 'level': 'ug', 'stream': 'commerce', 'duration_years': 3},
    {'name': 'Bachelor of Computer Applications', 'short_name': 'BCA', 'level': 'ug', 'stream': 'computer', 'duration_years': 3},
    {'name': 'Bachelor of Business Administration', 'short_name': 'BBA', 'level': 'ug', 'stream': 'management', 'duration_years': 3},
    {'name': 'Bachelor of Education', 'short_name': 'B.Ed.', 'level': 'ug', 'stream': 'education', 'duration_years': 2},
    {'name': 'Bachelor of Science (Computer Science)', 'short_name': 'B.Sc.(CS)', 'level': 'ug', 'stream': 'computer', 'duration_years': 3},
    {'name': 'Bachelor of Science (Mathematics)', 'short_name': 'B.Sc.(Math)', 'level': 'ug', 'stream': 'science', 'duration_years': 3},
    {'name': 'Bachelor of Laws', 'short_name': 'LL.B.', 'level': 'ug', 'stream': 'law', 'duration_years': 3},
    {'name': 'BA LLB (Integrated)', 'short_name': 'BA-LLB', 'level': 'ug', 'stream': 'law', 'duration_years': 5},
    {'name': 'Master of Arts', 'short_name': 'M.A.', 'level': 'pg', 'stream': 'arts', 'duration_years': 2},
    {'name': 'Master of Science', 'short_name': 'M.Sc.', 'level': 'pg', 'stream': 'science', 'duration_years': 2},
    {'name': 'Master of Commerce', 'short_name': 'M.Com.', 'level': 'pg', 'stream': 'commerce', 'duration_years': 2},
    {'name': 'Master of Computer Applications', 'short_name': 'MCA', 'level': 'pg', 'stream': 'computer', 'duration_years': 2},
    {'name': 'Master of Business Administration', 'short_name': 'MBA', 'level': 'pg', 'stream': 'management', 'duration_years': 2},
    {'name': 'Bachelor of Technology', 'short_name': 'B.Tech.', 'level': 'ug', 'stream': 'engineering', 'duration_years': 4},
    {'name': 'Master of Technology', 'short_name': 'M.Tech.', 'level': 'pg', 'stream': 'engineering', 'duration_years': 2},
    {'name': 'Bachelor of Pharmacy', 'short_name': 'B.Pharm.', 'level': 'ug', 'stream': 'medical', 'duration_years': 4},
    {'name': 'Bachelor of Science (Nursing)', 'short_name': 'B.Sc.(N)', 'level': 'ug', 'stream': 'medical', 'duration_years': 4},
    {'name': 'Diploma in Education', 'short_name': 'D.Ed.', 'level': 'diploma', 'stream': 'education', 'duration_years': 2},
]

SAMPLE_COLLEGES = [
    {'name': 'University College, Kurukshetra', 'university': 'KUK', 'college_type': 'govt', 'city': 'Kurukshetra', 'district': 'kurukshetra'},
    {'name': 'Govt. College, Sector-1, Panchkula', 'university': 'KUK', 'college_type': 'govt', 'city': 'Panchkula', 'district': 'panchkula'},
    {'name': 'Govt. College for Women, Karnal', 'university': 'KUK', 'college_type': 'govt', 'city': 'Karnal', 'district': 'karnal', 'co_education': False},
    {'name': 'Dyal Singh College, Karnal', 'university': 'KUK', 'college_type': 'govt_aided', 'city': 'Karnal', 'district': 'karnal'},
    {'name': 'S.D. College, Ambala Cantt', 'university': 'KUK', 'college_type': 'govt_aided', 'city': 'Ambala', 'district': 'ambala'},
    {'name': 'Vaish College, Rohtak', 'university': 'MDU', 'college_type': 'govt_aided', 'city': 'Rohtak', 'district': 'rohtak'},
    {'name': 'Govt. College, Meham', 'university': 'MDU', 'college_type': 'govt', 'city': 'Meham', 'district': 'rohtak'},
    {'name': 'M.L.N. College, Yamuna Nagar', 'university': 'KUK', 'college_type': 'govt_aided', 'city': 'Yamuna Nagar', 'district': 'yamunanagar'},
    {'name': 'Govt. P.G. College, Hisar', 'university': 'GJU', 'college_type': 'govt', 'city': 'Hisar', 'district': 'hisar'},
    {'name': 'Govt. College, Jind', 'university': 'CRSU', 'college_type': 'govt', 'city': 'Jind', 'district': 'jind'},
    {'name': 'Govt. College, Bhiwani', 'university': 'CBLU', 'college_type': 'govt', 'city': 'Bhiwani', 'district': 'bhiwani'},
    {'name': 'Govt. College for Women, Bhiwani', 'university': 'CBLU', 'college_type': 'govt', 'city': 'Bhiwani', 'district': 'bhiwani', 'co_education': False},
    {'name': 'DCRUST Campus, Murthal', 'university': 'DCRUST', 'college_type': 'govt', 'city': 'Murthal', 'district': 'sonipat'},
    {'name': 'Govt. College, Narnaul', 'university': 'IGU', 'college_type': 'govt', 'city': 'Narnaul', 'district': 'mahendragarh'},
    {'name': 'Govt. College, Sirsa', 'university': 'CDLU', 'college_type': 'govt', 'city': 'Sirsa', 'district': 'sirsa'},
]

DOCUMENTS = [
    {'name': '10th Marksheet', 'description': 'Original or attested copy of Class 10 marksheet'},
    {'name': '12th Marksheet', 'description': 'Original or attested copy of Class 12 marksheet'},
    {'name': 'Character Certificate', 'description': 'From last attended institution'},
    {'name': 'Migration Certificate', 'description': 'For students from other universities/boards'},
    {'name': 'Domicile Certificate', 'description': 'Haryana domicile certificate'},
    {'name': 'Category Certificate', 'description': 'SC/ST/BC/EWS certificate if applicable'},
    {'name': 'Passport Size Photos', 'description': '4-6 recent passport size photographs'},
    {'name': 'Aadhar Card', 'description': 'Copy of Aadhaar card'},
    {'name': 'Income Certificate', 'description': 'For fee concession/scholarship'},
    {'name': 'Gap Certificate', 'description': 'Affidavit if there is a gap in education'},
]


class Command(BaseCommand):
    help = 'Seed Haryana universities, colleges, courses, and eligibility data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding universities...')
        uni_map = {}
        for data in UNIVERSITIES:
            uni, created = University.objects.update_or_create(
                short_name=data['short_name'],
                defaults=data,
            )
            uni_map[data['short_name']] = uni
            status_text = 'created' if created else 'updated'
            self.stdout.write(f'  {uni.short_name}: {status_text}')

        self.stdout.write('Seeding courses...')
        course_map = {}
        for data in COURSES:
            course, _ = Course.objects.update_or_create(
                short_name=data['short_name'],
                defaults=data,
            )
            course_map[data['short_name']] = course

        self.stdout.write('Seeding colleges...')
        college_map = {}
        for data in SAMPLE_COLLEGES:
            uni_short = data.pop('university')
            data['university'] = uni_map[uni_short]
            college, _ = College.objects.update_or_create(
                name=data['name'],
                defaults=data,
            )
            college_map[college.name] = college

        self.stdout.write('Seeding documents...')
        doc_map = {}
        for data in DOCUMENTS:
            doc, _ = RequiredDocument.objects.update_or_create(name=data['name'], defaults=data)
            doc_map[doc.name] = doc

        self.stdout.write('Creating college-course mappings with eligibility...')
        ug_courses = ['B.A.', 'B.Sc.', 'B.Com.', 'BCA', 'BBA']
        basic_docs = ['10th Marksheet', '12th Marksheet', 'Character Certificate',
                      'Passport Size Photos', 'Aadhar Card']

        for college in college_map.values():
            for short_name in ug_courses:
                if short_name not in course_map:
                    continue
                course = course_map[short_name]

                fee_map = {
                    'govt': 5000, 'govt_aided': 8000,
                    'self_financed': 25000, 'private': 40000,
                }
                fee = fee_map.get(college.college_type, 10000)

                cc, _ = CollegeCourse.objects.get_or_create(
                    college=college, course=course,
                    defaults={'total_seats': 60, 'annual_fee': fee},
                )

                stream_map = {
                    'B.A.': '', 'B.Sc.': 'science', 'B.Com.': 'commerce',
                    'BCA': '', 'BBA': '',
                }
                EligibilityCriteria.objects.get_or_create(
                    college_course=cc,
                    defaults={
                        'min_12th_percentage': 45.00 if short_name in ['BCA', 'BBA'] else 40.00,
                        'required_stream': stream_map.get(short_name, ''),
                        'domicile_required': False,
                    },
                )

                AdmissionCycle.objects.get_or_create(
                    college_course=cc,
                    academic_year='2026-2027',
                    defaults={
                        'application_start': '2026-06-01',
                        'application_end': '2026-07-15',
                        'status': 'upcoming',
                        'application_fee': 300 if college.college_type == 'govt' else 500,
                    },
                )

                for doc_name in basic_docs:
                    CollegeCourseDocument.objects.get_or_create(
                        college_course=cc,
                        document=doc_map[doc_name],
                        defaults={'is_mandatory': True},
                    )

                if college.college_type == 'govt':
                    CollegeCourseDocument.objects.get_or_create(
                        college_course=cc,
                        document=doc_map['Domicile Certificate'],
                        defaults={'is_mandatory': False},
                    )

        self.stdout.write(self.style.SUCCESS(
            f'Done! {University.objects.count()} universities, '
            f'{College.objects.count()} colleges, '
            f'{Course.objects.count()} courses, '
            f'{CollegeCourse.objects.count()} college-courses seeded.'
        ))
