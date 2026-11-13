import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  User,
  UserCheck,
  Filter,
  X,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const TIME_SLOTS = [
  '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM',
  '10:30 AM', '11:00 AM', '11:30 AM', '01:00 PM',
  '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM',
  '03:30 PM', '04:00 PM', '04:30 PM'
];

export const Appointments = () => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Booking Form
  const [bookingData, setBookingData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:30 AM',
    type: 'Consultation',
    reason: '',
    notes: ''
  });

  // Reschedule Form
  const [newDate, setNewDate] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('10:00 AM');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.getAppointments({
        status: statusFilter,
        date: dateFilter,
        search
      });
      if (res.success) {
        setAppointments(res.appointments);
      }
    } catch {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorsAndPatients = async () => {
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
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchDoctorsAndPatients();
  }, []);

  const handleOpenBook = () => {
    setBookingData({
      patientId: patientsList[0]?._id || '',
      doctorId: doctorsList[0]?._id || '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '09:30 AM',
      type: 'Consultation',
      reason: '',
      notes: ''
    });
    setBookModalOpen(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingData.patientId || !bookingData.doctorId || !bookingData.date || !bookingData.timeSlot) {
      toast.error('Please fill in patient, doctor, date, and time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createAppointment(bookingData);
      if (res.success) {
        toast.success(res.message);
        setBookModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReschedule = (apt) => {
    setSelectedAppointment(apt);
    setNewDate(apt.date);
    setNewTimeSlot(apt.timeSlot);
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.rescheduleAppointment(selectedAppointment._id, {
        date: newDate,
        timeSlot: newTimeSlot
      });
      if (res.success) {
        toast.success(res.message);
        setRescheduleModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reschedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.updateAppointmentStatus(id, { status });
      if (res.success) {
        toast.success(`Appointment status updated to ${status}!`);
        fetchAppointments();
      }
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      const res = await api.deleteAppointment(id);
      if (res.success) {
        toast.success(res.message);
        fetchAppointments();
      }
    } catch {
      toast.error('Failed to cancel appointment.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Appointment Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Book consultations, manage doctor schedules, and track patient appointment lifecycle.
          </p>
        </div>

        <button
          onClick={handleOpenBook}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchAppointments();
          }}
          className="relative w-full md:max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient, doctor, or appointment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-sky-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-rose-500 hover:underline shrink-0"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No appointments found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Appointment ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor & Department</th>
                  <th className="py-3 px-4">Date & Time Slot</th>
                  <th className="py-3 px-4">Type / Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(apt => (
                  <tr key={apt._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-600">
                      {apt.appointmentId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                          {apt.patientName ? apt.patientName.charAt(0) : 'P'}
                        </div>
                        <span className="font-bold text-slate-900">{apt.patientName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{apt.doctorName}</p>
                      <span className="text-[10px] text-slate-400">{apt.department}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-slate-800 font-medium">{apt.date}</p>
                      <p className="text-[11px] text-sky-600 font-semibold">{apt.timeSlot}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {apt.type || 'Consultation'}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">{apt.reason || 'Routine'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                        apt.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-sky-100 text-sky-700'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(apt._id, 'Completed')}
                              title="Mark Completed"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenReschedule(apt)}
                              title="Reschedule"
                              className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(apt._id, 'Cancelled')}
                              title="Cancel Appointment"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {['admin', 'receptionist'].includes(role) && (
                          <button
                            onClick={() => handleDeleteAppointment(apt._id)}
                            title="Delete"
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

      {/* BOOK APPOINTMENT MODAL */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Book Patient Appointment</h3>
              <button onClick={() => setBookModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={bookingData.patientId}
                  onChange={(e) => setBookingData({ ...bookingData, patientId: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Choose Patient --</option>
                  {patientsList.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.patientId}) - Blood: {p.bloodGroup}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Doctor *</label>
                <select
                  required
                  value={bookingData.doctorId}
                  onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctorsList.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.specialization} - {d.department}) - ${d.consultationFee}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot *</label>
                  <select
                    value={bookingData.timeSlot}
                    onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-white"
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Type</label>
                <select
                  value={bookingData.type}
                  onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="Consultation">General Consultation</option>
                  <option value="Follow-up">Follow-up Review</option>
                  <option value="Checkup">Routine Health Checkup</option>
                  <option value="Vaccination">Vaccination / Immunization</option>
                  <option value="Emergency">Emergency Evaluation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Chest pain review, migraine assessment..."
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Reschedule Appointment</h3>
              <button onClick={() => setRescheduleModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="mt-4 space-y-3">
              <div className="p-3 bg-sky-50 rounded-xl text-xs">
                <p className="font-bold text-sky-900">{selectedAppointment.patientName}</p>
                <p className="text-sky-700 mt-0.5">With {selectedAppointment.doctorName}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Date *</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Time Slot *</label>
                <select
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-white"
                >
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

