from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StatsView, PatientViewSet, DoctorViewSet, AppointmentViewSet,
    MedicalRecordViewSet, PrescriptionViewSet, MedicineViewSet,
    LabTestViewSet, BillViewSet, EmergencyCaseViewSet
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'records', MedicalRecordViewSet)
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'pharmacy', MedicineViewSet)
router.register(r'laboratory', LabTestViewSet)
router.register(r'billing', BillViewSet)
router.register(r'emergency', EmergencyCaseViewSet)

urlpatterns = [
    path('stats/', StatsView.as_view(), name='hospital-stats'),
    path('', include(router.urls)),
]
