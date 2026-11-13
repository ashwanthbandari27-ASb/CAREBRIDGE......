-- ============================================================================
-- CAREBRIDGE SMART HEALTHCARE MANAGEMENT SYSTEM
-- SQLite Database Schema & Seed Data
-- ============================================================================

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS hospital_patient (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    age INTEGER NOT NULL DEFAULT 30,
    gender VARCHAR(10) NOT NULL DEFAULT 'Male',
    blood_group VARCHAR(5) NOT NULL DEFAULT 'O+',
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(254),
    address TEXT,
    emergency_contact VARCHAR(100),
    allergies TEXT NOT NULL,
    medical_history TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctors Table
CREATE TABLE IF NOT EXISTS hospital_doctor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 5,
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 100.00,
    room_number VARCHAR(30) NOT NULL DEFAULT 'Room 101',
    available_days VARCHAR(150) NOT NULL DEFAULT 'Mon, Wed, Fri',
    is_available BOOLEAN NOT NULL DEFAULT 1,
    rating DECIMAL(3,1) NOT NULL DEFAULT 4.8,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS hospital_appointment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id VARCHAR(20) NOT NULL UNIQUE,
    patient_id INTEGER NOT NULL REFERENCES hospital_patient(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES hospital_doctor(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    appointment_type VARCHAR(50) NOT NULL DEFAULT 'General Consultation',
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
    symptoms TEXT,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Medical Records Table
CREATE TABLE IF NOT EXISTS hospital_medicalrecord (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id VARCHAR(20) NOT NULL UNIQUE,
    patient_id INTEGER NOT NULL REFERENCES hospital_patient(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES hospital_doctor(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    symptoms TEXT,
    physical_examination TEXT,
    treatment_plan TEXT NOT NULL,
    notes TEXT,
    visit_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Prescriptions Table
CREATE TABLE IF NOT EXISTS hospital_prescription (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id VARCHAR(20) NOT NULL UNIQUE,
    patient_id INTEGER NOT NULL REFERENCES hospital_patient(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES hospital_doctor(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES hospital_appointment(id) ON DELETE SET NULL,
    diagnosis VARCHAR(255) NOT NULL DEFAULT 'General',
    medications TEXT NOT NULL,
    instructions TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    issued_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Pharmacy Inventory Table
CREATE TABLE IF NOT EXISTS hospital_medicine (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150),
    category VARCHAR(80) NOT NULL DEFAULT 'General',
    dosage_form VARCHAR(50) NOT NULL DEFAULT 'Tablet',
    strength VARCHAR(50) NOT NULL DEFAULT '500mg',
    manufacturer VARCHAR(100) NOT NULL DEFAULT 'PharmaCorp',
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    stock_quantity INTEGER NOT NULL DEFAULT 100,
    reorder_level INTEGER NOT NULL DEFAULT 20,
    expiry_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'In Stock',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Laboratory Tests Table
CREATE TABLE IF NOT EXISTS hospital_labtest (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id VARCHAR(20) NOT NULL UNIQUE,
    patient_id INTEGER NOT NULL REFERENCES hospital_patient(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES hospital_doctor(id) ON DELETE CASCADE,
    test_name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Hematology',
    sample_type VARCHAR(50) NOT NULL DEFAULT 'Blood',
    sample_status VARCHAR(50) NOT NULL DEFAULT 'Collected',
    results TEXT,
    normal_range VARCHAR(100),
    units VARCHAR(30),
    interpretation TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Completed',
    ordered_date DATE NOT NULL,
    completed_date DATE
);

-- 8. Billing & Invoices Table
CREATE TABLE IF NOT EXISTS hospital_bill (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number VARCHAR(25) NOT NULL UNIQUE,
    patient_id INTEGER NOT NULL REFERENCES hospital_patient(id) ON DELETE CASCADE,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Emergency Triage Table
CREATE TABLE IF NOT EXISTS hospital_emergencycase (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_number VARCHAR(20) NOT NULL UNIQUE,
    patient_name VARCHAR(120) NOT NULL,
    age INTEGER NOT NULL DEFAULT 40,
    gender VARCHAR(10) NOT NULL DEFAULT 'Male',
    priority VARCHAR(20) NOT NULL DEFAULT 'Critical',
    presenting_complaints TEXT NOT NULL,
    assigned_department VARCHAR(100) NOT NULL DEFAULT 'Emergency Room',
    attending_doctor VARCHAR(100) NOT NULL DEFAULT 'Dr. Sarah Jenkins',
    assigned_bed VARCHAR(30) NOT NULL DEFAULT 'ER-ICU-01',
    bp VARCHAR(20) NOT NULL DEFAULT '120/80',
    hr VARCHAR(20) NOT NULL DEFAULT '75 bpm',
    rr VARCHAR(20) NOT NULL DEFAULT '16 /min',
    spo2 VARCHAR(20) NOT NULL DEFAULT '98%',
    temp VARCHAR(20) NOT NULL DEFAULT '98.6 F',
    status VARCHAR(50) NOT NULL DEFAULT 'Admitted',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED DATA INSERTIONS
-- ============================================================================

INSERT INTO hospital_patient (id, patient_id, first_name, last_name, age, gender, blood_group, phone, email, allergies, medical_history) VALUES
(1, 'PAT-1001', 'Johnathan', 'Hayes', 45, 'Male', 'O+', '+1 (555) 678-2345', 'john@email.com', 'Penicillin, Shellfish', 'Hypertension'),
(2, 'PAT-1002', 'Emily', 'Watson', 32, 'Female', 'A+', '+1 (555) 345-6789', 'emily@email.com', 'None', 'Asthma'),
(3, 'PAT-1003', 'Robert', 'Downey', 58, 'Male', 'B+', '+1 (555) 456-7890', 'robert@email.com', 'Aspirin', 'Type-2 Diabetes'),
(4, 'PAT-1004', 'Sophia', 'Martinez', 28, 'Female', 'AB-', '+1 (555) 567-8901', 'sophia@email.com', 'Sulfa Drugs', 'Migraine'),
(5, 'PAT-1005', 'James', 'Wilson', 64, 'Male', 'O-', '+1 (555) 678-9012', 'james@email.com', 'Latex', 'Coronary Stent'),
(6, 'PAT-1006', 'Olivia', 'Taylor', 21, 'Female', 'B-', '+1 (555) 789-0123', 'olivia@email.com', 'Peanuts', 'None');

INSERT INTO hospital_doctor (id, doctor_id, name, email, phone, specialization, department, experience_years, consultation_fee, room_number, available_days, is_available, rating) VALUES
(1, 'DOC-201', 'Dr. Sarah Jenkins', 'sarah.jenkins@carebridge.org', '+1 (555) 100-2001', 'Cardiologist', 'Cardiology', 14, 150.00, 'Room 302', 'Mon, Wed, Fri', 1, 4.9),
(2, 'DOC-202', 'Dr. David Chen', 'david.chen@carebridge.org', '+1 (555) 100-2002', 'Neurologist', 'Neurology', 11, 180.00, 'Room 415', 'Tue, Thu, Sat', 1, 4.8),
(3, 'DOC-203', 'Dr. Elena Rodriguez', 'elena.rodriguez@carebridge.org', '+1 (555) 100-2003', 'Pediatrician', 'Pediatrics', 9, 120.00, 'Room 108', 'Mon, Tue, Wed, Thu, Fri', 1, 4.9),
(4, 'DOC-204', 'Dr. Michael Barnes', 'michael.barnes@carebridge.org', '+1 (555) 100-2004', 'Orthopedic Surgeon', 'Orthopedics', 16, 160.00, 'Room 220', 'Wed, Thu, Fri', 1, 4.7),
(5, 'DOC-205', 'Dr. Priya Patel', 'priya.patel@carebridge.org', '+1 (555) 100-2005', 'General Physician', 'General Medicine', 8, 90.00, 'Room 102', 'Mon, Tue, Wed, Thu, Sat', 0, 4.6);

INSERT INTO hospital_appointment (id, appointment_id, patient_id, doctor_id, department, appointment_date, appointment_time, appointment_type, status, symptoms) VALUES
(1, 'APT-5001', 1, 1, 'Cardiology', '2026-11-14', '09:30 AM', 'Follow-up', 'Scheduled', 'Hypertension review'),
(2, 'APT-5002', 2, 5, 'General Medicine', '2026-11-14', '11:00 AM', 'Consultation', 'Pending', 'Asthma checkup'),
(3, 'APT-5003', 3, 4, 'Orthopedics', '2026-11-13', '02:00 PM', 'Checkup', 'Completed', 'Knee post-op follow-up'),
(4, 'APT-5004', 4, 2, 'Neurology', '2026-11-15', '10:30 AM', 'Consultation', 'Scheduled', 'Migraine review');

INSERT INTO hospital_medicine (id, medicine_code, name, generic_name, category, dosage_form, strength, unit_price, stock_quantity, reorder_level, expiry_date, status) VALUES
(1, 'MED-101', 'Amoxicillin & Clavulanate (Augmentin)', 'Amoxicillin / Clavulanate', 'Antibiotics', 'Tablet', '625mg', 14.50, 420, 50, '2027-08-30', 'In Stock'),
(2, 'MED-102', 'Amlodipine Besylate (Norvasc)', 'Amlodipine', 'Cardiovascular', 'Tablet', '5mg', 8.20, 48, 50, '2027-04-15', 'Low Stock'),
(3, 'MED-103', 'Atorvastatin Calcium (Lipitor)', 'Atorvastatin', 'Cardiovascular', 'Tablet', '20mg', 18.00, 280, 40, '2027-11-20', 'In Stock'),
(4, 'MED-104', 'Metformin HCl (Glucophage)', 'Metformin', 'Antidiabetic', 'Tablet', '500mg', 6.50, 30, 50, '2026-12-31', 'Low Stock'),
(5, 'MED-105', 'Albuterol Sulfate Inhaler (ProAir)', 'Albuterol', 'Respiratory', 'Inhaler', '90mcg', 32.00, 110, 25, '2027-06-10', 'In Stock');

INSERT INTO hospital_emergencycase (id, case_number, patient_name, age, gender, priority, presenting_complaints, assigned_department, attending_doctor, assigned_bed, bp, hr, rr, spo2, temp, status) VALUES
(1, 'EMG-4001', 'Marcus Bennett', 52, 'Male', 'Critical', 'Crushing chest pain radiating to left arm', 'Cardiology ER', 'Dr. Sarah Jenkins', 'ER-ICU-03', '88/54', '118 bpm', '26 /min', '91%', '98.4 F', 'Admitted'),
(2, 'EMG-4002', 'Chloe Bennett', 19, 'Female', 'High', 'Compound distal radius fracture', 'Trauma ICU', 'Dr. Michael Barnes', 'ER-Bed-08', '124/82', '88 bpm', '18 /min', '99%', '98.6 F', 'Under Observation'),
(3, 'EMG-4003', 'Liam Peterson', 8, 'Male', 'Medium', 'Acute asthmatic bronchospasm', 'Pediatric ER', 'Dr. Elena Rodriguez', 'ER-Peds-02', '105/68', '102 bpm', '24 /min', '94%', '99.1 F', 'Under Observation'),
(4, 'EMG-4004', 'Gregory House', 61, 'Male', 'Low', 'Forearm laceration 4cm', 'General ER', 'Dr. Priya Patel', 'ER-Triage-04', '128/78', '72 bpm', '14 /min', '98%', '98.2 F', 'Discharged');
