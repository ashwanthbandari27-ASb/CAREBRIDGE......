const express = require('express');
const router = express.Router();
const {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateStock,
  updateMedicine,
  deleteMedicine
} = require('../controllers/pharmacyController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllMedicines);
router.get('/:id', verifyToken, getMedicineById);
router.post('/', verifyToken, checkRole('admin', 'receptionist'), createMedicine);
router.put('/:id/stock', verifyToken, checkRole('admin', 'receptionist'), updateStock);
router.put('/:id', verifyToken, checkRole('admin', 'receptionist'), updateMedicine);
router.delete('/:id', verifyToken, checkRole('admin'), deleteMedicine);

module.exports = router;

