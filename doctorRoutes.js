const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllDoctors);
router.get('/:id', verifyToken, getDoctorById);
router.post('/', verifyToken, checkRole('admin'), createDoctor);
router.put('/:id', verifyToken, checkRole('admin', 'doctor'), updateDoctor);
router.delete('/:id', verifyToken, checkRole('admin'), deleteDoctor);

module.exports = router;

