import React, { useState } from 'react';
import { Plus, AlertCircle, Clock, CheckCircle, Filter } from 'lucide-react';
import { mockMaintenanceRequests } from '../data/mockData';
import { MaintenanceRequest } from '../types';

export function MaintenanceManagement() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(mockMaintenanceRequests);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const inProgressRequests = requests.filter(r => r.status === 'in-progress');
  const resolvedRequests = requests.filter(r => r.status === 'resolved');

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const RequestCard = ({ request }: { request: MaintenanceRequest }) => (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${
      request.urgency === 'high' 
        ? 'border-red-500' 
        : request.urgency === 'medium' 
        ? 'border-orange-500' 
        : 'border-gray-300'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[#001F3F]">{request.title}</h4>
        <span className={`text-xs px-2 py-1 rounded border ${getUrgencyColor(request.urgency)}`}>
          {request.urgency}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
      <div className="space-y-2 text-sm text-gray-600">
        <p>Room {request.roomNumber} - {request.studentName}</p>
        <p className="text-xs text-gray-500">
          {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="mt-3 pt-3 border-t flex gap-2">
        <button className="flex-1 text-xs bg-[#001F3F] text-white px-3 py-2 rounded hover:bg-[#003366] transition-colors">
          Update Status
        </button>
        <button className="text-xs px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
          Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-[#001F3F]">Maintenance Management</h2>
          <p className="text-gray-600 text-sm mt-1">Track and manage maintenance requests</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'kanban'
                ? 'bg-[#001F3F] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'list'
                ? 'bg-[#001F3F] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#001F3F]">
          <p className="text-sm text-gray-600 mb-1">Total Requests</p>
          <p className="text-2xl text-[#001F3F]">{requests.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl text-yellow-700">{pendingRequests.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">In Progress</p>
          <p className="text-2xl text-blue-700">{inProgressRequests.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Resolved</p>
          <p className="text-2xl text-green-700">{resolvedRequests.length}</p>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="text-[#001F3F]">Pending</h3>
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                {pendingRequests.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
              {pendingRequests.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No pending requests</p>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-[#001F3F]">In Progress</h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                {inProgressRequests.length}
              </span>
            </div>
            <div className="space-y-3">
              {inProgressRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
              {inProgressRequests.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No requests in progress</p>
              )}
            </div>
          </div>

          {/* Resolved Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-[#001F3F]">Resolved</h3>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                {resolvedRequests.length}
              </span>
            </div>
            <div className="space-y-3">
              {resolvedRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
              {resolvedRequests.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No resolved requests</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#001F3F] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">Title</th>
                  <th className="px-6 py-3 text-left text-sm">Student</th>
                  <th className="px-6 py-3 text-left text-sm">Room</th>
                  <th className="px-6 py-3 text-left text-sm">Urgency</th>
                  <th className="px-6 py-3 text-left text-sm">Status</th>
                  <th className="px-6 py-3 text-left text-sm">Date</th>
                  <th className="px-6 py-3 text-left text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{request.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.studentName}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-3 py-1 rounded text-sm">{request.roomNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded border ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        request.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : request.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
