from django.db import models


class University(models.Model):
    class Type(models.TextChoices):
        STATE = 'state', 'State University'
        CENTRAL = 'central', 'Central University'
        DEEMED = 'deemed', 'Deemed University'
        PRIVATE = 'private', 'Private University'

    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=30, unique=True)
    university_type = models.CharField(max_length=10, choices=Type.choices)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    website = models.URLField(blank=True)
    admission_portal = models.URLField(blank=True)
    logo = models.ImageField(upload_to='university_logos/', blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    naac_grade = models.CharField(max_length=10, blank=True)
    nirf_rank = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'universities'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.short_name})"


class College(models.Model):
    class Type(models.TextChoices):
        GOVT = 'govt', 'Government'
        GOVT_AIDED = 'govt_aided', 'Government Aided'
        SELF_FINANCED = 'self_financed', 'Self Financed'
        PRIVATE = 'private', 'Private'

    name = models.CharField(max_length=255)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='colleges')
    college_type = models.CharField(max_length=20, choices=Type.choices)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    pincode = models.CharField(max_length=6, blank=True)
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    naac_grade = models.CharField(max_length=10, blank=True)
    co_education = models.BooleanField(default=True)
    hostel_available = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Course(models.Model):
    class Stream(models.TextChoices):
        ARTS = 'arts', 'Arts / Humanities'
        COMMERCE = 'commerce', 'Commerce'
        SCIENCE = 'science', 'Science'
        ENGINEERING = 'engineering', 'Engineering'
        MEDICAL = 'medical', 'Medical'
        LAW = 'law', 'Law'
        MANAGEMENT = 'management', 'Management'
        EDUCATION = 'education', 'Education'
        COMPUTER = 'computer', 'Computer Applications'
        OTHER = 'other', 'Other'

    class Level(models.TextChoices):
        UG = 'ug', 'Undergraduate'
        PG = 'pg', 'Postgraduate'
        DIPLOMA = 'diploma', 'Diploma'
        CERTIFICATE = 'certificate', 'Certificate'
        PHD = 'phd', 'PhD'

    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=30)
    level = models.CharField(max_length=15, choices=Level.choices)
    stream = models.CharField(max_length=15, choices=Stream.choices)
    duration_years = models.DecimalField(max_digits=3, decimal_places=1)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_level_display()})"


class CollegeCourse(models.Model):
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='offered_courses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='colleges')
    total_seats = models.PositiveIntegerField(null=True, blank=True)
    annual_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['college', 'course']

    def __str__(self):
        return f"{self.college.name} - {self.course.name}"


class EligibilityCriteria(models.Model):
    class BoardType(models.TextChoices):
        ANY = 'any', 'Any Board'
        HBSE = 'hbse', 'HBSE (Haryana Board)'
        CBSE = 'cbse', 'CBSE'
        ICSE = 'icse', 'ICSE'

    college_course = models.ForeignKey(
        CollegeCourse, on_delete=models.CASCADE, related_name='eligibility_criteria'
    )
    min_10th_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    min_12th_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    required_stream = models.CharField(
        max_length=15, choices=Course.Stream.choices, blank=True,
        help_text='Leave blank if any stream is accepted'
    )
    required_subjects = models.TextField(
        blank=True,
        help_text='Comma-separated list of required subjects in 12th'
    )
    board_type = models.CharField(max_length=10, choices=BoardType.choices, default=BoardType.ANY)
    min_age = models.PositiveIntegerField(null=True, blank=True)
    max_age = models.PositiveIntegerField(null=True, blank=True)
    entrance_exam = models.CharField(max_length=100, blank=True)
    domicile_required = models.BooleanField(default=False)
    category_reservation = models.JSONField(
        default=dict, blank=True,
        help_text='e.g. {"general": 50, "sc": 15, "bc_a": 16, "bc_b": 11}'
    )

    class Meta:
        verbose_name_plural = 'eligibility criteria'

    def __str__(self):
        return f"Criteria for {self.college_course}"


class AdmissionCycle(models.Model):
    class Status(models.TextChoices):
        UPCOMING = 'upcoming', 'Upcoming'
        OPEN = 'open', 'Applications Open'
        CLOSED = 'closed', 'Applications Closed'
        COUNSELLING = 'counselling', 'Counselling in Progress'

    college_course = models.ForeignKey(
        CollegeCourse, on_delete=models.CASCADE, related_name='admission_cycles'
    )
    academic_year = models.CharField(max_length=9, help_text='e.g. 2026-2027')
    application_start = models.DateField()
    application_end = models.DateField()
    application_link = models.URLField(blank=True)
    application_fee = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.UPCOMING)
    counselling_date = models.DateField(null=True, blank=True)
    merit_list_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-application_end']

    def __str__(self):
        return f"{self.college_course} — {self.academic_year}"


class RequiredDocument(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CollegeCourseDocument(models.Model):
    college_course = models.ForeignKey(
        CollegeCourse, on_delete=models.CASCADE, related_name='required_documents'
    )
    document = models.ForeignKey(RequiredDocument, on_delete=models.CASCADE)
    is_mandatory = models.BooleanField(default=True)

    class Meta:
        unique_together = ['college_course', 'document']

    def __str__(self):
        return f"{self.document.name} for {self.college_course}"
