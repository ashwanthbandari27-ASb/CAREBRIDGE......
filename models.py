from django.db import models
from django.utils import timezone

class Patient(models.Model):
    GENDER_CHOICES = [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')]
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-')
    ]
    
    patient_id = models.CharField(max_length=20, unique=True, default='PAT-1001')
    first_name = models.CharField(max_length=60)
    last_name = models.CharField(max_length=60)
    age = models.IntegerField(default=30)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, default='O+')
    phone = models.CharField(max_length=25)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=100, blank=True, null=True)
    allergies = models.TextField(blank=True, default='None')
    medical_history = models.TextField(blank=True, default='None')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.patient_id} - {self.full_name}"


class Doctor(models.Model):
    doctor_id = models.CharField(max_length=20, unique=True, default='DOC-201')
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=25)
    specialization = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    experience_years = models.IntegerField(default=5)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)
    room_number = models.CharField(max_length=30, default='Room 101')
    available_days = models.CharField(max_length=150, default='Mon, Wed, Fri')
    is_available = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.8)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.specialization})"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled')
    ]
    
    appointment_id = models.CharField(max_length=20, unique=True, default='APT-5001')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    department = models.CharField(max_length=100)
    appointment_date = models.DateField()
    appointment_time = models.CharField(max_length=20)
    appointment_type = models.CharField(max_length=50, default='General Consultation')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    symptoms = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.appointment_id}: {self.patient.full_name} with {self.doctor.name}"


class MedicalRecord(models.Model):
    record_id = models.CharField(max_length=20, unique=True, default='MR-3001')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='records')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='records')
    diagnosis = models.TextField()
    symptoms = models.TextField(blank=True, null=True)
    physical_examination = models.TextField(blank=True, null=True)
    treatment_plan = models.TextField()
    notes = models.TextField(blank=True, null=True)
    visit_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.record_id} - {self.patient.full_name}"


class Prescription(models.Model):
    prescription_id = models.CharField(max_length=20, unique=True, default='RX-7001')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    diagnosis = models.CharField(max_length=255, default='General')
    medications = models.TextField(help_text='JSON or formatted text list of medications and dosages')
    instructions = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='Active')
    issued_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.prescription_id} for {self.patient.full_name}"


class Medicine(models.Model):
    medicine_code = models.CharField(max_length=20, unique=True, default='MED-101')
    name = models.CharField(max_length=150)
    generic_name = models.CharField(max_length=150, blank=True, null=True)
    category = models.CharField(max_length=80, default='General')
    dosage_form = models.CharField(max_length=50, default='Tablet')
    strength = models.CharField(max_length=50, default='500mg')
    manufacturer = models.CharField(max_length=100, default='PharmaCorp')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=10.00)
    stock_quantity = models.IntegerField(default=100)
    reorder_level = models.IntegerField(default=20)
    expiry_date = models.DateField()
    status = models.CharField(max_length=30, default='In Stock')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.stock_quantity} left)"


class LabTest(models.Model):
    test_id = models.CharField(max_length=20, unique=True, default='LAB-8001')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='lab_tests')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='lab_tests')
    test_name = models.CharField(max_length=150)
    category = models.CharField(max_length=80, default='Hematology')
    sample_type = models.CharField(max_length=50, default='Blood')
    sample_status = models.CharField(max_length=50, default='Collected')
    results = models.TextField(blank=True, null=True)
    normal_range = models.CharField(max_length=100, blank=True, null=True)
    units = models.CharField(max_length=30, blank=True, null=True)
    interpretation = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, default='Completed')
    ordered_date = models.DateField(default=timezone.now)
    completed_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.test_id} - {self.test_name}"


class Bill(models.Model):
    invoice_number = models.CharField(max_length=25, unique=True, default='INV-9001')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills')
    bill_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    payment_status = models.CharField(max_length=30, default='Pending')
    payment_method = models.CharField(max_length=50, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice_number}: ${self.total_amount} ({self.payment_status})"


class EmergencyCase(models.Model):
    PRIORITY_CHOICES = [
        ('Critical', 'Critical'),
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low')
    ]
    case_number = models.CharField(max_length=20, unique=True, default='EMG-4001')
    patient_name = models.CharField(max_length=120)
    age = models.IntegerField(default=40)
    gender = models.CharField(max_length=10, default='Male')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Critical')
    presenting_complaints = models.TextField()
    assigned_department = models.CharField(max_length=100, default='Emergency Room')
    attending_doctor = models.CharField(max_length=100, default='Dr. Sarah Jenkins')
    assigned_bed = models.CharField(max_length=30, default='ER-ICU-01')
    bp = models.CharField(max_length=20, default='120/80')
    hr = models.CharField(max_length=20, default='75 bpm')
    rr = models.CharField(max_length=20, default='16 /min')
    spo2 = models.CharField(max_length=20, default='98%')
    temp = models.CharField(max_length=20, default='98.6 F')
    status = models.CharField(max_length=50, default='Admitted')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.case_number} - {self.patient_name} ({self.priority})"
