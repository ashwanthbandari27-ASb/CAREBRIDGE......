const express = require('express');
const router = express.Router();
const {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord
} = require('../controllers/recordController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllRecords);
router.get('/:id', verifyToken, getRecordById);
router.post('/', verifyToken, checkRole('admin', 'doctor'), createRecord);
router.put('/:id', verifyToken, checkRole('admin', 'doctor'), updateRecord);
router.delete('/:id', verifyToken, checkRole('admin'), deleteRecord);

module.exports = router;

