import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Billing = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [bills, setBills] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedBill, setSelectedBill] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // New Invoice Form
  const [formData, setFormData] = useState({
    patientId: '',
    consultationFee: 150,
    labCharges: 65,
    medicineCharges: 25,
    otherCharges: 0,
    discount: 10,
    dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    notes: 'Outpatient consultation & pharmacy bill'
  });

  // Record Payment Form
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [transactionRef, setTransactionRef] = useState('');

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.getBills({
        status: statusFilter,
        search
      });
      if (res.success) {
        setBills(res.bills);
      }
    } catch {
      toast.error('Failed to load billing invoices.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.getPatients();
      if (res.success) setPatientsList(res.patients);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      patientId: patientsList[0]?._id || '',
      consultationFee: 150,
      labCharges: 65,
      medicineCharges: 25,
      otherCharges: 0,
      discount: 10,
      dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      notes: 'Outpatient clinical fees'
    });
    setCreateModalOpen(true);
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      toast.error('Please select a patient.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createBill(formData);
      if (res.success) {
        toast.success(res.message);
        setCreateModalOpen(false);
        fetchBills();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPayment = (bill) => {
    setSelectedBill(bill);
    const balance = Math.max(0, (bill.totalAmount || 0) - (bill.paidAmount || 0));
    setPaymentAmount(balance);
    setPaymentMethod('Credit Card');
    setTransactionRef(`TXN-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (Number(paymentAmount) <= 0) {
      toast.error('Payment amount must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.recordPayment(selectedBill._id, {
        amount: Number(paymentAmount),
        paymentMethod,
        transactionId: transactionRef,
        notes: `Recorded by cashier via ${paymentMethod}`
      });

      if (res.success) {
        toast.success(res.message);
        setPaymentModalOpen(false);
        fetchBills();
      }
    } catch (err) {
      toast.error(err.message || 'Payment recording failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintInvoice = (bill) => {
    setSelectedBill(bill);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleDeleteBill = async () => {
    setSubmitting(true);
    try {
      const res = await api.deleteBill(selectedBill._id);
      if (res.success) {
        toast.success(res.message);
        setDeleteModalOpen(false);
        fetchBills();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete invoice.');
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
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Billing & Payment Invoices</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Itemized hospital invoices, cashier payment processing, and printable tax receipts.
          </p>
        </div>

        {['admin', 'receptionist'].includes(role) && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBills();
          }}
          className="relative w-full md:max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice ID, patient name, or method..."
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Payment Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Invoices</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading billing records...</div>
        ) : bills.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No invoices match your query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Issue Date / Due</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map(bill => {
                  const balance = Math.max(0, (bill.totalAmount || 0) - (bill.paidAmount || 0));
                  return (
                    <tr key={bill._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        {bill.invoiceId}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{bill.patientName}</p>
                        <p className="text-[11px] text-slate-400">{bill.patientPhone || '-'}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-mono text-slate-700">{bill.date}</p>
                        <p className="text-[10px] text-slate-400">Due: {bill.dueDate}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">
                        ${bill.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                        ${bill.paidAmount?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bill.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                          bill.paymentStatus === 'Partially Paid' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {bill.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {bill.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => handleOpenPayment(bill)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition-colors"
                            >
                              Pay ${balance.toFixed(2)}
                            </button>
                          )}
                          <button
                            onClick={() => handlePrintInvoice(bill)}
                            title="Print Invoice"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {role === 'admin' && (
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD PAYMENT MODAL */}
      {paymentModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Patient Payment</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <p className="font-bold text-emerald-950">{selectedBill.patientName}</p>
                <p className="text-emerald-700 mt-0.5">
                  Invoice {selectedBill.invoiceId} • Total: ${selectedBill.totalAmount?.toFixed(2)}
                </p>
                <p className="text-emerald-900 font-bold mt-1">
                  Remaining Balance: ${(selectedBill.totalAmount - (selectedBill.paidAmount || 0)).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Pay ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Cash">Cash at Reception</option>
                  <option value="Insurance Co-Pay">Insurance Claim / Co-Pay</option>
                  <option value="Bank Transfer">Direct Bank Wire</option>
                  <option value="UPI">UPI / Digital QR</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Complete Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE BILL MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Generate Patient Bill</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="">-- Patient --</option>
                  {patientsList.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Laboratory Diagnostics ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.labCharges}
                    onChange={(e) => setFormData({ ...formData, labCharges: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pharmacy / Medicines ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.medicineCharges}
                    onChange={(e) => setFormData({ ...formData, medicineCharges: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Other / Facility Charges ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.otherCharges}
                    onChange={(e) => setFormData({ ...formData, otherCharges: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Special Discount ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>Estimated Total (incl. 5% tax):</span>
                  <span className="text-emerald-700 font-mono">
                    ${(
                      ((Number(formData.consultationFee) || 0) +
                        (Number(formData.labCharges) || 0) +
                        (Number(formData.medicineCharges) || 0) +
                        (Number(formData.otherCharges) || 0) -
                        (Number(formData.discount) || 0)) * 1.05
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Issue Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE VIEW */}
      {selectedBill && (
        <div id="printable-document" className="hidden">
          <div className="border-4 border-slate-900 p-8 max-w-3xl mx-auto font-sans">
            <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
              <div>
                <h1 className="text-2xl font-black text-slate-900">CAREBRIDGE HOSPITAL</h1>
                <p className="text-xs text-slate-600">700 Healthway Blvd, Medical District</p>
                <p className="text-xs text-slate-500">Tax ID: MED-8849201 • Phone: +1 (555) 019-2831</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-slate-800">OFFICIAL INVOICE</h2>
                <p className="text-xs font-mono font-bold mt-1">{selectedBill.invoiceId}</p>
                <p className="text-xs text-slate-500">Date: {selectedBill.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-300 text-xs">
              <div>
                <p className="font-bold text-slate-700">Billed To:</p>
                <p className="text-sm font-bold text-slate-900">{selectedBill.patientName}</p>
                <p className="text-slate-600">Phone: {selectedBill.patientPhone || '-'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700">Payment Status:</p>
                <p className="text-sm font-extrabold text-emerald-700 uppercase">{selectedBill.paymentStatus}</p>
                <p className="text-slate-500 font-mono text-[11px]">Txn: {selectedBill.transactionId || 'N/A'}</p>
              </div>
            </div>

            <div className="py-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="py-2">Description</th>
                    <th className="py-2">Category</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedBill.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-semibold">{item.description}</td>
                      <td className="py-2 text-slate-500">{item.category}</td>
                      <td className="py-2 text-right font-mono">${item.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t-2 border-slate-900 flex justify-end text-xs">
                <div className="w-64 space-y-1.5 text-right">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-mono">${(selectedBill.totalAmount - (selectedBill.tax || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Healthcare Tax / Surcharge (5%):</span>
                    <span className="font-mono">${selectedBill.tax?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t">
                    <span>Total Amount:</span>
                    <span className="font-mono">${selectedBill.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Amount Paid:</span>
                    <span className="font-mono">${selectedBill.paidAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-between items-end pt-4 border-t border-slate-300 text-xs">
              <p className="text-slate-400">Thank you for choosing CareBridge Hospital.</p>
              <div className="text-center">
                <div className="w-40 border-b border-slate-900 mb-1"></div>
                <p className="font-bold">Hospital Accounts Cashier</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

