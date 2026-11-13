const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '..', 'data', 'carebridge_db.json');

class Collection {
  constructor(name, getDb, saveDb) {
    this.name = name;
    this.getDb = getDb;
    this.saveDb = saveDb;
  }

  _getItems() {
    const db = this.getDb();
    if (!db[this.name]) {
      db[this.name] = [];
    }
    return db[this.name];
  }

  async find(filter = {}) {
    const items = this._getItems();
    return items.filter(item => {
      for (const key in filter) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    }).map(item => ({ ...item }));
  }

  async findOne(filter = {}) {
    const items = await this.find(filter);
    return items.length > 0 ? items[0] : null;
  }

  async findById(id) {
    const items = this._getItems();
    const item = items.find(i => i._id === id || i.id === id);
    return item ? { ...item } : null;
  }

  async create(data) {
    const items = this._getItems();
    const newItem = {
      _id: data._id || 'id_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.unshift(newItem);
    this.saveDb();
    return { ...newItem };
  }

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    const items = this._getItems();
    const index = items.findIndex(i => i._id === id || i.id === id);
    if (index === -1) return null;

    const updated = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    items[index] = updated;
    this.saveDb();
    return { ...updated };
  }

  async findByIdAndDelete(id) {
    const items = this._getItems();
    const index = items.findIndex(i => i._id === id || i.id === id);
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    this.saveDb();
    return deleted;
  }

  async countDocuments(filter = {}) {
    const matched = await this.find(filter);
    return matched.length;
  }
}

class JsonDatabase {
  constructor() {
    this.db = {};
    this.collections = {};
    this.init();
  }

  init() {
    try {
      const dataDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.db = JSON.parse(raw);
      } else {
        this.db = {};
        this.save();
      }
    } catch (err) {
      console.error('Error initializing JSON database:', err.message);
      this.db = {};
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving JSON database:', err.message);
    }
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new Collection(
        name,
        () => this.db,
        () => this.save()
      );
    }
    return this.collections[name];
  }
}

const jsonDbInstance = new JsonDatabase();

module.exports = {
  db: jsonDbInstance,
  getCollection: (name) => jsonDbInstance.collection(name)
};

