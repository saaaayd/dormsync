import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentsManagement } from './components/StudentsManagement';
import { PaymentsManagement } from './components/PaymentsManagement';
import { MaintenanceManagement } from './components/MaintenanceManagement';
import { AttendanceManagement } from './components/AttendanceManagement';
import { CleaningSchedule } from './components/CleaningSchedule';
import { AnnouncementsManagement } from './components/AnnouncementsManagement';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#001F3F] border-t-[#FFD700] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    if (user.role === 'admin') {
      switch (currentPage) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'students':
          return <StudentsManagement />;
        case 'payments':
          return <PaymentsManagement />;
        case 'maintenance':
          return <MaintenanceManagement />;
        case 'attendance':
          return <AttendanceManagement />;
        case 'cleaning':
          return <CleaningSchedule />;
        case 'announcements':
          return <AnnouncementsManagement />;
        default:
          return <AdminDashboard />;
      }
    } else {
      // Student pages
      switch (currentPage) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'profile':
          return <StudentProfile />;
        case 'payments':
          return <StudentPayments />;
        case 'maintenance':
          return <StudentMaintenance />;
        case 'announcements':
          return <AnnouncementsManagement />;
        default:
          return <StudentDashboard />;
      }
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

// Student-specific components (simplified versions)
function StudentProfile() {
  const { user } = useAuth();
  const profile = user?.studentProfile;

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-[#001F3F] mb-6">My Profile</h2>
        
        <div className="flex items-center gap-6 mb-8 pb-6 border-b">
          <div className="w-24 h-24 bg-[#001F3F] text-white rounded-full flex items-center justify-center text-3xl">
            {user?.name?.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-[#001F3F]">{user?.name}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-gray-600 text-sm mt-1">Room {profile?.roomNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Phone Number</p>
            <p className="text-[#001F3F]">{profile?.phoneNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Enrollment Date</p>
            <p className="text-[#001F3F]">
              {profile?.enrollmentDate && new Date(profile.enrollmentDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Emergency Contact</p>
            <p className="text-[#001F3F]">{profile?.emergencyContactName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Emergency Phone</p>
            <p className="text-[#001F3F]">{profile?.emergencyContactPhone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-700 text-sm">
              {profile?.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  });

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await axios.get('/api/payments', {
          params: { student_id: user.id },
        });
        setPayments(res.data);
      } catch (error) {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user?.id]);

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const totalDue = pendingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#001F3F]">My Payments</h2>
        <p className="text-gray-600 text-sm mt-1">
          View your payment history and outstanding balance
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#001F3F] to-[#003366] text-white rounded-lg shadow-lg p-6">
        <p className="text-white/80 mb-2">Current Balance</p>
        <p className="text-4xl text-[#FFD700] mb-1">
          {currencyFormatter.format(totalDue)}
        </p>
        <p className="text-white/80 text-sm">
          {pendingPayments.length} pending payment(s)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No payments have been posted for your account yet.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#001F3F] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">Type</th>
                  <th className="px-6 py-3 text-left text-sm">Amount</th>
                  <th className="px-6 py-3 text-left text-sm">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm">Status</th>
                  <th className="px-6 py-3 text-left text-sm">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="capitalize bg-gray-100 px-3 py-1 rounded text-sm">
                        {payment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {currencyFormatter.format(Number(payment.amount || 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.due_date
                        ? new Date(payment.due_date).toLocaleDateString()
                        : '--'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs ${
                          payment.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentMaintenance() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[#001F3F]">Maintenance Requests</h2>
          <p className="text-gray-600 text-sm mt-1">Submit and track your maintenance requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] transition-colors"
        >
          Submit Request
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-[#001F3F] mb-4">New Maintenance Request</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                placeholder="Brief description of the issue"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Urgency Level</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                placeholder="Provide detailed information about the issue"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#001F3F] text-white px-6 py-2 rounded-lg hover:bg-[#003366] transition-colors"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="text-center py-12 text-gray-500">
        <p>Your maintenance requests will appear here</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
