const { getModel } = require('../config/db');

const getAllLabTests = async (req, res) => {
  try {
    const { status, patientId, category, search } = req.query;
    const labCol = getModel('labTests');
    let tests = await labCol.find();

    if (req.user && req.user.role === 'patient') {
      const patientsCol = getModel('patients');
      const patient = await patientsCol.findOne({ email: req.user.email });
      if (patient) {
        tests = tests.filter(t => t.patientId === patient._id || t.patientId === patient.patientId);
      }
    }

    if (status && status !== 'All') {
      tests = tests.filter(t => t.status && t.status.toLowerCase() === status.toLowerCase());
    }

    if (patientId) {
      tests = tests.filter(t => t.patientId === patientId);
    }

    if (category && category !== 'All') {
      tests = tests.filter(t => t.category && t.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      tests = tests.filter(t =>
        (t.testName && t.testName.toLowerCase().includes(q)) ||
        (t.patientName && t.patientName.toLowerCase().includes(q)) ||
        (t.testId && t.testId.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: tests.length,
      tests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLabTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const labCol = getModel('labTests');
    const test = await labCol.findById(id);

    if (!test) {
      return res.status(404).json({ success: false, message: 'Lab test not found.' });
    }

    res.json({
      success: true,
      test
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createLabTest = async (req, res) => {
  try {
    const { patientId, doctorId, testName, category, cost, testDate, doctorNotes } = req.body;

    if (!patientId || !doctorId || !testName || !category) {
      return res.status(400).json({
        success: false,
        message: 'Patient, Doctor, Test Name, and Category are required.'
      });
    }

    const patientsCol = getModel('patients');
    const doctorsCol = getModel('doctors');

    const patient = await patientsCol.findById(patientId);
    const doctor = await doctorsCol.findById(doctorId);

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const labCol = getModel('labTests');
    const all = await labCol.find();

    let maxIdNum = 8000;
    all.forEach(t => {
      if (t.testId && t.testId.startsWith('LAB-')) {
        const num = parseInt(t.testId.replace('LAB-', ''), 10);
        if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
      }
    });
    const testId = `LAB-${maxIdNum + 1}`;

    const newTest = await labCol.create({
      testId,
      patientId: patient._id,
      patientName: patient.name,
      doctorId: doctor._id,
      doctorName: doctor.name,
      testName,
      category,
      cost: Number(cost) || 50,
      testDate: testDate || new Date().toISOString().split('T')[0],
      status: 'Pending',
      resultSummary: 'Specimen sample scheduled for collection.',
      details: [],
      doctorNotes: doctorNotes || '',
      reportFile: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: `Laboratory test order ${testId} created successfully!`,
      test: newTest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLabTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resultSummary, details, doctorNotes } = req.body;

    const labCol = getModel('labTests');
    const updated = await labCol.findByIdAndUpdate(id, {
      ...(status && { status }),
      ...(resultSummary && { resultSummary }),
      ...(details && { details }),
      ...(doctorNotes && { doctorNotes }),
      ...(status === 'Completed' && { reportFile: `Report_${id.slice(0, 8)}.pdf` })
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Lab test not found.' });
    }

    if (status === 'Completed') {
      const notificationsCol = getModel('notifications');
      await notificationsCol.create({
        userId: 'all',
        title: 'Lab Report Verified',
        message: `${updated.testName} results for ${updated.patientName} have been verified.`,
        type: 'success',
        read: false
      });
    }

    res.json({
      success: true,
      message: `Lab test status updated to ${status}.`,
      test: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const labCol = getModel('labTests');

    const deleted = await labCol.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lab test not found.' });
    }

    res.json({
      success: true,
      message: `Lab test order ${deleted.testId} removed.`,
      test: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllLabTests,
  getLabTestById,
  createLabTest,
  updateLabTestStatus,
  deleteLabTest
};

