import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useAuth } from '../context/AuthContext';

interface AnnouncementDto {
  id: number;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  creator?: { name?: string } | null;
  created_at: string;
}

export function AnnouncementsManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'normal' as const });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements');
      setAnnouncements(res.data);
    } catch (error) {
      console.error('Error fetching announcements', error);
      Swal.fire('Error', 'Failed to load announcements.', 'error');
    }
  };

  const openModal = (ann: AnnouncementDto | null = null) => {
    if (ann) {
      setEditingId(ann.id);
      setFormData({
        title: ann.title,
        content: ann.content,
        priority: ann.priority,
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', content: '', priority: 'normal' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!isAdmin) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      Swal.fire('Missing fields', 'Title and content are required.', 'warning');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/api/announcements/${editingId}`, formData);
        Swal.fire('Updated', 'Announcement updated successfully.', 'success');
      } else {
        await axios.post('/api/announcements', formData);
        Swal.fire('Posted', 'Announcement created successfully.', 'success');
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (e: any) {
      console.error(e);
      Swal.fire(
        'Error',
        e.response?.data?.message || 'Failed to save announcement.',
        'error'
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) return;
    const res = await Swal.fire({
      title: 'Delete announcement?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`/api/announcements/${id}`);
        fetchAnnouncements();
        Swal.fire('Deleted', 'Announcement removed.', 'success');
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Failed to delete announcement.', 'error');
      }
    }
  };

  const priorityColor = (priority: AnnouncementDto['priority']) => {
    if (priority === 'urgent') return 'border-red-500';
    if (priority === 'important') return 'border-orange-500';
    return 'border-blue-500';
  };

  const priorityBadge = (priority: AnnouncementDto['priority']) => {
    if (priority === 'urgent') return 'bg-red-100 text-red-700';
    if (priority === 'important') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#001F3F] text-2xl font-bold">Announcements</h2>
        {isAdmin && (
          <Button
            onClick={() => openModal()}
            className="bg-[#FFD700] text-[#001F3F] hover:bg-[#FFC700]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`bg-white p-4 rounded shadow border-l-4 ${priorityColor(a.priority)}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-[#001F3F]">{a.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded capitalize ${priorityBadge(
                      a.priority
                    )}`}
                  >
                    {a.priority}
                  </span>
                </div>
                <p className="mt-2 text-gray-600 whitespace-pre-line">{a.content}</p>
                <div className="mt-2 text-xs text-gray-400">
                  Posted by: {a.creator?.name || 'System'} on{' '}
                  {new Date(a.created_at).toLocaleDateString()}
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openModal(a)}>
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center text-gray-500 py-12 border border-dashed border-gray-200 rounded-lg">
            No announcements yet.
            {isAdmin && ' Click "Create" to post a new announcement.'}
          </div>
        )}
      </div>

      {isAdmin && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-white z-[100] border-2 border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <select
                className="w-full border rounded p-2 text-sm"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as AnnouncementDto['priority'],
                  })
                }
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
              <Textarea
                placeholder="Content"
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} className="bg-[#001F3F] text-white">
                {editingId ? 'Save Changes' : 'Post Announcement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}