from django.core.management.base import BaseCommand
from django.core.management import call_command
from core.models import Course, UniversityCourse, EligibilityCriteria, AdmissionCycle

class Command(BaseCommand):
    def handle(self, *args, **options):
        # Delete old KUK PG data (course PKs 151-228, UC PKs 591-668)
        old_uc_pks = list(range(591, 669))
        old_course_pks = list(range(151, 229))

        ac_del = AdmissionCycle.objects.filter(university_course_id__in=old_uc_pks).delete()
        self.stdout.write(f"Deleted admission cycles: {ac_del}")

        ec_del = EligibilityCriteria.objects.filter(university_course_id__in=old_uc_pks).delete()
        self.stdout.write(f"Deleted eligibility criteria: {ec_del}")

        uc_del = UniversityCourse.objects.filter(pk__in=old_uc_pks).delete()
        self.stdout.write(f"Deleted university courses: {uc_del}")

        c_del = Course.objects.filter(pk__in=old_course_pks).delete()
        self.stdout.write(f"Deleted courses: {c_del}")

        # Load new data
        call_command('loaddata', 'fixtures/kuk_pg_new.json')
        self.stdout.write(self.style.SUCCESS("KUK PG swap complete!"))
