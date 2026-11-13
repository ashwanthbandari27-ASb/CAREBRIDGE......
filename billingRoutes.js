const express = require('express');
const router = express.Router();
const {
  getAllBills,
  getBillById,
  createBill,
  recordPayment,
  deleteBill
} = require('../controllers/billingController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllBills);
router.get('/:id', verifyToken, getBillById);
router.post('/', verifyToken, checkRole('admin', 'receptionist'), createBill);
router.post('/:id/payment', verifyToken, checkRole('admin', 'receptionist', 'patient'), recordPayment);
router.delete('/:id', verifyToken, checkRole('admin'), deleteBill);

module.exports = router;

