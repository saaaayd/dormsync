import React, { useState } from 'react';
import { DollarSign, Plus, Download, Filter, Receipt as ReceiptIcon } from 'lucide-react';
import { mockPayments } from '../data/mockData';
import { Payment } from '../types';

export function PaymentsManagement() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const filteredPayments = filterStatus === 'all' 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-[#001F3F]">Payment Management</h2>
          <p className="text-gray-600 text-sm mt-1">Track and manage student payment records</p>
        </div>
        <button className="flex items-center gap-2 bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] transition-colors">
          <Plus className="w-5 h-5" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Stats & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Total Paid</p>
          <p className="text-2xl text-green-700">
            ${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl text-yellow-700">
            ${payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Overdue</p>
          <p className="text-2xl text-red-700">
            ${payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#001F3F]">
          <p className="text-sm text-gray-600 mb-1">Total Records</p>
          <p className="text-2xl text-[#001F3F]">{payments.length}</p>
        </div>
      </div>

      {/* Filter */}
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
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{payment.studentName}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      {payment.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize bg-gray-100 px-3 py-1 rounded text-sm">
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-xs ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {payment.status === 'paid' && (
                      <button
                        onClick={() => handleViewReceipt(payment)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <ReceiptIcon className="w-4 h-4" />
                        Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-[#001F3F] text-white px-6 py-4 flex items-center justify-between">
              <h3>Payment Receipt</h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-white hover:text-[#FFD700] transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8">
              {/* Receipt Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-[#FFD700]">
                <h2 className="text-[#001F3F]">DormSync</h2>
                <p className="text-gray-600 text-sm mt-2">Dormitory Management System</p>
                <p className="text-gray-600 text-sm">Official Payment Receipt</p>
              </div>

              {/* Receipt Details */}
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Receipt Number</p>
                    <p className="text-[#001F3F]">RCP-{selectedPayment.id.toString().padStart(6, '0')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p className="text-[#001F3F]">
                      {selectedPayment.paidDate && new Date(selectedPayment.paidDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Student Name</p>
                    <p className="text-[#001F3F]">{selectedPayment.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Type</p>
                    <p className="text-[#001F3F] capitalize">{selectedPayment.type}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-800">{selectedPayment.notes || 'Payment received'}</p>
                </div>

                <div className="bg-[#001F3F] text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>Amount Paid</span>
                    <span className="text-3xl text-[#FFD700]">${selectedPayment.amount}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-600 pt-6 border-t">
                <p>This is a computer-generated receipt and is valid without signature.</p>
                <p className="mt-2">For inquiries, contact DormSync Administration</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
