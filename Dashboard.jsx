import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Bed,
  AlertOctagon,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Activity,
  Sparkles,
  FileText,
  Pill,
  ShieldAlert,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const Dashboard = ({ setActiveTab }) => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [emergencyCases, setEmergencyCases] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, aptsRes, emgRes] = await Promise.all([
        api.getDashboardStats(),
        api.getAppointments(),
        api.getEmergencyCases()
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        setCharts(statsRes.charts);
      }

      if (aptsRes.success) {
        setTodayAppointments(aptsRes.appointments.slice(0, 5));
      }

      if (emgRes.success) {
        setEmergencyCases(emgRes.cases.filter(c => c.status !== 'Discharged').slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      toast.error('Failed to refresh dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateAptStatus = async (id, newStatus) => {
    try {
      await api.updateAppointmentStatus(id, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}!`);
      fetchDashboardData();
    } catch {
      toast.error('Failed to update appointment status.');
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-slate-500">Loading CareBridge Intelligent Dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.totalPatients?.count || 6,
      change: stats?.totalPatients?.change || '+12.5%',
      isPositive: true,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      tab: 'patients'
    },
    {
      title: 'Total Doctors',
      value: stats?.totalDoctors?.count || 5,
      change: stats?.totalDoctors?.change || '+4.2%',
      isPositive: true,
      icon: UserCheck,
      color: 'from-teal-500 to-emerald-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      tab: 'doctors'
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments?.count || 3,
      change: stats?.todayAppointments?.change || '+18.0%',
      isPositive: true,
      icon: Calendar,
      color: 'from-sky-500 to-cyan-600',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600',
      tab: 'appointments'
    },
    {
      title: 'Pending Appointments',
      value: stats?.pendingAppointments?.count || 1,
      change: stats?.pendingAppointments?.change || '-5.1%',
      isPositive: false,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      tab: 'appointments'
    },
    {
      title: 'Completed Appointments',
      value: stats?.completedAppointments?.count || 2,
      change: stats?.completedAppointments?.change || '+22.4%',
      isPositive: true,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      tab: 'appointments'
    },
    {
      title: 'Available Beds',
      value: `${stats?.availableBeds?.count || 108}/${stats?.availableBeds?.total || 150}`,
      change: '72% Available',
      isPositive: true,
      icon: Bed,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      tab: 'emergency'
    },
    {
      title: 'Emergency Cases',
      value: stats?.emergencyCases?.count || 3,
      change: 'Active in ER',
      isPositive: false,
      icon: AlertOctagon,
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      tab: 'emergency'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue?.count || 709.51).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats?.totalRevenue?.change || '+15.8%',
      isPositive: true,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      tab: 'billing'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Live Healthcare Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Healthcare Professional'}!
            </h1>
            <p className="text-brand-100 text-xs sm:text-sm mt-1 max-w-xl">
              Hospital systems operating at optimal capacity. All clinical departments, ER triage, and pharmacy stock synchronized.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Live</span>
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className="px-4 py-2 rounded-xl bg-white text-brand-700 hover:bg-brand-50 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(card.tab)}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{card.title}</span>
                <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.textColor} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</span>
                <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  card.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {card.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{card.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Appointment & Revenue Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Monthly Appointments & Hospital Trends</h2>
              <p className="text-xs text-slate-400">Total appointments scheduled vs completed across past 6 months</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Appointments
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyAppointments || []}>
                <defs>
                  <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="appointments" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApt)" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Doughnut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Appointment Status</h2>
            <p className="text-xs text-slate-400">Current allocation breakdown</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-2">
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.appointmentStatusDist || [
                      { name: 'Completed', value: 2, color: '#10b981' },
                      { name: 'Scheduled', value: 4, color: '#0284c7' },
                      { name: 'Pending', value: 1, color: '#f59e0b' },
                      { name: 'Cancelled', value: 1, color: '#ef4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts?.appointmentStatusDist || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full mt-2 pt-2 border-t border-slate-100 text-xs">
              {(charts?.appointmentStatusDist || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                  <span className="font-bold text-slate-900 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Today's Appointments & Emergency Triage Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments Live List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Today's Appointment Schedule</h2>
              <p className="text-xs text-slate-400">Real-time patient clinic queue</p>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {todayAppointments.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">No appointments scheduled for today.</p>
            ) : (
              todayAppointments.map(apt => (
                <div key={apt._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {apt.patientName ? apt.patientName.charAt(0) : 'P'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{apt.patientName}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {apt.doctorName} • <span className="text-slate-600 font-medium">{apt.timeSlot}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                      apt.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {apt.status}
                    </span>

                    {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleUpdateAptStatus(apt._id, 'Completed')}
                        title="Mark as Completed"
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergency Triage Tracker */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
              <h2 className="text-sm font-bold text-slate-800">Emergency & Triage Unit</h2>
            </div>
            <button
              onClick={() => setActiveTab('emergency')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>ER Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {emergencyCases.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">No active emergency cases in ER.</p>
            ) : (
              emergencyCases.map(emg => (
                <div key={emg._id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{emg.patientName}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        emg.priority === 'Critical' ? 'bg-rose-600 text-white animate-emergency' :
                        emg.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {emg.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{emg.bedNumber}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{emg.chiefComplaint}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Doctor: <span className="text-slate-700 font-medium">{emg.assignedDoctorName}</span> • {emg.department}
                    </p>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold shrink-0">
                    {emg.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Row */}
      <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
          Quick Hospital Operations
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => setActiveTab('patients')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-xs font-semibold text-slate-700 hover:text-brand-700 transition-colors shadow-sm"
          >
            <Users className="w-4 h-4 text-brand-600" />
            <span>New Patient</span>
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs font-semibold text-slate-700 hover:text-teal-700 transition-colors shadow-sm"
          >
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>Doctors</span>
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-colors shadow-sm"
          >
            <Pill className="w-4 h-4 text-indigo-600" />
            <span>Prescription</span>
          </button>
          <button
            onClick={() => setActiveTab('pharmacy')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-xs font-semibold text-slate-700 hover:text-amber-700 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Pharmacy</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors shadow-sm"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Create Bill</span>
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-xs font-semibold text-slate-700 hover:text-rose-700 transition-colors shadow-sm"
          >
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>ER Triage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

