from rest_framework import serializers
from .models import Patient, Doctor, Appointment, MedicalRecord, Prescription, Medicine, LabTest, Bill, EmergencyCase

class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    class Meta:
        model = Patient
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.full_name')
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    class Meta:
        model = Appointment
        fields = '__all__'

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.full_name')
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    class Meta:
        model = MedicalRecord
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.full_name')
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    class Meta:
        model = Prescription
        fields = '__all__'

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class LabTestSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.full_name')
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    class Meta:
        model = LabTest
        fields = '__all__'

class BillSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.full_name')
    class Meta:
        model = Bill
        fields = '__all__'

class EmergencyCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyCase
        fields = '__all__'
