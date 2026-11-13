const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('carebridge_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // If 401 Unauthorized, notify or clear session if token invalid
      if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        // Clear token if invalid session
        localStorage.removeItem('carebridge_token');
        localStorage.removeItem('carebridge_user');
      }
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  changePassword: (passwords) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(passwords) }),

  // Patients
  getPatients: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/patients${query ? `?${query}` : ''}`);
  },
  getPatientById: (id) => request(`/patients/${id}`),
  createPatient: (patient) => request('/patients', { method: 'POST', body: JSON.stringify(patient) }),
  updatePatient: (id, patient) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(patient) }),
  deletePatient: (id) => request(`/patients/${id}`, { method: 'DELETE' }),

  // Doctors
  getDoctors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctors${query ? `?${query}` : ''}`);
  },
  getDoctorById: (id) => request(`/doctors/${id}`),
  createDoctor: (doctor) => request('/doctors', { method: 'POST', body: JSON.stringify(doctor) }),
  updateDoctor: (id, doctor) => request(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(doctor) }),
  deleteDoctor: (id) => request(`/doctors/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/appointments${query ? `?${query}` : ''}`);
  },
  getAppointmentById: (id) => request(`/appointments/${id}`),
  createAppointment: (appointment) => request('/appointments', { method: 'POST', body: JSON.stringify(appointment) }),
  updateAppointmentStatus: (id, statusData) => request(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  rescheduleAppointment: (id, rescheduleData) => request(`/appointments/${id}/reschedule`, { method: 'PUT', body: JSON.stringify(rescheduleData) }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),

  // Medical Records
  getMedicalRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/records${query ? `?${query}` : ''}`);
  },
  getMedicalRecordById: (id) => request(`/records/${id}`),
  createMedicalRecord: (record) => request('/records', { method: 'POST', body: JSON.stringify(record) }),
  updateMedicalRecord: (id, record) => request(`/records/${id}`, { method: 'PUT', body: JSON.stringify(record) }),
  deleteMedicalRecord: (id) => request(`/records/${id}`, { method: 'DELETE' }),

  // Prescriptions
  getPrescriptions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/prescriptions${query ? `?${query}` : ''}`);
  },
  getPrescriptionById: (id) => request(`/prescriptions/${id}`),
  createPrescription: (prescription) => request('/prescriptions', { method: 'POST', body: JSON.stringify(prescription) }),
  updatePrescription: (id, prescription) => request(`/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(prescription) }),
  deletePrescription: (id) => request(`/prescriptions/${id}`, { method: 'DELETE' }),

  // Pharmacy
  getMedicines: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/pharmacy${query ? `?${query}` : ''}`);
  },
  getMedicineById: (id) => request(`/pharmacy/${id}`),
  createMedicine: (medicine) => request('/pharmacy', { method: 'POST', body: JSON.stringify(medicine) }),
  updateStock: (id, stockData) => request(`/pharmacy/${id}/stock`, { method: 'PUT', body: JSON.stringify(stockData) }),
  updateMedicine: (id, medicine) => request(`/pharmacy/${id}`, { method: 'PUT', body: JSON.stringify(medicine) }),
  deleteMedicine: (id) => request(`/pharmacy/${id}`, { method: 'DELETE' }),

  // Laboratory
  getLabTests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/lab${query ? `?${query}` : ''}`);
  },
  getLabTestById: (id) => request(`/lab/${id}`),
  createLabTest: (test) => request('/lab', { method: 'POST', body: JSON.stringify(test) }),
  updateLabTestStatus: (id, data) => request(`/lab/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLabTest: (id) => request(`/lab/${id}`, { method: 'DELETE' }),

  // Billing
  getBills: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/billing${query ? `?${query}` : ''}`);
  },
  getBillById: (id) => request(`/billing/${id}`),
  createBill: (bill) => request('/billing', { method: 'POST', body: JSON.stringify(bill) }),
  recordPayment: (id, paymentData) => request(`/billing/${id}/payment`, { method: 'POST', body: JSON.stringify(paymentData) }),
  deleteBill: (id) => request(`/billing/${id}`, { method: 'DELETE' }),

  // Emergency
  getEmergencyCases: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/emergency${query ? `?${query}` : ''}`);
  },
  getEmergencyCaseById: (id) => request(`/emergency/${id}`),
  createEmergencyCase: (data) => request('/emergency', { method: 'POST', body: JSON.stringify(data) }),
  updateEmergencyStatus: (id, data) => request(`/emergency/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmergencyCase: (id) => request(`/emergency/${id}`, { method: 'DELETE' }),

  // Analytics & Dashboard
  getDashboardStats: () => request('/analytics/dashboard-stats'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsAsRead: () => request('/notifications/read-all', { method: 'PUT' })
};

