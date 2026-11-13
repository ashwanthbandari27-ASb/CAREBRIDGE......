const mongoose = require('mongoose');
const { db, getCollection } = require('./jsonDb');
const { getSeedData } = require('./seedData');

let isConnectedToMongo = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (mongoURI) {
    try {
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 3000
      });
      isConnectedToMongo = true;
      console.log('✅ Connected to MongoDB successfully.');
      return;
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed, using local persistent JSON database instead:', err.message);
      isConnectedToMongo = false;
    }
  } else {
    console.log('ℹ️ MONGODB_URI not configured. Using high-performance persistent local JSON database.');
  }

  // Check if JSON DB needs initial seed
  await seedInitialDataIfNeeded();
};

const seedInitialDataIfNeeded = async () => {
  const usersCol = getCollection('users');
  const count = await usersCol.countDocuments();
  if (count === 0) {
    console.log('🌱 Populating initial CareBridge seed records...');
    const seed = await getSeedData();
    for (const [colName, items] of Object.entries(seed)) {
      const col = getCollection(colName);
      for (const item of items) {
        await col.create(item);
      }
    }
    console.log('✨ Seed population complete! 11 hospital collections loaded.');
  } else {
    console.log(`📦 CareBridge database loaded with ${count} active users.`);
  }
};

const getModel = (name) => {
  return getCollection(name);
};

module.exports = {
  connectDB,
  getModel,
  isConnectedToMongo: () => isConnectedToMongo
};

