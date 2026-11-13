const { getModel } = require('../config/db');

const getAllMedicines = async (req, res) => {
  try {
    const { search, category, status, lowStockOnly } = req.query;
    const medicinesCol = getModel('medicines');
    let medicines = await medicinesCol.find();

    if (search) {
      const q = search.toLowerCase();
      medicines = medicines.filter(m =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.genericName && m.genericName.toLowerCase().includes(q)) ||
        (m.medicineId && m.medicineId.toLowerCase().includes(q)) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      medicines = medicines.filter(m => m.category && m.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== 'All') {
      medicines = medicines.filter(m => m.status && m.status.toLowerCase() === status.toLowerCase());
    }

    if (lowStockOnly === 'true') {
      medicines = medicines.filter(m => m.stockQuantity <= (m.minThresholdQuantity || 20));
    }

    res.json({
      success: true,
      count: medicines.length,
      medicines
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicinesCol = getModel('medicines');
    const medicine = await medicinesCol.findById(id);

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    res.json({
      success: true,
      medicine
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      dosageForm,
      strength,
      stockQuantity,
      minThresholdQuantity,
      unitPrice,
      manufacturer,
      batchNumber,
      expiryDate,
      location
    } = req.body;

    if (!name || !category || !dosageForm || !unitPrice || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, dosage form, unit price, and expiry date are required.'
      });
    }

    const medicinesCol = getModel('medicines');
    const all = await medicinesCol.find();

    let maxIdNum = 100;
    all.forEach(m => {
      if (m.medicineId && m.medicineId.startsWith('MED-')) {
        const num = parseInt(m.medicineId.replace('MED-', ''), 10);
        if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
      }
    });
    const medicineId = `MED-${maxIdNum + 1}`;

    const stock = Number(stockQuantity) || 0;
    const threshold = Number(minThresholdQuantity) || 20;
    let status = 'In Stock';
    if (stock === 0) status = 'Out of Stock';
    else if (stock <= threshold) status = 'Low Stock';

    const newMed = await medicinesCol.create({
      medicineId,
      name,
      genericName: genericName || name,
      category,
      dosageForm,
      strength: strength || '',
      stockQuantity: stock,
      minThresholdQuantity: threshold,
      unitPrice: Number(unitPrice),
      manufacturer: manufacturer || 'Generic Healthcare Inc.',
      batchNumber: batchNumber || `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate,
      status,
      location: location || 'Rack A-01'
    });

    res.status(201).json({
      success: true,
      message: `Medicine ${newMed.name} registered into inventory!`,
      medicine: newMed
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChange, newQuantity } = req.body;

    const medicinesCol = getModel('medicines');
    const med = await medicinesCol.findById(id);

    if (!med) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    let updatedQuantity = med.stockQuantity;
    if (newQuantity !== undefined) {
      updatedQuantity = Math.max(0, Number(newQuantity));
    } else if (quantityChange !== undefined) {
      updatedQuantity = Math.max(0, med.stockQuantity + Number(quantityChange));
    }

    const threshold = med.minThresholdQuantity || 20;
    let status = 'In Stock';
    if (updatedQuantity === 0) status = 'Out of Stock';
    else if (updatedQuantity <= threshold) status = 'Low Stock';

    const updated = await medicinesCol.findByIdAndUpdate(id, {
      stockQuantity: updatedQuantity,
      status
    });

    // If low stock, trigger system notification
    if (status === 'Low Stock' || status === 'Out of Stock') {
      const notificationsCol = getModel('notifications');
      await notificationsCol.create({
        userId: 'all',
        title: 'Inventory Alert',
        message: `${med.name} stock has reached critical level (${updatedQuantity} units left).`,
        type: 'warning',
        read: false
      });
    }

    res.json({
      success: true,
      message: `Stock updated for ${med.name}. Current count: ${updatedQuantity}`,
      medicine: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicinesCol = getModel('medicines');

    let updateData = { ...req.body };
    if (updateData.stockQuantity !== undefined) {
      const stock = Number(updateData.stockQuantity);
      const threshold = Number(updateData.minThresholdQuantity || 20);
      if (stock === 0) updateData.status = 'Out of Stock';
      else if (stock <= threshold) updateData.status = 'Low Stock';
      else updateData.status = 'In Stock';
    }

    const updated = await medicinesCol.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    res.json({
      success: true,
      message: 'Medicine details updated successfully.',
      medicine: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicinesCol = getModel('medicines');

    const deleted = await medicinesCol.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    res.json({
      success: true,
      message: `Medicine ${deleted.name} removed from inventory.`,
      medicine: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateStock,
  updateMedicine,
  deleteMedicine
};

