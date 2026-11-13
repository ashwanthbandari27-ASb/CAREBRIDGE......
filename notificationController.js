const { getModel } = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const notifCol = getModel('notifications');
    const notifications = await notifCol.find();
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notifCol = getModel('notifications');
    const updated = await notifCol.findByIdAndUpdate(id, { read: true });
    res.json({
      success: true,
      notification: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const notifCol = getModel('notifications');
    const all = await notifCol.find();
    for (const n of all) {
      await notifCol.findByIdAndUpdate(n._id, { read: true });
    }
    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

