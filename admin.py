from django.contrib import admin
from .models import (
    Patient, Doctor, Appointment, MedicalRecord,
    Prescription, Medicine, LabTest, Bill, EmergencyCase
)

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('patient_id', 'full_name', 'age', 'gender', 'blood_group', 'phone', 'allergies')
    search_fields = ('patient_id', 'first_name', 'last_name', 'phone', 'allergies')
    list_filter = ('gender', 'blood_group')

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('doctor_id', 'name', 'specialization', 'department', 'room_number', 'is_available', 'consultation_fee')
    search_fields = ('doctor_id', 'name', 'specialization', 'department')
    list_filter = ('department', 'is_available')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('appointment_id', 'patient', 'doctor', 'appointment_date', 'appointment_time', 'status')
    search_fields = ('appointment_id', 'patient__first_name', 'patient__last_name', 'doctor__name')
    list_filter = ('status', 'appointment_date', 'department')

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('record_id', 'patient', 'doctor', 'diagnosis', 'visit_date')
    search_fields = ('record_id', 'patient__first_name', 'diagnosis')

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('prescription_id', 'patient', 'doctor', 'diagnosis', 'status', 'issued_date')
    search_fields = ('prescription_id', 'patient__first_name')
    list_filter = ('status',)

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ('medicine_code', 'name', 'category', 'strength', 'stock_quantity', 'unit_price', 'status')
    search_fields = ('medicine_code', 'name', 'generic_name', 'category')
    list_filter = ('category', 'status')

@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ('test_id', 'test_name', 'patient', 'doctor', 'category', 'status', 'ordered_date')
    search_fields = ('test_id', 'test_name', 'patient__first_name')
    list_filter = ('category', 'status')

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'patient', 'total_amount', 'paid_amount', 'payment_status', 'bill_date')
    search_fields = ('invoice_number', 'patient__first_name')
    list_filter = ('payment_status', 'payment_method')

@admin.register(EmergencyCase)
class EmergencyCaseAdmin(admin.ModelAdmin):
    list_display = ('case_number', 'patient_name', 'priority', 'assigned_bed', 'attending_doctor', 'status')
    search_fields = ('case_number', 'patient_name', 'complaint')
    list_filter = ('priority', 'status')
