from django.db import models
from core.models import Course


class StudentProfile(models.Model):
    class Category(models.TextChoices):
        GENERAL = 'general', 'General'
        SC = 'sc', 'SC'
        ST = 'st', 'ST'
        BC_A = 'bc_a', 'BC-A'
        BC_B = 'bc_b', 'BC-B'
        EWS = 'ews', 'EWS'
        OBC = 'obc', 'OBC'

    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        OTHER = 'other', 'Other'

    session_id = models.CharField(max_length=64, unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=15, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    category = models.CharField(max_length=10, choices=Category.choices, default=Category.GENERAL)

    class_10_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    class_10_board = models.CharField(max_length=50, blank=True)
    class_12_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    class_12_board = models.CharField(max_length=50, blank=True)
    class_12_stream = models.CharField(max_length=15, choices=Course.Stream.choices)
    class_12_subjects = models.TextField(
        blank=True, help_text='Comma-separated subjects taken in 12th'
    )

    preferred_stream = models.CharField(max_length=15, choices=Course.Stream.choices, blank=True)
    preferred_level = models.CharField(
        max_length=15, choices=Course.Level.choices, default=Course.Level.UG
    )
    preferred_districts = models.TextField(
        blank=True, help_text='Comma-separated preferred districts'
    )
    max_annual_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    haryana_domicile = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} ({self.session_id[:8]})"
