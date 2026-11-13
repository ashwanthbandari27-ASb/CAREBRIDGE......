import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Building,
  Bell,
  Database,
  CheckCircle2,
  ShieldCheck,
  Save,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Settings = () => {
  const { user, role, updateProfile, changePassword } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'system'

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || 'Hospital Operations'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // System Settings State
  const [hospitalConfig, setHospitalConfig] = useState({
    hospitalName: 'CareBridge Central Hospital & Medical Center',
    address: '700 Healthway Boulevard, Medical District, Springfield',
    hotline: '+1 (800) 555-CARE',
    emergencyDirect: '+1 (555) 911-0000',
    currency: 'USD ($)',
    timeZone: 'Eastern Time (US & Canada)',
    autoBackup: true,
    emailAlerts: true
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        department: profileData.department
      });
      if (res.success) {
        toast.success('Profile details updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      if (res.success) {
        toast.success('Password changed successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.message || 'Password change failed.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveHospitalConfig = (e) => {
    e.preventDefault();
    toast.success('Hospital system configuration saved successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">System & Account Settings</h1>
            <p className="text-xs text-slate-500">Configure profile, security preferences, and hospital system settings.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/60 p-1 rounded-2xl max-w-md text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'security' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Security & Password
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'system' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hospital System
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-2xl">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}&backgroundColor=0284c7`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-500/10"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 capitalize border border-brand-200">
                {role}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={profileData.email}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Email is locked to your verified account identity.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Saving...' : 'Update Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SECURITY */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-xl">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Change Password</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ensure your account uses a strong password with letters and numbers.</p>
          </div>

          <form onSubmit={handleChangePassword} className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password (min 6 characters) *</label>
              <input
                type="password"
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: HOSPITAL SYSTEM CONFIG */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-2xl">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hospital Information & Preferences</h2>
              <p className="text-xs text-slate-500">Institution details printed on invoices, prescriptions, and reports.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>Database Online</span>
            </div>
          </div>

          <form onSubmit={handleSaveHospitalConfig} className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital / Clinic Facility Name</label>
              <input
                type="text"
                value={hospitalConfig.hospitalName}
                onChange={(e) => setHospitalConfig({ ...hospitalConfig, hospitalName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={hospitalConfig.address}
                onChange={(e) => setHospitalConfig({ ...hospitalConfig, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">General Reception Helpline</label>
                <input
                  type="text"
                  value={hospitalConfig.hotline}
                  onChange={(e) => setHospitalConfig({ ...hospitalConfig, hotline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Department Direct Line</label>
                <input
                  type="text"
                  value={hospitalConfig.emergencyDirect}
                  onChange={(e) => setHospitalConfig({ ...hospitalConfig, emergencyDirect: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Active Storage Driver Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="font-bold text-slate-800">Storage Engine: High-Performance Persistent JSON DB / MongoDB</p>
                  <p className="text-[11px] text-slate-500">Persisted locally at backend/data/carebridge_db.json with automatic fallback.</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Active</span>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Hospital Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

