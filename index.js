const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'receptionist', 'patient'], default: 'patient' },
  phone: { type: String },
  avatar: { type: String },
  status: { type: String, default: 'active' },
  doctorRef: { type: String },
  patientRef: { type: String },
  department: { type: String }
}, { timestamps: true });

// Patient Schema
const PatientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  medicalHistory: { type: String },
  allergies: { type: String },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  assignedDoctorId: { type: String },
  status: { type: String, default: 'Active' },
  registrationDate: { type: String }
}, { timestamps: true });

// Doctor Schema
const DoctorSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  specialization: { type: String, required: true },
  department: { type: String, required: true },
  experience: { type: Number, required: true },
  consultationFee: { type: Number, required: true },
  roomNumber: { type: String },
  availableDays: [{ type: String }],
  availableHours: { type: String },
  status: { type: String, enum: ['Available', 'Unavailable', 'On-Leave'], default: 'Available' },
  rating: { type: Number, default: 5.0 },
  avatar: { type: String },
  bio: { type: String }
}, { timestamps: true });

// Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  department: { type: String },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  type: { type: String, default: 'Consultation' },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Pending'], default: 'Scheduled' },
  reason: { type: String },
  notes: { type: String },
  fee: { type: Number }
}, { timestamps: true });

// Medical Record Schema
const MedicalRecordSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  diagnosis: { type: String, required: true },
  symptoms: { type: String },
  treatment: { type: String },
  doctorNotes: { type: String },
  documents: [{
    name: String,
    url: String,
    date: String
  }],
  labReportsRef: [{ type: String }],
  date: { type: String },
  followUpDate: { type: String }
}, { timestamps: true });

// Prescription Schema
const PrescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  appointmentId: { type: String },
  date: { type: String },
  medicines: [{
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String }
  }],
  notes: { type: String },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

// Medicine Schema
const MedicineSchema = new mongoose.Schema({
  medicineId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  genericName: { type: String },
  category: { type: String, required: true },
  dosageForm: { type: String, required: true },
  strength: { type: String },
  stockQuantity: { type: Number, required: true, default: 0 },
  minThresholdQuantity: { type: Number, default: 20 },
  unitPrice: { type: Number, required: true },
  manufacturer: { type: String },
  batchNumber: { type: String },
  expiryDate: { type: String, required: true },
  status: { type: String, default: 'In Stock' },
  location: { type: String }
}, { timestamps: true });

// Lab Test Schema
const LabTestSchema = new mongoose.Schema({
  testId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  testName: { type: String, required: true },
  category: { type: String, required: true },
  testDate: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  cost: { type: Number, default: 0 },
  resultSummary: { type: String },
  details: [{
    parameter: String,
    value: String,
    normalRange: String,
    unit: String,
    status: String
  }],
  doctorNotes: { type: String },
  reportFile: { type: String }
}, { timestamps: true });

// Bill Schema
const BillSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String },
  date: { type: String, required: true },
  dueDate: { type: String },
  items: [{
    description: String,
    category: String,
    amount: Number
  }],
  consultationFee: { type: Number, default: 0 },
  labCharges: { type: Number, default: 0 },
  medicineCharges: { type: Number, default: 0 },
  otherCharges: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partially Paid', 'Cancelled'], default: 'Pending' },
  paymentMethod: { type: String, default: 'Pending Payment' },
  transactionId: { type: String },
  notes: { type: String }
}, { timestamps: true });

// Emergency Case Schema
const EmergencyCaseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
  chiefComplaint: { type: String, required: true },
  assignedDoctorId: { type: String },
  assignedDoctorName: { type: String },
  department: { type: String, required: true },
  status: { type: String, enum: ['Admitted', 'Under Observation', 'Discharged', 'Transferred to ICU'], default: 'Admitted' },
  contactNumber: { type: String, required: true },
  vitals: {
    bp: String,
    heartRate: String,
    spO2: String,
    temp: String
  },
  bedNumber: { type: String },
  registeredAt: { type: String },
  notes: { type: String }
}, { timestamps: true });

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, default: 'all' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'urgent'], default: 'info' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Patient: mongoose.models.Patient || mongoose.model('Patient', PatientSchema),
  Doctor: mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema),
  Appointment: mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema),
  MedicalRecord: mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema),
  Prescription: mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema),
  Medicine: mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema),
  LabTest: mongoose.models.LabTest || mongoose.model('LabTest', LabTestSchema),
  Bill: mongoose.models.Bill || mongoose.model('Bill', BillSchema),
  EmergencyCase: mongoose.models.EmergencyCase || mongoose.model('EmergencyCase', EmergencyCaseSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
};

