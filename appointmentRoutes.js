const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllAppointments);
router.get('/:id', verifyToken, getAppointmentById);
router.post('/', verifyToken, createAppointment); // Patients, doctors, receptionists, admin can book
router.put('/:id/status', verifyToken, checkRole('admin', 'doctor', 'receptionist'), updateAppointmentStatus);
router.put('/:id/reschedule', verifyToken, rescheduleAppointment);
router.delete('/:id', verifyToken, checkRole('admin', 'receptionist'), deleteAppointment);

module.exports = router;

