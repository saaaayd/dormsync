import React from 'react';
import { DollarSign, Wrench, Megaphone, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockPayments, mockMaintenanceRequests, mockAnnouncements } from '../data/mockData';

export function StudentDashboard() {
  const { user } = useAuth();
  
  // Filter data for current student
  const studentPayments = mockPayments.filter(p => p.studentId === 1);
  const studentRequests = mockMaintenanceRequests.filter(r => r.studentId === 1);
  const recentAnnouncements = mockAnnouncements.slice(0, 3);
  
  // Calculate balance
  const totalDue = studentPayments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueCount = studentPayments.filter(p => p.status === 'overdue').length;
  const pendingRequests = studentRequests.filter(r => r.status !== 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#001F3F] to-[#003366] text-white rounded-lg shadow-lg p-8">
        <h2>Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-white/80 mt-2">
          Room {user?.studentProfile?.roomNumber} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#FFD700]">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-[#FFD700] text-[#001F3F] p-3 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            {overdueCount > 0 && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <p className="text-3xl mb-1">${totalDue}</p>
          <p className="text-sm text-gray-600">Current Balance</p>
          {overdueCount > 0 && (
            <p className="text-xs text-red-600 mt-2">{overdueCount} overdue payment(s)</p>
          )}
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#001F3F]">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-[#001F3F] text-white p-3 rounded-lg">
              <Wrench className="w-6 h-6" />
            </div>
            {pendingRequests > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Active</span>
            )}
          </div>
          <p className="text-3xl mb-1">{pendingRequests}</p>
          <p className="text-sm text-gray-600">Pending Requests</p>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl mb-1">{mockAnnouncements.length}</p>
          <p className="text-sm text-gray-600">Active Announcements</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Maintenance Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-[#001F3F] mb-4">My Maintenance Requests</h3>
          <div className="space-y-3">
            {studentRequests.length > 0 ? (
              studentRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-[#001F3F]">{request.title}</h4>
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                      request.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : request.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {request.status === 'resolved' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : request.status === 'in-progress' ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {request.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded ${
                      request.urgency === 'high' 
                        ? 'bg-red-100 text-red-700'
                        : request.urgency === 'medium'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {request.urgency} priority
                    </span>
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wrench className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No maintenance requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-[#001F3F] mb-4">Latest Announcements</h3>
          <div className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="border-l-4 border-[#FFD700] pl-4 py-2">
                <div className="flex items-start justify-between">
                  <h4 className="text-[#001F3F]">{announcement.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                    announcement.priority === 'urgent' 
                      ? 'bg-red-100 text-red-700'
                      : announcement.priority === 'important'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-[#001F3F] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 bg-[#001F3F] text-white px-4 py-3 rounded-lg hover:bg-[#003366] transition-colors">
            <Wrench className="w-5 h-5" />
            <span>Submit Maintenance Request</span>
          </button>
          <button className="flex items-center justify-center gap-2 bg-[#FFD700] text-[#001F3F] px-4 py-3 rounded-lg hover:bg-[#FFC700] transition-colors">
            <DollarSign className="w-5 h-5" />
            <span>View Payment History</span>
          </button>
        </div>
      </div>
    </div>
  );
}
