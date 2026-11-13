import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  AlertTriangle,
  X,
  CheckCircle2,
  FileText,
  Clock,
  Pill,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Patients = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [fullPatientDetails, setFullPatientDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: ''
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.getPatients({
        search,
        bloodGroup: bloodGroupFilter,
        gender: genderFilter
      });
      if (res.success) {
        setPatients(res.patients);
      }
    } catch (err) {
      toast.error('Failed to load patients list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [bloodGroupFilter, genderFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '',
      email: '',
      address: '',
      medicalHistory: '',
      allergies: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactPhone: ''
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || 'Male',
      bloodGroup: patient.bloodGroup || 'O+',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      medicalHistory: patient.medicalHistory || '',
      allergies: patient.allergies || '',
      emergencyContactName: patient.emergencyContact?.name || '',
      emergencyContactRelation: patient.emergencyContact?.relation || '',
      emergencyContactPhone: patient.emergencyContact?.phone || ''
    });
    setEditModalOpen(true);
  };

  const handleOpenView = async (patient) => {
    setSelectedPatient(patient);
    setViewModalOpen(true);
    setFullPatientDetails(null);
    try {
      const res = await api.getPatientById(patient._id);
      if (res.success) {
        setFullPatientDetails(res.patient);
      }
    } catch {
      toast.error('Failed to load comprehensive patient medical records.');
    }
  };

  const handleOpenDelete = (patient) => {
    setSelectedPatient(patient);
    setDeleteModalOpen(true);
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
        emergencyContact: {
          name: formData.emergencyContactName,
          relation: formData.emergencyContactRelation,
          phone: formData.emergencyContactPhone
        }
      };

      const res = await api.createPatient(payload);
      if (res.success) {
        toast.success(res.message);
        setAddModalOpen(false);
        fetchPatients();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to register patient.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
        emergencyContact: {
          name: formData.emergencyContactName,
          relation: formData.emergencyContactRelation,
          phone: formData.emergencyContactPhone
        }
      };

      const res = await api.updatePatient(selectedPatient._id, payload);
      if (res.success) {
        toast.success('Patient profile updated successfully!');
        setEditModalOpen(false);
        fetchPatients();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update patient.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async () => {
    setSubmitting(true);
    try {
      const res = await api.deletePatient(selectedPatient._id);
      if (res.success) {
        toast.success(res.message);
        setDeleteModalOpen(false);
        fetchPatients();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete patient.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Patient Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central repository of patient demographics, clinical records, and history.
          </p>
        </div>

        {['admin', 'doctor', 'receptionist'].includes(role) && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Patient</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, patient ID, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-semibold shrink-0">Blood:</span>
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="All">All Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <span className="text-xs text-slate-400 font-semibold shrink-0 ml-2">Gender:</span>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Patient Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No patients match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Patient ID & Name</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Phone / Email</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map(patient => (
                  <tr key={patient._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center shrink-0">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{patient.name}</p>
                          <span className="text-[10px] font-mono text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded font-semibold">
                            {patient.patientId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {patient.age} yrs • <span className="capitalize">{patient.gender}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200/50">
                        {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-800 font-medium">{patient.phone}</p>
                      <p className="text-[11px] text-slate-400">{patient.email || 'No email'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {patient.registrationDate || new Date(patient.createdAt).toISOString().split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenView(patient)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {['admin', 'doctor', 'receptionist'].includes(role) && (
                          <button
                            onClick={() => handleOpenEdit(patient)}
                            title="Edit Patient"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {role === 'admin' && (
                          <button
                            onClick={() => handleOpenDelete(patient)}
                            title="Delete Patient"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* ADD PATIENT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Register New Patient</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Johnathan Hayes"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="130"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 234-5678"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@email.com"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="742 Evergreen Terrace, City, State"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="Penicillin, Sulfa drugs, Peanuts (or None)"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical History Summary</label>
                <textarea
                  rows="2"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="e.g. Hypertension diagnosed 2021; Appendectomy 2015"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Emergency Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g. Spouse)"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                  <input
                    type="tel"
                    placeholder="Emergency Phone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PATIENT MODAL */}
      {editModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Patient Information</h3>
                <p className="text-xs font-mono text-brand-600">{selectedPatient.patientId}</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePatient} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="130"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Allergies</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical History</label>
                <textarea
                  rows="2"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PATIENT DETAILS MODAL */}
      {viewModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{selectedPatient.name}</h3>
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                      {selectedPatient.patientId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedPatient.age} yrs • {selectedPatient.gender} • Blood Group: <span className="font-bold text-rose-600">{selectedPatient.bloodGroup}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demographics details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-400 font-semibold mb-1">Contact Information</p>
                <p className="text-slate-800 font-medium">📞 {selectedPatient.phone}</p>
                <p className="text-slate-600 mt-0.5">✉️ {selectedPatient.email || 'None'}</p>
                <p className="text-slate-600 mt-0.5">📍 {selectedPatient.address || 'Not listed'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-400 font-semibold mb-1">Emergency Contact</p>
                <p className="text-slate-800 font-medium">
                  {selectedPatient.emergencyContact?.name || 'Not provided'}
                  {selectedPatient.emergencyContact?.relation && ` (${selectedPatient.emergencyContact.relation})`}
                </p>
                <p className="text-slate-600 mt-0.5">📞 {selectedPatient.emergencyContact?.phone || '-'}</p>
              </div>
            </div>

            {/* Clinical Overview */}
            <div className="mt-4 p-4 rounded-xl bg-brand-50/50 border border-brand-100 text-xs">
              <div className="flex items-center gap-2 text-brand-800 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-brand-600" />
                <span>Allergies & Medical History</span>
              </div>
              <p className="text-slate-700">
                <span className="font-semibold text-rose-600">Allergies: </span>
                {selectedPatient.allergies || 'None reported'}
              </p>
              <p className="text-slate-700 mt-1">
                <span className="font-semibold text-slate-900">Past History: </span>
                {selectedPatient.medicalHistory || 'No significant prior hospitalizations.'}
              </p>
            </div>

            {/* Linked Records Tabs Preview */}
            {fullPatientDetails && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 pt-2 border-t border-slate-100">
                  <span>Linked Consultations ({fullPatientDetails.appointments?.length || 0})</span>
                  <span>Active Prescriptions ({fullPatientDetails.prescriptions?.length || 0})</span>
                  <span>Lab Reports ({fullPatientDetails.labTests?.length || 0})</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
                  {fullPatientDetails.medicalRecords?.map(rec => (
                    <div key={rec._id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{rec.diagnosis}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{rec.treatment}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{rec.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-5 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Patient Record</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to permanently delete <span className="font-bold text-slate-800">{selectedPatient.name}</span> ({selectedPatient.patientId})? This will archive their patient file.
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
                onClick={handleDeletePatient}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Patient'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

