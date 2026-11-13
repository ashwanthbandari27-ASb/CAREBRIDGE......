const { getModel } = require('../config/db');

const getAllPatients = async (req, res) => {
  try {
    const { search, bloodGroup, gender } = req.query;
    const patientsCol = getModel('patients');
    let patients = await patientsCol.find();

    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.patientId && p.patientId.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    }

    if (bloodGroup && bloodGroup !== 'All') {
      patients = patients.filter(p => p.bloodGroup === bloodGroup);
    }

    if (gender && gender !== 'All') {
      patients = patients.filter(p => p.gender && p.gender.toLowerCase() === gender.toLowerCase());
    }

    res.json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patientsCol = getModel('patients');
    const patient = await patientsCol.findById(id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Also fetch associated clinical records
    const appointmentsCol = getModel('appointments');
    const recordsCol = getModel('medicalRecords');
    const prescriptionsCol = getModel('prescriptions');
    const labCol = getModel('labTests');
    const billsCol = getModel('bills');

    const appointments = await appointmentsCol.find({ patientId: patient._id });
    const medicalRecords = await recordsCol.find({ patientId: patient._id });
    const prescriptions = await prescriptionsCol.find({ patientId: patient._id });
    const labTests = await labCol.find({ patientId: patient._id });
    const bills = await billsCol.find({ patientId: patient._id });

    res.json({
      success: true,
      patient: {
        ...patient,
        appointments,
        medicalRecords,
        prescriptions,
        labTests,
        bills
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPatient = async (req, res) => {
  try {
    const { name, age, gender, bloodGroup, phone, email, address, medicalHistory, allergies, emergencyContact, assignedDoctorId } = req.body;

    if (!name || !age || !gender || !bloodGroup || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, age, gender, blood group, and phone are required fields.'
      });
    }

    const patientsCol = getModel('patients');
    const all = await patientsCol.find();

    // Auto-generate patient ID: PAT-1001, PAT-1002...
    let maxIdNum = 1000;
    all.forEach(p => {
      if (p.patientId && p.patientId.startsWith('PAT-')) {
        const num = parseInt(p.patientId.replace('PAT-', ''), 10);
        if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
      }
    });
    const patientId = `PAT-${maxIdNum + 1}`;

    const newPatient = await patientsCol.create({
      patientId,
      name,
      age: Number(age),
      gender,
      bloodGroup,
      phone,
      email: email || '',
      address: address || '',
      medicalHistory: medicalHistory || 'None reported',
      allergies: allergies || 'None',
      emergencyContact: emergencyContact || { name: '', relation: '', phone: '' },
      assignedDoctorId: assignedDoctorId || '',
      status: 'Active',
      registrationDate: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: `Patient ${patientId} registered successfully!`,
      patient: newPatient
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patientsCol = getModel('patients');

    const updated = await patientsCol.findByIdAndUpdate(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.json({
      success: true,
      message: 'Patient profile updated successfully.',
      patient: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patientsCol = getModel('patients');

    const deleted = await patientsCol.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.json({
      success: true,
      message: `Patient ${deleted.name} (${deleted.patientId}) deleted successfully.`,
      patient: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};

