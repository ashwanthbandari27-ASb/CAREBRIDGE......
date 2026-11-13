const { getModel } = require('../config/db');

const getAllRecords = async (req, res) => {
  try {
    const { patientId, doctorId, search } = req.query;
    const recordsCol = getModel('medicalRecords');
    let records = await recordsCol.find();

    // If patient user, limit to their records
    if (req.user && req.user.role === 'patient') {
      const patientsCol = getModel('patients');
      const patient = await patientsCol.findOne({ email: req.user.email });
      if (patient) {
        records = records.filter(r => r.patientId === patient._id || r.patientId === patient.patientId);
      }
    }

    if (patientId) {
      records = records.filter(r => r.patientId === patientId);
    }

    if (doctorId) {
      records = records.filter(r => r.doctorId === doctorId);
    }

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(r =>
        (r.patientName && r.patientName.toLowerCase().includes(q)) ||
        (r.diagnosis && r.diagnosis.toLowerCase().includes(q)) ||
        (r.recordId && r.recordId.toLowerCase().includes(q)) ||
        (r.doctorName && r.doctorName.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const recordsCol = getModel('medicalRecords');
    const record = await recordsCol.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    res.json({
      success: true,
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRecord = async (req, res) => {
  try {
    const { patientId, doctorId, diagnosis, symptoms, treatment, doctorNotes, followUpDate, documents } = req.body;

    if (!patientId || !doctorId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Patient, Doctor, and Diagnosis are required fields.'
      });
    }

    const patientsCol = getModel('patients');
    const doctorsCol = getModel('doctors');

    const patient = await patientsCol.findById(patientId);
    const doctor = await doctorsCol.findById(doctorId);

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const recordsCol = getModel('medicalRecords');
    const all = await recordsCol.find();

    let maxIdNum = 3000;
    all.forEach(r => {
      if (r.recordId && r.recordId.startsWith('MR-')) {
        const num = parseInt(r.recordId.replace('MR-', ''), 10);
        if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
      }
    });
    const recordId = `MR-${maxIdNum + 1}`;

    const newRecord = await recordsCol.create({
      recordId,
      patientId: patient._id,
      patientName: patient.name,
      doctorId: doctor._id,
      doctorName: doctor.name,
      diagnosis,
      symptoms: symptoms || '',
      treatment: treatment || '',
      doctorNotes: doctorNotes || '',
      documents: documents || [],
      labReportsRef: [],
      date: new Date().toISOString().split('T')[0],
      followUpDate: followUpDate || ''
    });

    res.status(201).json({
      success: true,
      message: `Medical record ${recordId} filed successfully.`,
      record: newRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const recordsCol = getModel('medicalRecords');

    const updated = await recordsCol.findByIdAndUpdate(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    res.json({
      success: true,
      message: 'Medical record updated.',
      record: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const recordsCol = getModel('medicalRecords');

    const deleted = await recordsCol.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    res.json({
      success: true,
      message: 'Medical record removed.',
      record: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord
};

