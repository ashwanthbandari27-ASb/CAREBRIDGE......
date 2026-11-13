const { getModel } = require('../config/db');

const getAllPrescriptions = async (req, res) => {
  try {
    const { patientId, doctorId, search } = req.query;
    const rxCol = getModel('prescriptions');
    let prescriptions = await rxCol.find();

    if (req.user && req.user.role === 'patient') {
      const patientsCol = getModel('patients');
      const patient = await patientsCol.findOne({ email: req.user.email });
      if (patient) {
        prescriptions = prescriptions.filter(p => p.patientId === patient._id || p.patientId === patient.patientId);
      }
    }

    if (patientId) {
      prescriptions = prescriptions.filter(p => p.patientId === patientId);
    }

    if (doctorId) {
      prescriptions = prescriptions.filter(p => p.doctorId === doctorId);
    }

    if (search) {
      const q = search.toLowerCase();
      prescriptions = prescriptions.filter(p =>
        (p.patientName && p.patientName.toLowerCase().includes(q)) ||
        (p.doctorName && p.doctorName.toLowerCase().includes(q)) ||
        (p.prescriptionId && p.prescriptionId.toLowerCase().includes(q)) ||
        (p.medicines && p.medicines.some(m => m.medicineName && m.medicineName.toLowerCase().includes(q)))
      );
    }

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const rxCol = getModel('prescriptions');
    const rx = await rxCol.findById(id);

    if (!rx) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    res.json({
      success: true,
      prescription: rx
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, medicines, notes } = req.body;

    if (!patientId || !doctorId || !medicines || !medicines.length) {
      return res.status(400).json({
        success: false,
        message: 'Patient, Doctor, and at least one medicine line item are required.'
      });
    }

    const patientsCol = getModel('patients');
    const doctorsCol = getModel('doctors');

    const patient = await patientsCol.findById(patientId);
    const doctor = await doctorsCol.findById(doctorId);

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const rxCol = getModel('prescriptions');
    const all = await rxCol.find();

    let maxIdNum = 7000;
    all.forEach(p => {
      if (p.prescriptionId && p.prescriptionId.startsWith('RX-')) {
        const num = parseInt(p.prescriptionId.replace('RX-', ''), 10);
        if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
      }
    });
    const prescriptionId = `RX-${maxIdNum + 1}`;

    const newPrescription = await rxCol.create({
      prescriptionId,
      patientId: patient._id,
      patientName: patient.name,
      doctorId: doctor._id,
      doctorName: doctor.name,
      appointmentId: appointmentId || '',
      date: new Date().toISOString().split('T')[0],
      medicines,
      notes: notes || 'Take medications strictly as advised with adequate hydration.',
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: `Prescription ${prescriptionId} issued successfully.`,
      prescription: newPrescription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const rxCol = getModel('prescriptions');

    const updated = await rxCol.findByIdAndUpdate(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    res.json({
      success: true,
      message: 'Prescription updated.',
      prescription: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const rxCol = getModel('prescriptions');

    const deleted = await rxCol.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    res.json({
      success: true,
      message: 'Prescription record deleted.',
      prescription: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription
};

