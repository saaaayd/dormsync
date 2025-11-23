import React, { useState } from 'react';
import { Calendar, Clock, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { mockAttendance } from '../data/mockData';
import { AttendanceLog } from '../types';

export function AttendanceManagement() {
  const [attendance] = useState<AttendanceLog[]>(mockAttendance);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredAttendance = attendance.filter(a => a.date === selectedDate);
  
  const presentCount = filteredAttendance.filter(a => a.status === 'present').length;
  const lateCount = filteredAttendance.filter(a => a.status === 'late').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[#001F3F]">Attendance & Curfew Management</h2>
        <p className="text-gray-600 text-sm mt-1">Track student check-in and check-out logs</p>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <label className="text-sm text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#001F3F]">
          <p className="text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-2xl text-[#001F3F]">{filteredAttendance.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Present</p>
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl text-green-700">{presentCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Late</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl text-orange-700">{lateCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Absent</p>
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl text-red-700">{absentCount}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-[#001F3F]">
            Attendance Log - {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#001F3F] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm">Student Name</th>
                <th className="px-6 py-3 text-left text-sm">Room Number</th>
                <th className="px-6 py-3 text-left text-sm">Check-In Time</th>
                <th className="px-6 py-3 text-left text-sm">Check-Out Time</th>
                <th className="px-6 py-3 text-left text-sm">Status</th>
                <th className="px-6 py-3 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAttendance.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#001F3F] text-white rounded-full flex items-center justify-center text-sm">
                        {log.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{log.studentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 px-3 py-1 rounded text-sm">{log.roomNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.checkIn ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {new Date(log.checkIn).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.checkOut ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {new Date(log.checkOut).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs ${
                      log.status === 'present'
                        ? 'bg-green-100 text-green-700'
                        : log.status === 'late'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status === 'present' ? (
                        <UserCheck className="w-3 h-3" />
                      ) : log.status === 'late' ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <UserX className="w-3 h-3" />
                      )}
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Curfew Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-4">
          <div className="bg-[#FFD700] text-[#001F3F] p-3 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[#001F3F] mb-2">Curfew Policy</h3>
            <p className="text-gray-600 text-sm">
              All students must check in by 10:00 PM on weekdays and 11:00 PM on weekends. 
              Late arrivals after curfew will be marked as "Late" and may be subject to disciplinary action.
            </p>
            <div className="mt-4 flex gap-4">
              <button className="bg-[#001F3F] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition-colors text-sm">
                Record Check-In
              </button>
              <button className="bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] transition-colors text-sm">
                Record Check-Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
