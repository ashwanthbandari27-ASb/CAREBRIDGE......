import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Pill,
  Package,
  FlaskConical,
  CreditCard,
  AlertOctagon,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ShieldAlert,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const navigationItems = [
  { id: 'dashboard', name: 'Dashboard', icon: Activity, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
  { id: 'patients', name: 'Patients', icon: Users, roles: ['admin', 'doctor', 'receptionist'] },
  { id: 'doctors', name: 'Doctors', icon: UserCheck, roles: ['admin', 'receptionist'] },
  { id: 'appointments', name: 'Appointments', icon: Calendar, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
  { id: 'medical-records', name: 'Medical Records', icon: FileText, roles: ['admin', 'doctor', 'patient'] },
  { id: 'prescriptions', name: 'Prescriptions', icon: Pill, roles: ['admin', 'doctor', 'patient'] },
  { id: 'pharmacy', name: 'Pharmacy', icon: Package, roles: ['admin', 'receptionist'] },
  { id: 'laboratory', name: 'Laboratory Reports', icon: FlaskConical, roles: ['admin', 'doctor', 'patient'] },
  { id: 'billing', name: 'Billing & Payments', icon: CreditCard, roles: ['admin', 'receptionist', 'patient'] },
  { id: 'emergency', name: 'Emergency Services', icon: AlertOctagon, roles: ['admin', 'doctor', 'receptionist'] },
  { id: 'analytics', name: 'Reports & Analytics', icon: BarChart3, roles: ['admin'] },
  { id: 'settings', name: 'Settings', icon: Settings, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
];

export const DashboardLayout = ({ activeTab, setActiveTab, children }) => {
  const { user, role, logout } = useAuth();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.getNotifications();
        if (res.success && res.notifications) {
          setNotifications(res.notifications);
          setUnreadCount(res.notifications.filter(n => !n.read).length);
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to update notifications.');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const filteredNav = navigationItems.filter(item => item.roles.includes(role || 'patient'));

  const getRoleBadge = (r) => {
    switch (r) {
      case 'admin':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">Admin</span>;
      case 'doctor':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">Physician</span>;
      case 'receptionist':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-700 border border-teal-200">Receptionist</span>;
      case 'patient':
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Patient</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Mobile hamburger & Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xl tracking-tight text-slate-900">CARE<span className="text-brand-600">BRIDGE</span></span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-teal-50 text-teal-700 border border-teal-200/60 rounded">AI</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 tracking-wider uppercase -mt-1">Smart Healthcare System</p>
                </div>
              </div>
            </div>

            {/* Center: Global Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patients, doctors, records, medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      // Navigate to search-relevant module
                      const q = searchQuery.toLowerCase();
                      if (q.includes('pat') || q.includes('patient')) setActiveTab('patients');
                      else if (q.includes('doc') || q.includes('doctor')) setActiveTab('doctors');
                      else if (q.includes('apt') || q.includes('appoint')) setActiveTab('appointments');
                      else if (q.includes('med') || q.includes('pharm') || q.includes('pill')) setActiveTab('pharmacy');
                      else if (q.includes('lab') || q.includes('test')) setActiveTab('laboratory');
                      else if (q.includes('bill') || q.includes('pay') || q.includes('inv')) setActiveTab('billing');
                      else if (q.includes('emg') || q.includes('emerg')) setActiveTab('emergency');
                      else setActiveTab('patients');
                      toast.info(`Searching for "${searchQuery}" in modules...`);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 border border-transparent focus:border-brand-500 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            {/* Right: Actions, Notifications & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50/70 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-center py-6 text-sm text-slate-400">No new notifications</p>
                      ) : (
                        notifications.slice(0, 6).map(n => (
                          <div
                            key={n._id}
                            onClick={() => handleMarkRead(n._id)}
                            className={`py-3 px-2 flex items-start gap-3 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors ${!n.read ? 'bg-brand-50/40' : ''}`}
                          >
                            <div className="mt-0.5">
                              {n.type === 'urgent' ? (
                                <ShieldAlert className="w-4 h-4 text-rose-500" />
                              ) : n.type === 'warning' ? (
                                <AlertOctagon className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Sparkles className="w-4 h-4 text-teal-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 self-center"></span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}&backgroundColor=0284c7`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/20"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'User'}</p>
                    <div className="mt-0.5">{getRoleBadge(role)}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-1.5">{getRoleBadge(role)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Account Settings
                    </button>
                    <button
                      onClick={() => {
                        setLogoutModalOpen(true);
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Body with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex py-6 gap-6">
        {/* Desktop Sidebar (Numbered 1 to 13) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 h-[calc(100vh-7rem)] sticky top-24">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main Navigation
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {filteredNav.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                      : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-600'}`} />
                    <span>{item.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'text-slate-400'}`}>
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Logout</span>
              </div>
              <span className="text-[10px] font-mono text-rose-400">13</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-slate-900 text-lg">CAREBRIDGE</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto mt-4 space-y-1">
                {filteredNav.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-brand-500 text-white font-semibold shadow-md'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-xs opacity-75">{idx + 1}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLogoutModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Center Content View Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Confirm Sign Out</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to end your current CareBridge healthcare session?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setLogoutModalOpen(false);
                  toast.info('Signed out successfully.');
                }}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

