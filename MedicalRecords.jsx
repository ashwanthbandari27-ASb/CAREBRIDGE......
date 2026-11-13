import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  User,
  UserCheck,
  Paperclip,
  CheckCircle2,
  X,
  Eye,
  Shield,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const MedicalRecords = () => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [records, setRecords] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    doctorNotes: '',
    followUpDate: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.getMedicalRecords({ search });
      if (res.success) {
        setRecords(res.records);
      }
    } catch {
      toast.error('Failed to load medical records.');
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
    fetchRecords();
    fetchDependencies();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      patientId: patientsList[0]?._id || '',
      doctorId: doctorsList[0]?._id || '',
      diagnosis: '',
      symptoms: '',
      treatment: '',
      doctorNotes: '',
      followUpDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
    });
    setAddModalOpen(true);
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.diagnosis) {
      toast.error('Please select patient, doctor, and enter primary diagnosis.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createMedicalRecord(formData);
      if (res.success) {
        toast.success(res.message);
        setAddModalOpen(false);
        fetchRecords();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to file medical record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async () => {
    setSubmitting(true);
    try {
      const res = await api.deleteMedicalRecord(selectedRecord._id);
      if (res.success) {
        toast.success(res.message);
        setDeleteModalOpen(false);
        fetchRecords();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete record.');
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
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Medical Records (EMR)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            HIPAA-compliant Electronic Medical Records, clinical diagnoses, and consultation histories.
          </p>
        </div>

        {['admin', 'doctor'].includes(role) && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Medical Record</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchRecords();
          }}
          className="relative w-full md:max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search diagnosis, patient name, or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Role-Based Encrypted Clinical Storage</span>
        </div>
      </div>

      {/* Records Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border">Loading medical records...</div>
      ) : records.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border">No clinical records found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {records.map(record => (
            <div
              key={record._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{record.patientName}</span>
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                        {record.recordId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Consultant: <span className="text-slate-800 font-semibold">{record.doctorName}</span></p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                    {record.date}
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Primary Diagnosis</span>
                    <p className="font-bold text-slate-800 bg-indigo-50/40 p-2 rounded-xl border border-indigo-100/60">
                      {record.diagnosis}
                    </p>
                  </div>

                  {record.symptoms && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Symptoms: </span>
                      <span className="text-slate-700">{record.symptoms}</span>
                    </div>
                  )}

                  {record.treatment && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Treatment Plan: </span>
                      <span className="text-slate-700">{record.treatment}</span>
                    </div>
                  )}

                  {record.followUpDate && (
                    <div className="flex items-center gap-1.5 text-brand-600 font-medium pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Next Follow-up: {record.followUpDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Clinical E-Chart Signed</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRecord(record);
                      setViewModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Record</span>
                  </button>
                  {role === 'admin' && (
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
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

      {/* CREATE MEDICAL RECORD MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">New Clinical Medical Record</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="">-- Patient --</option>
                    {patientsList.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Physician *</label>
                  <select
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="">-- Doctor --</option>
                    {doctorsList.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Bronchitis / Stage 1 Hypertension"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Symptoms & Presentation</label>
                <textarea
                  rows="2"
                  placeholder="Patient presented with cough, dyspnea, and evening chills..."
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Protocol & Regimen</label>
                <textarea
                  rows="2"
                  placeholder="Inhalation therapy, antibiotic course, rest for 5 days..."
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recommended Follow-up</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confidential Clinical Notes</label>
                  <input
                    type="text"
                    placeholder="Physician notes for next review"
                    value={formData.doctorNotes}
                    onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Filing Record...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Clinical Consultation Record</h3>
                <span className="text-xs font-mono text-indigo-600">{selectedRecord.recordId}</span>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{selectedRecord.patientName}</p>
                  <p className="text-slate-500 text-[11px]">Doctor: {selectedRecord.doctorName}</p>
                </div>
                <span className="font-mono text-slate-500">{selectedRecord.date}</span>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Diagnosis</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedRecord.diagnosis}</p>
              </div>

              {selectedRecord.symptoms && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Symptoms Reported</p>
                  <p className="text-slate-700 mt-0.5">{selectedRecord.symptoms}</p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Treatment Protocol</p>
                  <p className="text-slate-700 mt-0.5">{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.doctorNotes && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Physician Notes</p>
                  <p className="text-slate-700 mt-0.5 italic">{selectedRecord.doctorNotes}</p>
                </div>
              )}

              {selectedRecord.documents && selectedRecord.documents.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Attached Documents</p>
                  <div className="space-y-1">
                    {selectedRecord.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-indigo-50/60 rounded-lg text-indigo-700">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Medical Record</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete medical record <span className="font-bold text-slate-800">{selectedRecord.recordId}</span> for {selectedRecord.patientName}?
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
                onClick={handleDeleteRecord}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

