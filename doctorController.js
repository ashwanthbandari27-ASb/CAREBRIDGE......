const { getModel } = require('../config/db');

const getAllDoctors = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    const doctorsCol = getModel('doctors');
    let doctors = await doctorsCol.find();

    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter(d =>
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.specialization && d.specialization.toLowerCase().includes(q)) ||
        (d.department && d.department.toLowerCase().includes(q)) ||
        (d.doctorId && d.doctorId.toLowerCase().includes(q))
      );
    }

    if (department && department !== 'All') {
      doctors = doctors.filter(d => d.department && d.department.toLowerCase() === department.toLowerCase());
    }

    if (status && status !== 'All') {
      doctors = doctors.filter(d => d.status && d.status.toLowerCase() === status.toLowerCase());
    }

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorsCol = getModel('doctors');
    const doctor = await doctorsCol.findById(id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Associated appointments
    const appointmentsCol = getModel('appointments');
    const appointments = await appointmentsCol.find({ doctorId: doctor._id });

    res.json({
      success: true,
      doctor: {
        ...doctor,
        appointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      department,
      experience,
      consultationFee,
      roomNumber,
      availableDays,
      availableHours,
      status,
      bio
    } = req.body;

    if (!name || !email || !specialization || !department || !consultationFee) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, specialization, department, and consultation fee are required.'
      });
    }

    const doctorsCol = getModel('doctors');
    const all = await doctorsCol.find();

    let maxIdNum = 200;
    all.forEach(d => {
      if (d.doctorId && d.doctorId.startsWith('DOC-')) {
        const num = parseInt(d.doctorId.replace('DOC-', ''), 10);
        if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
      }
    });
    const doctorId = `DOC-${maxIdNum + 1}`;

    const newDoctor = await doctorsCol.create({
      doctorId,
      name,
      email,
      phone: phone || '',
      specialization,
      department,
      experience: Number(experience) || 1,
      consultationFee: Number(consultationFee),
      roomNumber: roomNumber || 'Room 101',
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableHours: availableHours || '09:00 AM - 05:00 PM',
      status: status || 'Available',
      rating: 5.0,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7`,
      bio: bio || `${specialization} specialist at CareBridge Hospital.`
    });

    res.status(201).json({
      success: true,
      message: `Doctor ${newDoctor.name} added successfully!`,
      doctor: newDoctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorsCol = getModel('doctors');

    const updated = await doctorsCol.findByIdAndUpdate(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.json({
      success: true,
      message: 'Doctor profile updated successfully.',
      doctor: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorsCol = getModel('doctors');

    const deleted = await doctorsCol.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.json({
      success: true,
      message: `Doctor ${deleted.name} removed successfully.`,
      doctor: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};

