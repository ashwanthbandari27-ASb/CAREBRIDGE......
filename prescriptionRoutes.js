const express = require('express');
const router = express.Router();
const {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription
} = require('../controllers/prescriptionController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllPrescriptions);
router.get('/:id', verifyToken, getPrescriptionById);
router.post('/', verifyToken, checkRole('admin', 'doctor'), createPrescription);
router.put('/:id', verifyToken, checkRole('admin', 'doctor'), updatePrescription);
router.delete('/:id', verifyToken, checkRole('admin', 'doctor'), deletePrescription);

module.exports = router;

