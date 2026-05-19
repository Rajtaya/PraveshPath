from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_id', models.CharField(db_index=True, max_length=64, unique=True)),
                ('full_name', models.CharField(max_length=150)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('phone', models.CharField(blank=True, max_length=15)),
                ('gender', models.CharField(blank=True, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], max_length=10)),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('category', models.CharField(choices=[('general', 'General'), ('sc', 'SC'), ('st', 'ST'), ('bc_a', 'BC-A'), ('bc_b', 'BC-B'), ('ews', 'EWS'), ('obc', 'OBC')], default='general', max_length=10)),
                ('class_10_percentage', models.DecimalField(decimal_places=2, max_digits=5)),
                ('class_10_board', models.CharField(blank=True, max_length=50)),
                ('class_12_percentage', models.DecimalField(decimal_places=2, max_digits=5)),
                ('class_12_board', models.CharField(blank=True, max_length=50)),
                ('class_12_stream', models.CharField(choices=[('arts', 'Arts / Humanities'), ('commerce', 'Commerce'), ('science', 'Science'), ('engineering', 'Engineering'), ('medical', 'Medical'), ('law', 'Law'), ('management', 'Management'), ('education', 'Education'), ('computer', 'Computer Applications'), ('pharmacy', 'Pharmacy'), ('nursing', 'Nursing'), ('dental', 'Dental'), ('design', 'Design / Fine Arts'), ('agriculture', 'Agriculture / Dairy / Horticulture'), ('veterinary', 'Veterinary'), ('sports', 'Sports Science'), ('ayush', 'AYUSH'), ('other', 'Other')], max_length=15)),
                ('class_12_subjects', models.TextField(blank=True, help_text='Comma-separated subjects taken in 12th')),
                ('preferred_stream', models.CharField(blank=True, choices=[('arts', 'Arts / Humanities'), ('commerce', 'Commerce'), ('science', 'Science'), ('engineering', 'Engineering'), ('medical', 'Medical'), ('law', 'Law'), ('management', 'Management'), ('education', 'Education'), ('computer', 'Computer Applications'), ('pharmacy', 'Pharmacy'), ('nursing', 'Nursing'), ('dental', 'Dental'), ('design', 'Design / Fine Arts'), ('agriculture', 'Agriculture / Dairy / Horticulture'), ('veterinary', 'Veterinary'), ('sports', 'Sports Science'), ('ayush', 'AYUSH'), ('other', 'Other')], max_length=15)),
                ('preferred_level', models.CharField(choices=[('ug', 'Undergraduate'), ('pg', 'Postgraduate'), ('diploma', 'Diploma'), ('certificate', 'Certificate'), ('phd', 'PhD')], default='ug', max_length=15)),
                ('preferred_districts', models.TextField(blank=True, help_text='Comma-separated preferred districts')),
                ('max_annual_fee', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('haryana_domicile', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
