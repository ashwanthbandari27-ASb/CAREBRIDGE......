const express = require('express');
const router = express.Router();
const {
  getAllEmergencyCases,
  getEmergencyCaseById,
  createEmergencyCase,
  updateEmergencyStatus,
  deleteEmergencyCase
} = require('../controllers/emergencyController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllEmergencyCases);
router.get('/:id', verifyToken, getEmergencyCaseById);
router.post('/', verifyToken, checkRole('admin', 'doctor', 'receptionist'), createEmergencyCase);
router.put('/:id', verifyToken, checkRole('admin', 'doctor', 'receptionist'), updateEmergencyStatus);
router.delete('/:id', verifyToken, checkRole('admin'), deleteEmergencyCase);

module.exports = router;

