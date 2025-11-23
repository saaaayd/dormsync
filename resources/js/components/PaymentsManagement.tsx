import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios
import { DollarSign, Plus, Download, Filter, Receipt as ReceiptIcon, Trash2 } from 'lucide-react';

// Define the Type locally or import it
interface Payment {
  id: number;
  studentName?: string; // Make optional as backend might send 'student' object
  student?: { name: string }; // Handle relationship
  amount: number;
  type: string;
  status: 'paid' | 'pending' | 'overdue';
  due_date: string; // Laravel uses snake_case by default
  paid_date?: string;
  notes?: string;
}

export function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]); // Start empty
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Currency Formatter Helper
  const formatPeso = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  // FETCH DATA from Backend
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments');
      setPayments(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setLoading(false);
    }
  };

  // DELETE Payment
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;

    try {
      await axios.delete(`/api/payments/${id}`);
      // Remove from UI immediately
      setPayments(payments.filter(p => p.id !== id));
      alert("Payment deleted successfully.");
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete payment.");
    }
  };

  // Filter Logic
  const filteredPayments = filterStatus === 'all' 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  // Calculate Totals
  const calculateTotal = (status: string) => {
    return payments
      .filter(p => p.status === status)
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-[#001F3F] text-2xl font-bold">Payment Management</h2>
          <p className="text-gray-600 text-sm mt-1">Track and manage student payment records</p>
        </div>
        <button className="flex items-center gap-2 bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Stats Cards (Updated with Peso) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-700">{formatPeso(calculateTotal('paid'))}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{formatPeso(calculateTotal('pending'))}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-700">{formatPeso(calculateTotal('overdue'))}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#001F3F]">
          <p className="text-sm text-gray-600 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-[#001F3F]">{payments.length}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Filter by status:</span>
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-[#001F3F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#001F3F] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm">Student</th>
                <th className="px-6 py-3 text-left text-sm">Amount</th>
                <th className="px-6 py-3 text-left text-sm">Type</th>
                <th className="px-6 py-3 text-left text-sm">Due Date</th>
                <th className="px-6 py-3 text-left text-sm">Paid Date</th>
                <th className="px-6 py-3 text-left text-sm">Status</th>
                <th className="px-6 py-3 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                 <tr><td colSpan={7} className="text-center py-4">Loading records...</td></tr>
              ) : filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  {/* Handle student name from relationship or direct field */}
                  <td className="px-6 py-4 font-medium">{payment.student?.name || payment.studentName || 'Unknown'}</td>
                  <td className="px-6 py-4 font-bold text-[#001F3F]">
                    {formatPeso(payment.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize bg-gray-100 px-3 py-1 rounded text-sm">
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {payment.status === 'paid' && (
                      <button
                        onClick={() => handleViewReceipt(payment)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Receipt"
                      >
                        <ReceiptIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(payment.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Record"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal (Updated with Peso) */}
      {showReceipt && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-[#001F3F] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Payment Receipt</h3>
              <button onClick={() => setShowReceipt(false)} className="text-white hover:text-[#FFD700]">✕</button>
            </div>
            
            <div className="p-8">
              <div className="text-center mb-8 pb-6 border-b-2 border-[#FFD700]">
                <h2 className="text-[#001F3F] text-2xl font-bold">DormSync</h2>
                <p className="text-gray-600 text-sm mt-2">Official Payment Receipt</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                   <div><p className="text-sm text-gray-500">Receipt No.</p><p className="font-mono font-bold text-[#001F3F]">RCP-{selectedPayment.id}</p></div>
                   <div><p className="text-sm text-gray-500">Date</p><p className="font-bold text-[#001F3F]">{selectedPayment.paid_date}</p></div>
                </div>

                <div className="bg-[#001F3F] text-white p-6 rounded-lg mt-4">
                  <div className="flex items-center justify-between">
                    <span>Amount Paid</span>
                    <span className="text-3xl font-bold text-[#FFD700]">{formatPeso(selectedPayment.amount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}