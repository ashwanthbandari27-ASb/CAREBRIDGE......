import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Search,
  Plus,
  Trash2,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Phone,
  Bed,
  UserCheck,
  ShieldAlert,
  Clock,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Emergency = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [cases, setCases] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedCase, setSelectedCase] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    age: 45,
    gender: 'Male',
    priority: 'Critical',
    chiefComplaint: '',
    assignedDoctorId: '',
    department: 'Cardiology ER',
    contactNumber: '+1 (555) 019-0000',
    bedNumber: 'ER-ICU-05',
    bp: '110/70 mmHg',
    heartRate: '95 bpm',
    spO2: '96%',
    temp: '98.6 F',
    notes: 'Triage priority assessment.'
  });

  const [nextStatus, setNextStatus] = useState('Under Observation');

  const fetchEmergencyCases = async () => {
    setLoading(true);
    try {
      const res = await api.getEmergencyCases({
        priority: priorityFilter,
        status: statusFilter,
        search
      });
      if (res.success) {
        setCases(res.cases);
      }
    } catch {
      toast.error('Failed to load emergency triage records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.getDoctors();
      if (res.success) setDoctorsList(res.doctors);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchEmergencyCases();
  }, [priorityFilter, statusFilter]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenRegister = () => {
    setFormData({
      patientName: '',
      age: 40,
      gender: 'Male',
      priority: 'Critical',
      chiefComplaint: '',
      assignedDoctorId: doctorsList[0]?._id || '',
      department: 'Trauma ICU',
      contactNumber: '+1 (555) 234-5678',
      bedNumber: `ER-Bay-${Math.floor(1 + Math.random() * 20)}`,
      bp: '120/80 mmHg',
      heartRate: '88 bpm',
      spO2: '97%',
      temp: '98.6 F',
      notes: 'Initial administrative triage entry.'
    });
    setRegisterModalOpen(true);
  };

  const handleRegisterCase = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.chiefComplaint) {
      toast.error('Patient name and chief complaint are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientName: formData.patientName,
        age: Number(formData.age),
        gender: formData.gender,
        priority: formData.priority,
        chiefComplaint: formData.chiefComplaint,
        assignedDoctorId: formData.assignedDoctorId,
        department: formData.department,
        contactNumber: formData.contactNumber,
        bedNumber: formData.bedNumber,
        vitals: {
          bp: formData.bp,
          heartRate: formData.heartRate,
          spO2: formData.spO2,
          temp: formData.temp
        },
        notes: formData.notes
      };

      const res = await api.createEmergencyCase(payload);
      if (res.success) {
        toast.success(res.message);
        setRegisterModalOpen(false);
        fetchEmergencyCases();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to log emergency case.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenUpdateStatus = (emg) => {
    setSelectedCase(emg);
    setNextStatus(emg.status);
    setUpdateStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.updateEmergencyStatus(selectedCase._id, {
        status: nextStatus
      });
      if (res.success) {
        toast.success(res.message);
        setUpdateStatusModalOpen(false);
        fetchEmergencyCases();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update case status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCase = async () => {
    setSubmitting(true);
    try {
      const res = await api.deleteEmergencyCase(selectedCase._id);
      if (res.success) {
        toast.success(res.message);
        setDeleteModalOpen(false);
        fetchEmergencyCases();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to archive case.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Notice Banner: Administrative tracking only */}
      <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white uppercase tracking-wider block">Hospital Administrative ER Triage Dashboard</span>
            <p className="text-slate-400">
              This module is strictly for hospital administrative bed coordination, triage queueing, and attending doctor allocation.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-mono font-bold bg-white/10 text-teal-300 rounded-lg">
          Live ER Tracking
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Emergency & Trauma Services</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time emergency patient intake, priority stratification, and vital sign telemetry.
          </p>
        </div>

        {['admin', 'doctor', 'receptionist'].includes(role) && (
          <button
            onClick={handleOpenRegister}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Admit Emergency Patient</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchEmergencyCases();
          }}
          className="relative w-full md:max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, ER case ID, complaint, or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold shrink-0">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-rose-500"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <span className="text-xs text-slate-400 font-semibold shrink-0 ml-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-rose-500"
          >
            <option value="All">All Statuses</option>
            <option value="Admitted">Admitted</option>
            <option value="Under Observation">Under Observation</option>
            <option value="Transferred to ICU">Transferred to ICU</option>
            <option value="Discharged">Discharged</option>
          </select>
        </div>
      </div>

      {/* Emergency Cases Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border">Loading emergency cases...</div>
      ) : cases.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border">No emergency cases in queue.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cases.map(emg => (
            <div
              key={emg._id}
              className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow ${
                emg.priority === 'Critical' ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{emg.patientName}</h3>
                      <span className="text-xs text-slate-400">({emg.age} yrs • {emg.gender})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {emg.caseId}
                      </span>
                      <span className="text-xs text-slate-500">Bed: <span className="font-bold text-slate-800">{emg.bedNumber}</span></span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                    emg.priority === 'Critical' ? 'bg-rose-600 text-white animate-emergency shadow-sm' :
                    emg.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                    emg.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {emg.priority}
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Chief Complaint</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{emg.chiefComplaint}</p>
                  </div>

                  {/* Vitals Telemetry Box */}
                  <div className="grid grid-cols-4 gap-2 pt-1 pb-1">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">BP</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{emg.vitals?.bp || '120/80'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Heart Rate</span>
                      <span className="font-mono font-bold text-rose-600 text-[11px]">{emg.vitals?.heartRate || '75 bpm'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">SpO2</span>
                      <span className="font-mono font-bold text-teal-600 text-[11px]">{emg.vitals?.spO2 || '98%'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">Temp</span>
                      <span className="font-mono font-bold text-amber-600 text-[11px]">{emg.vitals?.temp || '98.6 F'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 pt-1">
                    <span>Department: <strong className="text-slate-800">{emg.department}</strong></span>
                    <span>Doctor: <strong className="text-slate-800">{emg.assignedDoctorName}</strong></span>
                  </div>

                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                    {emg.notes}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Status: <strong className="text-brand-600">{emg.status}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {['admin', 'doctor', 'receptionist'].includes(role) && (
                    <button
                      onClick={() => handleOpenUpdateStatus(emg)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      Update Status
                    </button>
                  )}
                  {role === 'admin' && (
                    <button
                      onClick={() => {
                        setSelectedCase(emg);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMIT EMERGENCY PATIENT MODAL */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Admit Emergency Patient</h3>
              <button onClick={() => setRegisterModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterCase} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Patient full name"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white font-bold text-rose-600"
                  >
                    <option value="Critical">Critical (Immediate Life-Threat)</option>
                    <option value="High">High (Severe condition)</option>
                    <option value="Medium">Medium (Urgent care)</option>
                    <option value="Low">Low (Non-urgent triage)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Ward *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                  >
                    <option value="Trauma ICU">Trauma ICU</option>
                    <option value="Cardiology ER">Cardiology ER</option>
                    <option value="Pediatric ER">Pediatric ER</option>
                    <option value="General ER">General ER</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Bed</label>
                  <input
                    type="text"
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute myocardial infarction symptoms, crushing retrosternal pain..."
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned On-Call Attending</label>
                <select
                  value={formData.assignedDoctorId}
                  onChange={(e) => setFormData({ ...formData, assignedDoctorId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 bg-white"
                >
                  <option value="">-- Choose Attending Doctor --</option>
                  {doctorsList.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              {/* Vitals inputs */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Vitals Telemetry</label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="BP (120/80)"
                    value={formData.bp}
                    onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-center"
                  />
                  <input
                    type="text"
                    placeholder="HR (80 bpm)"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-center"
                  />
                  <input
                    type="text"
                    placeholder="SpO2 (98%)"
                    value={formData.spO2}
                    onChange={(e) => setFormData({ ...formData, spO2: e.target.value })}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-center"
                  />
                  <input
                    type="text"
                    placeholder="Temp (98.6 F)"
                    value={formData.temp}
                    onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Triage Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Admitting...' : 'Admit Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {updateStatusModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Update ER Case Status</h3>
              <button onClick={() => setUpdateStatusModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900">{selectedCase.patientName}</p>
                <p className="text-slate-500">{selectedCase.caseId} • Bed: {selectedCase.bedNumber}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Care Status</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  <option value="Admitted">Admitted (Acute care)</option>
                  <option value="Under Observation">Under Observation</option>
                  <option value="Transferred to ICU">Transferred to Intensive Care Unit</option>
                  <option value="Discharged">Discharged Home (Stabilized)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setUpdateStatusModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

