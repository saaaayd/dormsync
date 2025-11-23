import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

export function MaintenanceManagement() {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', urgency: 'low', status: 'pending' });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    const res = await axios.get('/api/maintenance-requests');
    setRequests(res.data);
  };

  const openModal = (req: any = null) => {
    if (req) {
      setEditingId(req.id);
      setFormData({ title: req.title, description: req.description, urgency: req.urgency, status: req.status });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', urgency: 'low', status: 'pending' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`/api/maintenance-requests/${editingId}`, formData);
        setIsModalOpen(false);
        Swal.fire('Updated', 'Request updated', 'success');
      } else {
        await axios.post('/api/maintenance-requests', formData);
        setIsModalOpen(false);
        Swal.fire('Created', 'Request submitted', 'success');
      }
      fetchRequests();
    } catch (e) {
      Swal.fire('Error', 'Failed to save request', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) {
      await axios.delete(`/api/maintenance-requests/${id}`);
      fetchRequests();
      Swal.fire('Deleted', '', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#001F3F] text-2xl font-bold">Maintenance</h2>
        <Button onClick={() => openModal()} className="bg-[#FFD700] text-[#001F3F] hover:bg-[#e6c200]">
            <Plus className="mr-2 h-4 w-4"/> New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((req: any) => (
          <div key={req.id} className={`bg-white p-4 rounded shadow border-l-4 ${req.urgency === 'high' ? 'border-red-500' : 'border-blue-500'}`}>
            <div className="flex justify-between">
                <h3 className="font-bold">{req.title}</h3>
                <div className="flex gap-1">
                   <Button size="sm" variant="ghost" onClick={() => openModal(req)}><Edit className="w-4 h-4 text-blue-500"/></Button>
                   <Button size="sm" variant="ghost" onClick={() => handleDelete(req.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{req.description}</p>
            <div className="mt-2 flex justify-between items-center">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded uppercase">{req.status}</span>
                <span className="text-xs text-gray-400">Room: {req.room_number || 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white z-[100] border-2 border-gray-200 shadow-xl">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Request' : 'New Request'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <div><Label>Title</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
             <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
             <div><Label>Urgency</Label>
               <select className="w-full border rounded p-2" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                 <option value="low">Low</option>
                 <option value="medium">Medium</option>
                 <option value="high">High</option>
               </select>
             </div>
             <div><Label>Status</Label>
               <select className="w-full border rounded p-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                 <option value="pending">Pending</option>
                 <option value="in-progress">In Progress</option>
                 <option value="resolved">Resolved</option>
               </select>
             </div>
          </div>
          <DialogFooter><Button onClick={handleSubmit} className="bg-[#001F3F]">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}