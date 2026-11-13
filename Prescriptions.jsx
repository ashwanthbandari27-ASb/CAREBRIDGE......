import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  Plus,
  Printer,
  Trash2,
  Calendar,
  User,
  Clock,
  X,
  PlusCircle,
  MinusCircle,
  FileText,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Prescriptions = () => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [prescriptions, setPrescriptions] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Medicine Form state
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    notes: 'Take medications with plenty of water after food. Complete prescribed duration.',
    medicines: [
      { medicineName: '', dosage: '', frequency: 'Once daily', duration: '7 Days', instructions: 'Take after meals' }
    ]
  });

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.getPrescriptions({ search });
      if (res.success) {
        setPrescriptions(res.prescriptions);
      }
    } catch {
      toast.error('Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [patRes, docRes] = await Promise.all([
        api.getPatients(),
        api.getDoctors()
      ]);
      if (patRes.success) setPatientsList(patRes.patients);
      if (docRes.success) setDoctorsList(docRes.doctors);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchDependencies();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      patientId: patientsList[0]?._id || '',
      doctorId: doctorsList[0]?._id || '',
      notes: 'Take medications with plenty of water after meals.',
      medicines: [
        { medicineName: 'Amoxicillin 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '7 Days', instructions: 'Take with food' }
      ]
    });
    setCreateModalOpen(true);
  };

  const handleAddMedicineRow = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { medicineName: '', dosage: '', frequency: 'Once daily', duration: '5 Days', instructions: 'Take after food' }
      ]
    }));
  };

  const handleRemoveMedicineRow = (index) => {
    if (formData.medicines.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...formData.medicines];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, medicines: updated }));
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId) {
      toast.error('Please select both a patient and a doctor.');
      return;
    }

    if (formData.medicines.some(m => !m.medicineName.trim())) {
      toast.error('Please specify medicine names for all line items.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createPrescription(formData);
      if (res.success) {
        toast.success(res.message);
        setCreateModalOpen(false);
        fetchPrescriptions();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to issue prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (rx) => {
    setSelectedPrescription(rx);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await api.deletePrescription(selectedPrescription._id);
      if (res.success) {
        toast.success(res.message);
        setDeleteModalOpen(false);
        fetchPrescriptions();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Pill className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Prescription Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate digital prescriptions, manage dosages, and print official hospital Rx pads.
          </p>
        </div>

        {['admin', 'doctor'].includes(role) && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Prescription</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchPrescriptions();
          }}
          className="relative w-full max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient, doctor, or medication..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
          >
            Search
          </button>
        </form>
      </div>

      {/* Prescriptions Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border">No prescriptions found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {prescriptions.map(rx => (
            <div
              key={rx._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                      ℞
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{rx.patientName}</h3>
                        <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                          {rx.prescriptionId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Doctor: {rx.doctorName}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                    {rx.date}
                  </span>
                </div>

                {/* Medicine Items Table */}
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-500 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Medication</th>
                        <th className="py-2 px-3">Dosage / Freq</th>
                        <th className="py-2 px-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rx.medicines?.map((m, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-bold text-slate-800">
                            {m.medicineName}
                            {m.instructions && <span className="block text-[10px] font-normal text-slate-400">{m.instructions}</span>}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {m.dosage} • {m.frequency}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-700">{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {rx.notes && (
                  <p className="mt-3 text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                    Note: {rx.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {rx.status || 'Active'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint(rx)}
                    className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Print Rx</span>
                  </button>
                  {['admin', 'doctor'].includes(role) && (
                    <button
                      onClick={() => {
                        setSelectedPrescription(rx);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PRESCRIPTION MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create Patient E-Prescription</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="">-- Patient --</option>
                    {patientsList.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prescribing Doctor *</label>
                  <select
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="">-- Doctor --</option>
                    {doctorsList.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Medicine Rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">Prescribed Medications</label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Another Medicine</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.medicines.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 relative space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-600 text-[11px]">Medication #{idx + 1}</span>
                        {formData.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Medicine name (e.g. Paracetamol 500mg)"
                          value={item.medicineName}
                          onChange={(e) => handleMedicineChange(idx, 'medicineName', e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 1 Tablet / 5ml)"
                          value={item.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={item.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                        >
                          <option value="Once daily (Morning)">Once daily (Morning)</option>
                          <option value="Once daily (Night)">Once daily (Night)</option>
                          <option value="Twice daily (Morning & Night)">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Every 4-6 hours as needed">As needed (PRN)</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Duration (e.g. 7 Days)"
                          value={item.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                        />

                        <input
                          type="text"
                          placeholder="Instructions (e.g. After food)"
                          value={item.instructions}
                          onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Advice / Patient Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Prescription</h3>
            <p className="text-xs text-slate-500 mt-1">
              Delete prescription {selectedPrescription.prescriptionId} for {selectedPrescription.patientName}?
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
                onClick={handleDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINTABLE PRESCRIPTION DOCUMENT FOR WINDOW.PRINT() */}
      {selectedPrescription && (
        <div id="printable-document" className="hidden">
          <div className="border-4 border-slate-900 p-8 max-w-3xl mx-auto font-serif">
            {/* Hospital Letterhead */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">CAREBRIDGE HOSPITAL</h1>
                <p className="text-xs text-slate-600">Smart Healthcare Medical Center & Super-Specialty Clinic</p>
                <p className="text-xs text-slate-500">700 Healthway Blvd, Medical District • Tel: +1 (555) 019-2831</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-serif font-black text-slate-900">℞</span>
                <p className="text-xs font-mono font-bold">{selectedPrescription.prescriptionId}</p>
              </div>
            </div>

            {/* Demographics Bar */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-400 text-sm">
              <div>
                <p><span className="font-bold">Patient Name:</span> {selectedPrescription.patientName}</p>
                <p><span className="font-bold">Prescribing Physician:</span> {selectedPrescription.doctorName}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold">Date:</span> {selectedPrescription.date}</p>
                <p><span className="font-bold">Rx Status:</span> {selectedPrescription.status || 'Active'}</p>
              </div>
            </div>

            {/* Medicines List */}
            <div className="py-6">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="py-2">#</th>
                    <th className="py-2">Medicine / Strength</th>
                    <th className="py-2">Dosage & Frequency</th>
                    <th className="py-2">Duration</th>
                    <th className="py-2">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPrescription.medicines?.map((med, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="py-3 font-bold">{idx + 1}.</td>
                      <td className="py-3 font-bold">{med.medicineName}</td>
                      <td className="py-3">{med.dosage} ({med.frequency})</td>
                      <td className="py-3 font-mono">{med.duration}</td>
                      <td className="py-3 italic text-slate-700">{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes & Doctor Signature */}
            <div className="mt-8 pt-4 border-t border-slate-300">
              <p className="text-xs font-bold text-slate-700">Clinical Directions:</p>
              <p className="text-xs text-slate-600 mt-1">{selectedPrescription.notes}</p>

              <div className="flex justify-between items-end mt-16">
                <p className="text-[10px] text-slate-400">Valid only with registered clinical stamp.</p>
                <div className="text-center">
                  <div className="w-48 border-b-2 border-slate-900 mb-1"></div>
                  <p className="text-xs font-bold text-slate-900">{selectedPrescription.doctorName}</p>
                  <p className="text-[10px] text-slate-500">Authorized Medical Practitioner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

