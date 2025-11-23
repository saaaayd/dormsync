import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle, Clock } from 'lucide-react';
import { mockCleaningSchedule } from '../data/mockData';
import { CleaningSchedule as CleaningScheduleType } from '../types';

export function CleaningSchedule() {
  const [schedules] = useState<CleaningScheduleType[]>(mockCleaningSchedule);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const pendingTasks = schedules.filter(s => s.status === 'pending');
  const completedTasks = schedules.filter(s => s.status === 'completed');
  const todayTasks = schedules.filter(s => 
    new Date(s.scheduledDate).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-[#001F3F]">Cleaning Schedule Management</h2>
          <p className="text-gray-600 text-sm mt-1">Manage and track dormitory cleaning tasks</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'list'
                ? 'bg-[#001F3F] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#001F3F] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#001F3F]">
          <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
          <p className="text-2xl text-[#001F3F]">{schedules.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#FFD700]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Today's Tasks</p>
            <Clock className="w-5 h-5 text-[#FFD700]" />
          </div>
          <p className="text-2xl text-[#001F3F]">{todayTasks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Pending</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl text-orange-700">{pendingTasks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Completed</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl text-green-700">{completedTasks.length}</p>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#001F3F] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">Area</th>
                  <th className="px-6 py-3 text-left text-sm">Assigned To</th>
                  <th className="px-6 py-3 text-left text-sm">Scheduled Date</th>
                  <th className="px-6 py-3 text-left text-sm">Status</th>
                  <th className="px-6 py-3 text-left text-sm">Notes</th>
                  <th className="px-6 py-3 text-left text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{schedule.area}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{schedule.assignedTo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(schedule.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs ${
                        schedule.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {schedule.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {schedule.notes || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {schedule.status === 'pending' && (
                        <button className="text-sm text-green-600 hover:text-green-700">
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grouped by Date */}
          {Array.from(new Set(schedules.map(s => s.scheduledDate))).map(date => {
            const tasksForDate = schedules.filter(s => s.scheduledDate === date);
            return (
              <div key={date} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                  <Calendar className="w-5 h-5 text-[#001F3F]" />
                  <h3 className="text-[#001F3F]">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {tasksForDate.length} {tasksForDate.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasksForDate.map(schedule => (
                    <div
                      key={schedule.id}
                      className={`border-l-4 pl-4 py-3 rounded-r ${
                        schedule.status === 'completed'
                          ? 'border-green-500 bg-green-50'
                          : 'border-orange-500 bg-orange-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-[#001F3F]">{schedule.area}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          schedule.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {schedule.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Assigned to: {schedule.assignedTo}
                      </p>
                      {schedule.notes && (
                        <p className="text-sm text-gray-700">{schedule.notes}</p>
                      )}
                      {schedule.status === 'pending' && (
                        <button className="mt-3 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
