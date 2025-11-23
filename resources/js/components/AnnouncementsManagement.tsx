import React, { useState } from 'react';
import { Plus, Megaphone, AlertCircle, Info, AlertTriangle, Calendar, User } from 'lucide-react';
import { mockAnnouncements } from '../data/mockData';
import { Announcement } from '../types';
import { useAuth } from '../context/AuthContext';

export function AnnouncementsManagement() {
  const { user } = useAuth();
  const [announcements] = useState<Announcement[]>(mockAnnouncements);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isAdmin = user?.role === 'admin';

  const filteredAnnouncements = filterPriority === 'all' 
    ? announcements 
    : announcements.filter(a => a.priority === filterPriority);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return AlertTriangle;
      case 'important': return AlertCircle;
      case 'normal': return Info;
      default: return Info;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'important': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-[#001F3F]">Announcements</h2>
          <p className="text-gray-600 text-sm mt-1">
            {isAdmin ? 'Create and manage dormitory announcements' : 'View important announcements'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Announcement</span>
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-gray-700">Filter by priority:</span>
          <div className="flex gap-2">
            {['all', 'urgent', 'important', 'normal'].map((priority) => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors capitalize ${
                  filterPriority === priority
                    ? 'bg-[#001F3F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#001F3F]">
          <p className="text-sm text-gray-600 mb-1">Total Announcements</p>
          <p className="text-2xl text-[#001F3F]">{announcements.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Urgent</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl text-red-700">
            {announcements.filter(a => a.priority === 'urgent').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Important</p>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl text-orange-700">
            {announcements.filter(a => a.priority === 'important').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Normal</p>
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl text-blue-700">
            {announcements.filter(a => a.priority === 'normal').length}
          </p>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => {
          const PriorityIcon = getPriorityIcon(announcement.priority);
          return (
            <div
              key={announcement.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
                announcement.priority === 'urgent'
                  ? 'border-red-500'
                  : announcement.priority === 'important'
                  ? 'border-orange-500'
                  : 'border-blue-500'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getPriorityColor(announcement.priority)}`}>
                      <PriorityIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-[#001F3F]">{announcement.title}</h3>
                        <span className={`text-xs px-3 py-1 rounded border ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{announcement.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2 mt-4">
                    <button className="text-sm text-blue-600 hover:text-blue-700">Edit</button>
                    <button className="text-sm text-red-600 hover:text-red-700">Delete</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-[#001F3F] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                <h3>Create New Announcement</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:text-[#FFD700] transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                    placeholder="Enter announcement title"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Priority</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none">
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Content</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                    placeholder="Enter announcement content"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] transition-colors"
                  >
                    Create Announcement
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
