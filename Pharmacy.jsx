import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  PlusCircle,
  MinusCircle,
  X,
  Filter,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Pharmacy = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedMed, setSelectedMed] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState(10);
  const [stockAction, setStockAction] = useState('add'); // 'add' or 'deduct'
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics',
    dosageForm: 'Tablet',
    strength: '500 mg',
    stockQuantity: 100,
    minThresholdQuantity: 20,
    unitPrice: 12.00,
    manufacturer: 'Pfizer Inc.',
    batchNumber: 'BT-2026-99',
    expiryDate: '2027-12-31',
    location: 'Rack A-01'
  });

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await api.getMedicines({
        search,
        category: categoryFilter,
        status: statusFilter
      });
      if (res.success) {
        setMedicines(res.medicines);
      }
    } catch {
      toast.error('Failed to load pharmacy medicines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [categoryFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      genericName: '',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      strength: '500 mg',
      stockQuantity: 100,
      minThresholdQuantity: 25,
      unitPrice: 15.00,
      manufacturer: 'Healthcare Pharma Ltd.',
      batchNumber: `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: '2027-12-31',
      location: 'Rack B-02'
    });
    setAddModalOpen(true);
  };

  const handleOpenStock = (med) => {
    setSelectedMed(med);
    setStockAdjustment(10);
    setStockAction('add');
    setStockModalOpen(true);
  };

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createMedicine(formData);
      if (res.success) {
        toast.success(res.message);
        setAddModalOpen(false);
        fetchMedicines();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add medicine.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const change = stockAction === 'add' ? Number(stockAdjustment) : -Number(stockAdjustment);
      const res = await api.updateStock(selectedMed._id, { quantityChange: change });
      if (res.success) {
        toast.success(res.message);
        setStockModalOpen(false);
        fetchMedicines();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedicine = async () => {
    setSubmitting(true);
    try {
      const res = await api.deleteMedicine(selectedMed._id);
      if (res.success) {
        toast.success(res.message);
        setDeleteModalOpen(false);
        fetchMedicines();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete medicine.');
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockItems = medicines.filter(m => m.stockQuantity <= (m.minThresholdQuantity || 20));

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Pharmacy & Drug Inventory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time dispensary inventory, expiry tracking, batch controls, and automatic low-stock warnings.
          </p>
        </div>

        {['admin', 'receptionist'].includes(role) && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        )}
      </div>

      {/* Low Stock Banner Warning */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-amber-900">Low Stock Warning ({lowStockItems.length} items requiring replenishment)</p>
            <p className="text-amber-700 mt-0.5">
              The following pharmaceuticals have dipped below their safety threshold:{' '}
              <span className="font-semibold">{lowStockItems.map(m => `${m.name} (${m.stockQuantity} left)`).join(', ')}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchMedicines();
          }}
          className="relative w-full md:max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine name, generic, or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold shrink-0">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Categories</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Analgesics">Analgesics</option>
            <option value="Antidiabetic">Antidiabetic</option>
            <option value="Respiratory">Respiratory</option>
            <option value="Vitamins & Supplements">Vitamins</option>
          </select>

          <span className="text-xs text-slate-400 font-semibold shrink-0 ml-2">Stock:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Stock Levels</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading pharmacy stock...</div>
        ) : medicines.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No medicines found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Medicine & Form</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Batch / Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map(med => (
                  <tr key={med._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {med.genericName} • {med.dosageForm} ({med.strength})
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {med.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm font-mono text-slate-900">{med.stockQuantity}</span>
                        <span className="text-[10px] text-slate-400">units (min {med.minThresholdQuantity})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                      ${med.unitPrice?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-slate-800 text-[11px]">{med.batchNumber}</p>
                      <p className="text-[10px] text-slate-400">Exp: {med.expiryDate}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        med.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
                        med.status === 'Low Stock' ? 'bg-amber-100 text-amber-700 font-extrabold' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {med.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {['admin', 'receptionist'].includes(role) && (
                          <button
                            onClick={() => handleOpenStock(med)}
                            className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-[11px] font-bold transition-colors"
                          >
                            Adjust Stock
                          </button>
                        )}
                        {role === 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedMed(med);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADJUST STOCK MODAL */}
      {stockModalOpen && selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Adjust Inventory Stock</h3>
              <button onClick={() => setStockModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="mt-4 space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl text-xs">
                <p className="font-bold text-amber-900">{selectedMed.name}</p>
                <p className="text-amber-700 mt-0.5">Current Stock: <span className="font-bold font-mono">{selectedMed.stockQuantity} units</span></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockAction('add')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                      stockAction === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    + Add New Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAction('deduct')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                      stockAction === 'deduct'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    - Dispense / Deduct
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEDICINE MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Medicine to Pharmacy</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Augmentin 625mg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Generic Name</label>
                  <input
                    type="text"
                    placeholder="Amoxicillin / Clavulanate"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Vitamins & Supplements">Vitamins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage Form *</label>
                  <select
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Inhaler">Inhaler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Strength</label>
                  <input
                    type="text"
                    placeholder="500 mg"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Low-Stock Alert Min</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minThresholdQuantity}
                    onChange={(e) => setFormData({ ...formData, minThresholdQuantity: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Location</label>
                  <input
                    type="text"
                    placeholder="Rack A-01"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Remove Medicine</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove <span className="font-bold text-slate-800">{selectedMed.name}</span> from the pharmacy directory?
            </p>
            <div className="flex gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteMedicine}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {submitting ? 'Removing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

