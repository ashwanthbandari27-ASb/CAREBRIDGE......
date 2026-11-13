const { getModel } = require('../config/db');

const getAllEmergencyCases = async (req, res) => {
  try {
    const { priority, status, search } = req.query;
    const emgCol = getModel('emergencyCases');
    let cases = await emgCol.find();

    if (priority && priority !== 'All') {
      cases = cases.filter(c => c.priority && c.priority.toLowerCase() === priority.toLowerCase());
    }

    if (status && status !== 'All') {
      cases = cases.filter(c => c.status && c.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      cases = cases.filter(c =>
        (c.patientName && c.patientName.toLowerCase().includes(q)) ||
        (c.caseId && c.caseId.toLowerCase().includes(q)) ||
        (c.chiefComplaint && c.chiefComplaint.toLowerCase().includes(q)) ||
        (c.department && c.department.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: cases.length,
      cases
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmergencyCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const emgCol = getModel('emergencyCases');
    const emgCase = await emgCol.findById(id);

    if (!emgCase) {
      return res.status(404).json({ success: false, message: 'Emergency case not found.' });
    }

    res.json({
      success: true,
      case: emgCase
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createEmergencyCase = async (req, res) => {
  try {
    const {
      patientName,
      age,
      gender,
      priority,
      chiefComplaint,
      assignedDoctorId,
      department,
      contactNumber,
      vitals,
      bedNumber,
      notes
    } = req.body;

    if (!patientName || !priority || !chiefComplaint || !department) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, priority level, chief complaint, and department are required.'
      });
    }

    const emgCol = getModel('emergencyCases');
    const all = await emgCol.find();

    let maxIdNum = 4000;
    all.forEach(c => {
      if (c.caseId && c.caseId.startsWith('EMG-')) {
        const num = parseInt(c.caseId.replace('EMG-', ''), 10);
        if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
      }
    });
    const caseId = `EMG-${maxIdNum + 1}`;

    let doctorName = 'On-call ER Attending';
    if (assignedDoctorId) {
      const doctorsCol = getModel('doctors');
      const doctor = await doctorsCol.findById(assignedDoctorId);
      if (doctor) doctorName = doctor.name;
    }

    const newCase = await emgCol.create({
      caseId,
      patientName,
      age: Number(age) || 30,
      gender: gender || 'Unspecified',
      priority,
      chiefComplaint,
      assignedDoctorId: assignedDoctorId || '',
      assignedDoctorName: doctorName,
      department,
      status: 'Admitted',
      contactNumber: contactNumber || '+1 (555) 000-0000',
      vitals: vitals || { bp: '120/80 mmHg', heartRate: '75 bpm', spO2: '98%', temp: '98.6 F' },
      bedNumber: bedNumber || `ER-Bay-${Math.floor(1 + Math.random() * 20)}`,
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: notes || 'Administrative emergency tracking entry. Triage initiated.'
    });

    // Alert hospital via notification
    const notificationsCol = getModel('notifications');
    await notificationsCol.create({
      userId: 'all',
      title: `Emergency: ${priority} Alert`,
      message: `${patientName} admitted to ${department} (${priority} priority). Chief complaint: ${chiefComplaint}`,
      type: priority === 'Critical' ? 'urgent' : 'warning',
      read: false
    });

    res.status(201).json({
      success: true,
      message: `Emergency triage case ${caseId} logged.`,
      case: newCase
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmergencyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedDoctorId, notes, bedNumber } = req.body;

    const emgCol = getModel('emergencyCases');
    let updateFields = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(notes && { notes }),
      ...(bedNumber && { bedNumber })
    };

    if (assignedDoctorId) {
      const doctorsCol = getModel('doctors');
      const doc = await doctorsCol.findById(assignedDoctorId);
      if (doc) {
        updateFields.assignedDoctorId = doc._id;
        updateFields.assignedDoctorName = doc.name;
      }
    }

    const updated = await emgCol.findByIdAndUpdate(id, updateFields);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Emergency case not found.' });
    }

    res.json({
      success: true,
      message: `Emergency case status updated to ${status || updated.status}.`,
      case: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEmergencyCase = async (req, res) => {
  try {
    const { id } = req.params;
    const emgCol = getModel('emergencyCases');

    const deleted = await emgCol.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Emergency case not found.' });
    }

    res.json({
      success: true,
      message: `Emergency case ${deleted.caseId} archived.`,
      case: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllEmergencyCases,
  getEmergencyCaseById,
  createEmergencyCase,
  updateEmergencyStatus,
  deleteEmergencyCase
};

