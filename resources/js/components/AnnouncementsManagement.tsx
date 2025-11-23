import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Megaphone, Trash2, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

export function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'normal' });

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    const res = await axios.get('/api/announcements');
    setAnnouncements(res.data);
  };

  const openModal = (ann: any = null) => {
    if (ann) {
      setEditingId(ann.id);
      setFormData({ title: ann.title, content: ann.content, priority: ann.priority });
    } else {
      setEditingId(null);
      setFormData({ title: '', content: '', priority: 'normal' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`/api/announcements/${editingId}`, formData);
        Swal.fire('Updated', 'Announcement updated', 'success');
      } else {
        await axios.post('/api/announcements', formData);
        Swal.fire('Posted', 'Announcement created', 'success');
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (e) {
      Swal.fire('Error', 'Failed to save announcement', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if ((await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true })).isConfirmed) {
      await axios.delete(`/api/announcements/${id}`);
      fetchAnnouncements();
      Swal.fire('Deleted', '', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-[#001F3F] text-2xl font-bold">Announcements</h2>
        <Button onClick={() => openModal()} className="bg-[#FFD700] text-[#001F3F]"><Plus className="mr-2 h-4 w-4"/>Create</Button>
      </div>

      <div className="grid gap-4">
        {announcements.map((a: any) => (
          <div key={a.id} className={`bg-white p-4 rounded shadow border-l-4 ${a.priority === 'urgent' ? 'border-red-500' : 'border-blue-500'}`}>
            <div className="flex justify-between">
              <h3 className="font-bold text-lg">{a.title}</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => openModal(a)}><Edit className="w-4 h-4"/></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
            </div>
            <p className="mt-2 text-gray-600">{a.content}</p>
            <div className="mt-2 text-xs text-gray-400">Posted by: {a.creator?.name} on {new Date(a.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Create'} Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <Input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
             <select className="w-full border rounded p-2" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
               <option value="normal">Normal</option>
               <option value="important">Important</option>
               <option value="urgent">Urgent</option>
             </select>
             <Textarea placeholder="Content" rows={5} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
          </div>
          <DialogFooter><Button onClick={handleSubmit}>Post Announcement</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}