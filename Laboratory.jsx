import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Search,
  Plus,
  Printer,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  X,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Laboratory = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [tests, setTests] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedTest, setSelectedTest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    testName: 'Complete Blood Count (CBC) with Differential',
    category: 'Hematology',
    cost: 45.00,
    testDate: new Date().toISOString().split('T')[0],
    doctorNotes: ''
  });

  // Result entry form state
  const [resultSummary, setResultSummary] = useState('');
  const [paramDetails, setParamDetails] = useState([
    { parameter: 'Hemoglobin', value: '14.2', normalRange: '13.5 - 17.5', unit: 'g/dL', status: 'Normal' },
    { parameter: 'WBC Count', value: '6.8', normalRange: '4.5 - 11.0', unit: 'x10^3/uL', status: 'Normal' }
  ]);

  const fetchLabTests = async () => {
    setLoading(true);
    try {
      const res = await api.getLabTests({
        status: statusFilter,
        search
      });
      if (res.success) {
        setTests(res.tests);
      }
    } catch {
      toast.error('Failed to load laboratory tests.');
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
    fetchLabTests();
  }, [statusFilter]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      patientId: patientsList[0]?._id || '',
      doctorId: doctorsList[0]?._id || '',
      testName: 'Comprehensive Metabolic Panel (CMP)',
      category: 'Biochemistry',
      cost: 65.00,
      testDate: new Date().toISOString().split('T')[0],
      doctorNotes: 'Fast 8 hours prior to specimen acquisition.'
    });
    setCreateModalOpen(true);
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.testName) {
      toast.error('Patient, doctor, and test name are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createLabTest(formData);
      if (res.success) {
        toast.success(res.message);
        setCreateModalOpen(false);
        fetchLabTests();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to order lab test.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEnterResults = (test) => {
    setSelectedTest(test);
    setResultSummary(test.resultSummary || 'All parameters evaluated within physiological baseline.');
    setParamDetails(test.details && test.details.length > 0 ? test.details : [
      { parameter: 'Analyte Level', value: 'Normal', normalRange: 'Negative / Normal', unit: '-', status: 'Normal' }
    ]);
    setResultsModalOpen(true);
  };

  const handleSaveResults = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.updateLabTestStatus(selectedTest._id, {
        status: 'Completed',
        resultSummary,
        details: paramDetails
      });
      if (res.success) {
        toast.success('Laboratory results verified and published!');
        setResultsModalOpen(false);
        fetchLabTests();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to publish results.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReport = (test) => {
    setSelectedTest(test);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleDeleteTest = async () => {
    setSubmitting(true);
    try {
      const res = await api.deleteLabTest(selectedTest._id);
      if (res.success) {
        toast.success(res.message);
        setDeleteModalOpen(false);
        fetchLabTests();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete lab test.');
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
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Laboratory & Diagnostic Reports</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Order clinical diagnostics, enter lab findings, and generate patient pathology reports.
          </p>
        </div>

        {['admin', 'doctor', 'receptionist'].includes(role) && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Order Lab Test</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchLabTests();
          }}
          className="relative w-full md:max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search test name, patient, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Tests</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Lab Tests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading lab orders...</div>
        ) : tests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No laboratory test orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Test Order</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Category / Doctor</th>
                  <th className="py-3 px-4">Test Date</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.map(test => (
                  <tr key={test._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{test.testName}</p>
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-bold">
                          {test.testId}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {test.patientName}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-700 font-medium">{test.category}</p>
                      <p className="text-[11px] text-slate-400">Dr. {test.doctorName}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {test.testDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      ${test.cost?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        test.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        test.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {test.status !== 'Completed' && ['admin', 'doctor', 'receptionist'].includes(role) && (
                          <button
                            onClick={() => handleOpenEnterResults(test)}
                            className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-bold transition-colors"
                          >
                            Enter Results
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setViewModalOpen(true);
                          }}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {test.status === 'Completed' && (
                          <button
                            onClick={() => handlePrintReport(test)}
                            title="Print Report"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        {role === 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedTest(test);
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

      {/* ORDER LAB TEST MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Order Laboratory Test</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                >
                  <option value="">-- Patient --</option>
                  {patientsList.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ordering Physician *</label>
                <select
                  required
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                >
                  <option value="">-- Doctor --</option>
                  {doctorsList.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Test Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Blood Count (CBC)"
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Radiology">Radiology & Imaging</option>
                    <option value="Pathology">Pathology & Histology</option>
                    <option value="Microbiology">Microbiology & Serology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Test Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={formData.testDate}
                    onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Instructions / Notes</label>
                <textarea
                  rows="2"
                  value={formData.doctorNotes}
                  onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                  placeholder="Fasting requirements, specimen collection protocols..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Ordering...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENTER TEST RESULTS MODAL */}
      {resultsModalOpen && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enter Pathology / Diagnostic Results</h3>
                <p className="text-xs text-purple-600 font-mono">{selectedTest.testId} • {selectedTest.testName}</p>
              </div>
              <button onClick={() => setResultsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResults} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Result Summary *</label>
                <textarea
                  rows="2"
                  required
                  value={resultSummary}
                  onChange={(e) => setResultSummary(e.target.value)}
                  placeholder="Summary of findings, physiological indices, and diagnostic conclusions..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Measured Parameters</label>
                <div className="space-y-2">
                  {paramDetails.map((param, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Parameter"
                        value={param.parameter}
                        onChange={(e) => {
                          const updated = [...paramDetails];
                          updated[idx].parameter = e.target.value;
                          setParamDetails(updated);
                        }}
                        className="px-2 py-1 bg-white rounded-lg border border-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Measured Val"
                        value={param.value}
                        onChange={(e) => {
                          const updated = [...paramDetails];
                          updated[idx].value = e.target.value;
                          setParamDetails(updated);
                        }}
                        className="px-2 py-1 bg-white rounded-lg border border-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Normal Range"
                        value={param.normalRange}
                        onChange={(e) => {
                          const updated = [...paramDetails];
                          updated[idx].normalRange = e.target.value;
                          setParamDetails(updated);
                        }}
                        className="px-2 py-1 bg-white rounded-lg border border-slate-200"
                      />
                      <select
                        value={param.status}
                        onChange={(e) => {
                          const updated = [...paramDetails];
                          updated[idx].status = e.target.value;
                          setParamDetails(updated);
                        }}
                        className="px-2 py-1 bg-white rounded-lg border border-slate-200"
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setResultsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Verify & Publish Results'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LAB TEST MODAL */}
      {viewModalOpen && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedTest.testName}</h3>
                <p className="text-xs font-mono text-purple-600">{selectedTest.testId} • {selectedTest.category}</p>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Patient: {selectedTest.patientName}</p>
                  <p className="text-slate-500 text-[11px]">Ordering Doctor: Dr. {selectedTest.doctorName}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-slate-500">{selectedTest.testDate}</span>
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      {selectedTest.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Findings & Summary</p>
                <p className="font-medium text-slate-800 mt-1 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/60">
                  {selectedTest.resultSummary || 'Awaiting specimen analysis completion.'}
                </p>
              </div>

              {selectedTest.details && selectedTest.details.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Measured Clinical Parameters</p>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="p-2">Analyte</th>
                        <th className="p-2">Observed</th>
                        <th className="p-2">Reference</th>
                        <th className="p-2">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTest.details.map((d, i) => (
                        <tr key={i}>
                          <td className="p-2 font-bold">{d.parameter}</td>
                          <td className="p-2 font-mono">{d.value} {d.unit}</td>
                          <td className="p-2 text-slate-500">{d.normalRange}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              d.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-4">
              {selectedTest.status === 'Completed' && (
                <button
                  type="button"
                  onClick={() => handlePrintReport(selectedTest)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINTABLE LAB REPORT */}
      {selectedTest && (
        <div id="printable-document" className="hidden">
          <div className="border-4 border-slate-900 p-8 max-w-3xl mx-auto font-serif">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
              <div>
                <h1 className="text-2xl font-black text-slate-900">CAREBRIDGE CLINICAL PATHOLOGY</h1>
                <p className="text-xs text-slate-600">CAP & CLIA Accredited Diagnostic Reference Laboratory</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold">{selectedTest.testId}</span>
                <p className="text-xs text-slate-500">Date: {selectedTest.testDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-300 text-xs">
              <div>
                <p><span className="font-bold">Patient Name:</span> {selectedTest.patientName}</p>
                <p><span className="font-bold">Ordering Physician:</span> Dr. {selectedTest.doctorName}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold">Investigation:</span> {selectedTest.testName}</p>
                <p><span className="font-bold">Category:</span> {selectedTest.category}</p>
              </div>
            </div>

            <div className="py-4">
              <h3 className="font-bold text-sm mb-1">Result Summary & Interpretation:</h3>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 border border-slate-200">
                {selectedTest.resultSummary}
              </p>
            </div>

            {selectedTest.details && selectedTest.details.length > 0 && (
              <div className="py-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900">
                      <th className="py-1">Parameter</th>
                      <th className="py-1">Observed Value</th>
                      <th className="py-1">Reference Range</th>
                      <th className="py-1">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTest.details.map((d, i) => (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="py-2 font-bold">{d.parameter}</td>
                        <td className="py-2 font-mono">{d.value} {d.unit}</td>
                        <td className="py-2">{d.normalRange}</td>
                        <td className="py-2 font-bold">{d.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-12 flex justify-between items-end pt-4 border-t border-slate-300">
              <p className="text-[10px] text-slate-400">Electronically validated by Medical Technologist.</p>
              <div className="text-center">
                <div className="w-40 border-b border-slate-900 mb-1"></div>
                <p className="text-xs font-bold">Chief Pathologist</p>
                <p className="text-[10px] text-slate-500">CareBridge Diagnostics</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

