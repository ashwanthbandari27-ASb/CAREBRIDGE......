const express = require('express');
const router = express.Router();
const {
  getAllLabTests,
  getLabTestById,
  createLabTest,
  updateLabTestStatus,
  deleteLabTest
} = require('../controllers/labController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllLabTests);
router.get('/:id', verifyToken, getLabTestById);
router.post('/', verifyToken, checkRole('admin', 'doctor', 'receptionist'), createLabTest);
router.put('/:id', verifyToken, checkRole('admin', 'doctor', 'receptionist'), updateLabTestStatus);
router.delete('/:id', verifyToken, checkRole('admin'), deleteLabTest);

module.exports = router;

