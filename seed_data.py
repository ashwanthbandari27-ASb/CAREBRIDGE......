from django.core.management.base import BaseCommand
from datetime import date
from hospital.models import Patient, Doctor, Appointment, MedicalRecord, Prescription, Medicine, LabTest, Bill, EmergencyCase

class Command(BaseCommand):
    help = 'Seeds the CareBridge Hospital database with full demo dataset'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing existing data...")
        Patient.objects.all().delete()
        Doctor.objects.all().delete()
        Appointment.objects.all().delete()
        MedicalRecord.objects.all().delete()
        Prescription.objects.all().delete()
        Medicine.objects.all().delete()
        LabTest.objects.all().delete()
        Bill.objects.all().delete()
        EmergencyCase.objects.all().delete()

        self.stdout.write("Seeding Patients...")
        p1 = Patient.objects.create(patient_id='PAT-1001', first_name='Johnathan', last_name='Hayes', age=45, gender='Male', blood_group='O+', phone='+1 (555) 678-2345', email='john@email.com', allergies='Penicillin, Shellfish', medical_history='Hypertension')
        p2 = Patient.objects.create(patient_id='PAT-1002', first_name='Emily', last_name='Watson', age=32, gender='Female', blood_group='A+', phone='+1 (555) 345-6789', email='emily@email.com', allergies='None', medical_history='Asthma')
        p3 = Patient.objects.create(patient_id='PAT-1003', first_name='Robert', last_name='Downey', age=58, gender='Male', blood_group='B+', phone='+1 (555) 456-7890', email='robert@email.com', allergies='Aspirin', medical_history='Type-2 Diabetes')
        p4 = Patient.objects.create(patient_id='PAT-1004', first_name='Sophia', last_name='Martinez', age=28, gender='Female', blood_group='AB-', phone='+1 (555) 567-8901', email='sophia@email.com', allergies='Sulfa Drugs', medical_history='Migraine')
        p5 = Patient.objects.create(patient_id='PAT-1005', first_name='James', last_name='Wilson', age=64, gender='Male', blood_group='O-', phone='+1 (555) 678-9012', email='james@email.com', allergies='Latex', medical_history='Coronary Stent')
        p6 = Patient.objects.create(patient_id='PAT-1006', first_name='Olivia', last_name='Taylor', age=21, gender='Female', blood_group='B-', phone='+1 (555) 789-0123', email='olivia@email.com', allergies='Peanuts', medical_history='None')

        self.stdout.write("Seeding Doctors...")
        d1 = Doctor.objects.create(doctor_id='DOC-201', name='Dr. Sarah Jenkins', email='sarah.jenkins@carebridge.org', phone='+1 (555) 100-2001', specialization='Cardiologist', department='Cardiology', experience_years=14, consultation_fee=150.00, room_number='Room 302', available_days='Mon, Wed, Fri', is_available=True, rating=4.9)
        d2 = Doctor.objects.create(doctor_id='DOC-202', name='Dr. David Chen', email='david.chen@carebridge.org', phone='+1 (555) 100-2002', specialization='Neurologist', department='Neurology', experience_years=11, consultation_fee=180.00, room_number='Room 415', available_days='Tue, Thu, Sat', is_available=True, rating=4.8)
        d3 = Doctor.objects.create(doctor_id='DOC-203', name='Dr. Elena Rodriguez', email='elena.rodriguez@carebridge.org', phone='+1 (555) 100-2003', specialization='Pediatrician', department='Pediatrics', experience_years=9, consultation_fee=120.00, room_number='Room 108', available_days='Mon, Tue, Wed, Thu, Fri', is_available=True, rating=4.9)
        d4 = Doctor.objects.create(doctor_id='DOC-204', name='Dr. Michael Barnes', email='michael.barnes@carebridge.org', phone='+1 (555) 100-2004', specialization='Orthopedic Surgeon', department='Orthopedics', experience_years=16, consultation_fee=160.00, room_number='Room 220', available_days='Wed, Thu, Fri', is_available=True, rating=4.7)
        d5 = Doctor.objects.create(doctor_id='DOC-205', name='Dr. Priya Patel', email='priya.patel@carebridge.org', phone='+1 (555) 100-2005', specialization='General Physician', department='General Medicine', experience_years=8, consultation_fee=90.00, room_number='Room 102', available_days='Mon, Tue, Wed, Thu, Sat', is_available=False, rating=4.6)

        self.stdout.write("Seeding Appointments...")
        Appointment.objects.create(appointment_id='APT-5001', patient=p1, doctor=d1, department='Cardiology', appointment_date=date(2026, 11, 14), appointment_time='09:30 AM', appointment_type='Follow-up', status='Scheduled', symptoms='Hypertension follow-up')
        Appointment.objects.create(appointment_id='APT-5002', patient=p2, doctor=d5, department='General Medicine', appointment_date=date(2026, 11, 14), appointment_time='11:00 AM', appointment_type='Consultation', status='Pending', symptoms='Asthma management checkup')
        Appointment.objects.create(appointment_id='APT-5003', patient=p3, doctor=d4, department='Orthopedics', appointment_date=date(2026, 11, 13), appointment_time='02:00 PM', appointment_type='Checkup', status='Completed', symptoms='Post-operative knee rehabilitation check')
        Appointment.objects.create(appointment_id='APT-5004', patient=p4, doctor=d2, department='Neurology', appointment_date=date(2026, 11, 15), appointment_time='10:30 AM', appointment_type='Consultation', status='Scheduled', symptoms='Migraine evaluation')

        self.stdout.write("Seeding Medical Records...")
        MedicalRecord.objects.create(record_id='MR-3001', patient=p1, doctor=d1, diagnosis='Essential Stage 1 Systemic Hypertension', symptoms='Mild headache, elevated BP readings at home', treatment_plan='Amlodipine 5mg daily, low-sodium diet, aerobic exercise 30min daily', visit_date=date(2026, 10, 14))
        MedicalRecord.objects.create(record_id='MR-3002', patient=p3, doctor=d4, diagnosis='Left Knee Medial Meniscus Tear Repair', symptoms='Joint swelling, limited range of motion', treatment_plan='Physical therapy 3x/week, Celecoxib 200mg for pain control', visit_date=date(2026, 11, 13))

        self.stdout.write("Seeding Prescriptions...")
        Prescription.objects.create(prescription_id='RX-7001', patient=p1, doctor=d1, diagnosis='Stage 1 Hypertension', medications='Amlodipine 5mg (1x daily morning), Atorvastatin 20mg (1x night)', instructions='Monitor blood pressure weekly. Low-sodium diet.', status='Active', issued_date=date(2026, 11, 10))
        Prescription.objects.create(prescription_id='RX-7002', patient=p2, doctor=d5, diagnosis='Mild Persistent Asthma', medications='Albuterol Inhaler (PRN), Montelukast 10mg (1x night)', instructions='Use spacer chamber. Avoid cold air triggers.', status='Active', issued_date=date(2026, 11, 4))

        self.stdout.write("Seeding Medicines...")
        Medicine.objects.create(medicine_code='MED-101', name='Amoxicillin & Clavulanate (Augmentin)', generic_name='Amoxicillin / Clavulanic Acid', category='Antibiotics', dosage_form='Tablet', strength='625mg', unit_price=14.50, stock_quantity=420, reorder_level=50, expiry_date=date(2027, 8, 30), status='In Stock')
        Medicine.objects.create(medicine_code='MED-102', name='Amlodipine Besylate (Norvasc)', generic_name='Amlodipine', category='Cardiovascular', dosage_form='Tablet', strength='5mg', unit_price=8.20, stock_quantity=48, reorder_level=50, expiry_date=date(2027, 4, 15), status='Low Stock')
        Medicine.objects.create(medicine_code='MED-103', name='Atorvastatin Calcium (Lipitor)', generic_name='Atorvastatin', category='Cardiovascular', dosage_form='Tablet', strength='20mg', unit_price=18.00, stock_quantity=280, reorder_level=40, expiry_date=date(2027, 11, 20), status='In Stock')
        Medicine.objects.create(medicine_code='MED-104', name='Metformin HCl (Glucophage)', generic_name='Metformin', category='Antidiabetic', dosage_form='Tablet', strength='500mg', unit_price=6.50, stock_quantity=30, reorder_level=50, expiry_date=date(2026, 12, 31), status='Low Stock')
        Medicine.objects.create(medicine_code='MED-105', name='Albuterol Sulfate Inhaler (ProAir)', generic_name='Albuterol', category='Respiratory', dosage_form='Inhaler', strength='90mcg/actuation', unit_price=32.00, stock_quantity=110, reorder_level=25, expiry_date=date(2027, 6, 10), status='In Stock')

        self.stdout.write("Seeding Bills...")
        Bill.objects.create(invoice_number='INV-9001', patient=p1, bill_date=date(2026, 11, 12), due_date=date(2026, 11, 26), subtotal=250.00, tax_amount=29.51, total_amount=279.51, paid_amount=279.51, payment_status='Paid', payment_method='Credit Card')
        Bill.objects.create(invoice_number='INV-9002', patient=p3, bill_date=date(2026, 11, 13), due_date=date(2026, 11, 27), subtotal=250.00, tax_amount=30.88, total_amount=280.88, paid_amount=150.00, payment_status='Partially Paid', payment_method='Insurance Co-Pay')

        self.stdout.write("Seeding Emergency Cases...")
        EmergencyCase.objects.create(case_number='EMG-4001', patient_name='Marcus Bennett', age=52, gender='Male', priority='Critical', presenting_complaints='Crushing chest pain radiating to left arm, diaphoresis, dyspnea', assigned_department='Cardiology ER', attending_doctor='Dr. Sarah Jenkins', assigned_bed='ER-ICU-03', bp='88/54', hr='118 bpm', rr='26 /min', spo2='91%', temp='98.4 F', status='Admitted')
        EmergencyCase.objects.create(case_number='EMG-4002', patient_name='Chloe Bennett', age=19, gender='Female', priority='High', presenting_complaints='Compound distal radius fracture following motor scooter collision', assigned_department='Trauma ICU', attending_doctor='Dr. Michael Barnes', assigned_bed='ER-Bed-08', bp='124/82', hr='88 bpm', rr='18 /min', spo2='99%', temp='98.6 F', status='Under Observation')
        EmergencyCase.objects.create(case_number='EMG-4003', patient_name='Liam Peterson', age=8, gender='Male', priority='Medium', presenting_complaints='Acute asthmatic bronchospasm, intercostal retractions', assigned_department='Pediatric ER', attending_doctor='Dr. Elena Rodriguez', assigned_bed='ER-Peds-02', bp='105/68', hr='102 bpm', rr='24 /min', spo2='94%', temp='99.1 F', status='Under Observation')
        EmergencyCase.objects.create(case_number='EMG-4004', patient_name='Gregory House', age=61, gender='Male', priority='Low', presenting_complaints='Forearm laceration 4cm from gardening tools', assigned_department='General ER', attending_doctor='Dr. Priya Patel', assigned_bed='ER-Triage-04', bp='128/78', hr='72 bpm', rr='14 /min', spo2='98%', temp='98.2 F', status='Discharged')

        self.stdout.write(self.style.SUCCESS("Successfully seeded CareBridge Hospital database!"))
