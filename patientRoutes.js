const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllPatients);
router.get('/:id', verifyToken, getPatientById);
router.post('/', verifyToken, checkRole('admin', 'doctor', 'receptionist'), createPatient);
router.put('/:id', verifyToken, checkRole('admin', 'doctor', 'receptionist'), updatePatient);
router.delete('/:id', verifyToken, checkRole('admin'), deletePatient);

module.exports = router;

