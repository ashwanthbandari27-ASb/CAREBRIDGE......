/**
 * CareBridge Smart Healthcare Management System - Core Dashboard JavaScript Engine
 */

// Initial Seed Data Store
const CareBridgeStore = {
  stats: {
    totalPatients: 6,
    totalDoctors: 5,
    todayAppointments: 3,
    pendingAppointments: 1,
    completedAppointments: 2,
    availableBeds: '108/150',
    emergencyCases: 4,
    totalRevenue: '$34,800.00'
  },
  patients: [
    { id: 'PAT-1001', name: 'Johnathan Hayes', age: 45, gender: 'Male', blood: 'O+', phone: '+1 (555) 678-2345', email: 'john@email.com', allergies: 'Penicillin, Shellfish', history: 'Hypertension' },
    { id: 'PAT-1002', name: 'Emily Watson', age: 32, gender: 'Female', blood: 'A+', phone: '+1 (555) 345-6789', email: 'emily@email.com', allergies: 'None', history: 'Asthma' },
    { id: 'PAT-1003', name: 'Robert Downey', age: 58, gender: 'Male', blood: 'B+', phone: '+1 (555) 456-7890', email: 'robert@email.com', allergies: 'Aspirin', history: 'Type-2 Diabetes' },
    { id: 'PAT-1004', name: 'Sophia Martinez', age: 28, gender: 'Female', blood: 'AB-', phone: '+1 (555) 567-8901', email: 'sophia@email.com', allergies: 'Sulfa Drugs', history: 'Migraine' },
    { id: 'PAT-1005', name: 'James Wilson', age: 64, gender: 'Male', blood: 'O-', phone: '+1 (555) 678-9012', email: 'james@email.com', allergies: 'Latex', history: 'Coronary Stent' },
    { id: 'PAT-1006', name: 'Olivia Taylor', age: 21, gender: 'Female', blood: 'B-', phone: '+1 (555) 789-0123', email: 'olivia@email.com', allergies: 'Peanuts', history: 'None' }
  ],
  doctors: [
    { id: 'DOC-201', name: 'Dr. Sarah Jenkins', spec: 'Cardiologist', dept: 'Cardiology', exp: 14, fee: 150, room: 'Room 302', status: 'Available', rating: 4.9 },
    { id: 'DOC-202', name: 'Dr. David Chen', spec: 'Neurologist', dept: 'Neurology', exp: 11, fee: 180, room: 'Room 415', status: 'Available', rating: 4.8 },
    { id: 'DOC-203', name: 'Dr. Elena Rodriguez', spec: 'Pediatrician', dept: 'Pediatrics', exp: 9, fee: 120, room: 'Room 108', status: 'Available', rating: 4.9 },
    { id: 'DOC-204', name: 'Dr. Michael Barnes', spec: 'Orthopedic Surgeon', dept: 'Orthopedics', exp: 16, fee: 160, room: 'Room 220', status: 'Available', rating: 4.7 },
    { id: 'DOC-205', name: 'Dr. Priya Patel', spec: 'General Physician', dept: 'General Medicine', exp: 8, fee: 90, room: 'Room 102', status: 'Unavailable', rating: 4.6 }
  ],
  appointments: [
    { id: 'APT-5001', patient: 'Johnathan Hayes', doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology', date: '2026-11-14', time: '09:30 AM', status: 'Scheduled', type: 'Follow-up' },
    { id: 'APT-5002', patient: 'Emily Watson', doctor: 'Dr. Priya Patel', dept: 'General Medicine', date: '2026-11-14', time: '11:00 AM', status: 'Pending', type: 'Consultation' },
    { id: 'APT-5003', patient: 'Robert Downey', doctor: 'Dr. Michael Barnes', dept: 'Orthopedics', date: '2026-11-13', time: '02:00 PM', status: 'Completed', type: 'Checkup' },
    { id: 'APT-5004', patient: 'Sophia Martinez', doctor: 'Dr. David Chen', dept: 'Neurology', date: '2026-11-15', time: '10:30 AM', status: 'Scheduled', type: 'Consultation' },
    { id: 'APT-5005', patient: 'Olivia Taylor', doctor: 'Dr. Elena Rodriguez', dept: 'Pediatrics', date: '2026-11-16', time: '09:00 AM', status: 'Scheduled', type: 'Vaccination' },
    { id: 'APT-5006', patient: 'James Wilson', doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology', date: '2026-11-10', time: '03:15 PM', status: 'Completed', type: 'Review' },
    { id: 'APT-5007', patient: 'Robert Downey', doctor: 'Dr. Priya Patel', dept: 'General Medicine', date: '2026-11-09', time: '01:00 PM', status: 'Cancelled', type: 'Routine' }
  ],
  emergency: [
    { id: 'EMG-4001', patient: 'Marcus Bennett', age: 52, priority: 'Critical', complaint: 'Crushing chest pain radiating to left arm', dept: 'Cardiology ER', doctor: 'Dr. Sarah Jenkins', bed: 'ER-ICU-03', bp: '88/54', hr: '118 bpm', spo2: '91%', temp: '98.4 F', status: 'Admitted' },
    { id: 'EMG-4002', patient: 'Chloe Bennett', age: 19, priority: 'High', complaint: 'Compound distal radius fracture', dept: 'Trauma ICU', doctor: 'Dr. Michael Barnes', bed: 'ER-Bed-08', bp: '124/82', hr: '88 bpm', spo2: '99%', temp: '98.6 F', status: 'Under Observation' },
    { id: 'EMG-4003', patient: 'Liam Peterson', age: 8, priority: 'Medium', complaint: 'Acute asthmatic bronchospasm', dept: 'Pediatric ER', doctor: 'Dr. Elena Rodriguez', bed: 'ER-Peds-02', bp: '105/68', hr: '102 bpm', spo2: '94%', temp: '99.1 F', status: 'Under Observation' },
    { id: 'EMG-4004', patient: 'Gregory House', age: 61, priority: 'Low', complaint: 'Forearm laceration 4cm', dept: 'General ER', doctor: 'Dr. Priya Patel', bed: 'ER-Triage-04', bp: '128/78', hr: '72 bpm', spo2: '98%', temp: '98.2 F', status: 'Discharged' }
  ],
  pharmacy: [
    { id: 'MED-101', name: 'Amoxicillin & Clavulanate (Augmentin)', cat: 'Antibiotics', stock: 420, price: 14.50, exp: '2027-08-30', status: 'In Stock' },
    { id: 'MED-102', name: 'Amlodipine Besylate (Norvasc)', cat: 'Cardiovascular', stock: 48, price: 8.20, exp: '2027-04-15', status: 'Low Stock' },
    { id: 'MED-103', name: 'Atorvastatin Calcium (Lipitor)', cat: 'Cardiovascular', stock: 280, price: 18.00, exp: '2027-11-20', status: 'In Stock' },
    { id: 'MED-104', name: 'Metformin HCl (Glucophage)', cat: 'Antidiabetic', stock: 30, price: 6.50, exp: '2026-12-31', status: 'Low Stock' },
    { id: 'MED-105', name: 'Albuterol Sulfate Inhaler (ProAir)', cat: 'Respiratory', stock: 110, price: 32.00, exp: '2027-06-10', status: 'In Stock' },
    { id: 'MED-106', name: 'Paracetamol / Acetaminophen (Tylenol)', cat: 'Analgesics', stock: 850, price: 3.50, exp: '2028-01-15', status: 'In Stock' },
    { id: 'MED-107', name: 'Celecoxib Capsules (Celebrex)', cat: 'Analgesics', stock: 15, price: 22.50, exp: '2027-03-25', status: 'Low Stock' },
    { id: 'MED-108', name: 'Vitamin D3 & Calcium Carbonate', cat: 'Vitamins', stock: 340, price: 11.00, exp: '2028-05-18', status: 'In Stock' }
  ],
  prescriptions: [
    { id: 'RX-7001', patient: 'Johnathan Hayes', doctor: 'Dr. Sarah Jenkins', date: '2026-11-10', meds: 'Amlodipine 5mg (1x daily), Atorvastatin 20mg (1x night)', notes: 'Monitor BP weekly. Low-sodium diet.', status: 'Active' },
    { id: 'RX-7002', patient: 'Emily Watson', doctor: 'Dr. Priya Patel', date: '2026-11-04', meds: 'Albuterol Inhaler (PRN), Montelukast 10mg (1x night)', notes: 'Use spacer chamber. Avoid cold air triggers.', status: 'Active' },
    { id: 'RX-7003', patient: 'Robert Downey', doctor: 'Dr. Michael Barnes', date: '2026-11-13', meds: 'Celecoxib 200mg (2x daily), Glucosamine 1500mg', notes: 'Take after meals. Discontinue if GI irritation occurs.', status: 'Active' }
  ],
  bills: [
    { id: 'INV-9001', patient: 'Johnathan Hayes', date: '2026-11-12', due: '2026-11-26', total: 279.51, paid: 279.51, status: 'Paid', method: 'Credit Card' },
    { id: 'INV-9002', patient: 'Robert Downey', date: '2026-11-13', due: '2026-11-27', total: 280.88, paid: 150.00, status: 'Partially Paid', method: 'Insurance Co-Pay' },
    { id: 'INV-9003', patient: 'Sophia Martinez', date: '2026-11-13', due: '2026-11-27', total: 630.00, paid: 0.00, status: 'Pending', method: 'Pending Payment' }
  ],
  records: [
    { id: 'MR-3001', patient: 'Johnathan Hayes', doctor: 'Dr. Sarah Jenkins', date: '2026-10-14', diagnosis: 'Essential Stage 1 Systemic Hypertension', treatment: 'Amlodipine 5mg daily, low-sodium diet, aerobic exercise' },
    { id: 'MR-3002', patient: 'Robert Downey', doctor: 'Dr. Michael Barnes', date: '2026-11-13', diagnosis: 'Left Knee Medial Meniscus Tear Repair', treatment: 'Targeted physical therapy, celecoxib for pain management' },
    { id: 'MR-3003', patient: 'Sophia Martinez', doctor: 'Dr. David Chen', date: '2026-10-22', diagnosis: 'Vestibular Migraine with Visual Aura', treatment: 'Sumatriptan 50mg abortive, Magnesium glycinate prophylaxis' }
  ]
};

// Tab Switching
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-view');
  tabs.forEach(t => t.classList.add('hidden'));

  const active = document.getElementById('tab-' + tabName);
  if (active) {
    active.classList.remove('hidden');
  }

  // Update nav item highlighting
  document.querySelectorAll('.nav-link').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('bg-brand-500', 'text-white', 'font-bold');
      btn.classList.remove('text-slate-600', 'hover:bg-slate-50');
    } else {
      btn.classList.remove('bg-brand-500', 'text-white', 'font-bold');
      btn.classList.add('text-slate-600', 'hover:bg-slate-50');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Global Search
function filterGlobal(val) {
  if (!val) return;
  const q = val.toLowerCase();
  if (q.includes('pat')) switchTab('patients');
  else if (q.includes('doc')) switchTab('doctors');
  else if (q.includes('apt') || q.includes('appoint')) switchTab('appointments');
  else if (q.includes('rx') || q.includes('presc')) switchTab('prescriptions');
  else if (q.includes('phar') || q.includes('med')) switchTab('pharmacy');
  else if (q.includes('lab') || q.includes('test')) switchTab('laboratory');
  else if (q.includes('bill') || q.includes('inv')) switchTab('billing');
  else if (q.includes('emg') || q.includes('emerg')) switchTab('emergency');
}

// Doctor Availability Toggle
function toggleDoctorStatus(docId) {
  const doc = CareBridgeStore.doctors.find(d => d.id === docId);
  if (doc) {
    doc.status = doc.status === 'Available' ? 'Unavailable' : 'Available';
    alert(doc.name + ' is now ' + doc.status);
    renderDoctors();
  }
}

// Print Functions
function printDocument(title, contentHtml) {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>${title} - CareBridge</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background: #f8fafc; }
        </style>
      </head>
      <body>
        ${contentHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

console.log('CareBridge Dashboard Engine Initialized.');
