import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, AlertCircle, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useAuth } from '../context/AuthContext';

export function MaintenanceManagement() {
  const { user } = useAuth(); // To check if admin
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', urgency: 'low' });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    const res = await axios.get('/api/maintenance-requests');
    setRequests(res.data);
  };

  const handleCreate = async () => {
    await axios.post('/api/maintenance-requests', newRequest);
    setIsModalOpen(false);
    fetchRequests();
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    await axios.put(`/api/maintenance-requests/${id}`, { status: newStatus });
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#001F3F] text-2xl font-bold">Maintenance Requests</h2>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#FFD700] text-[#001F3F]">
          <Plus className="w-5 h-5 mr-2" /> New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((req: any) => (
          <div key={req.id} className={`bg-white p-4 rounded-lg shadow border-l-4 ${
            req.urgency === 'high' ? 'border-red-500' : 'border-blue-500'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-[#001F3F]">{req.title}</h3>
              <span className="text-xs uppercase px-2 py-1 bg-gray-100 rounded">{req.status}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{req.description}</p>
            
            {/* Admin Actions */}
            {user?.role === 'admin' && (
              <div className="flex gap-2 mt-2">
                {req.status === 'pending' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(req.id, 'in-progress')} className="w-full bg-blue-600 text-white">
                    Start
                  </Button>
                )}
                {req.status === 'in-progress' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(req.id, 'resolved')} className="w-full bg-green-600 text-white">
                    Resolve
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit Maintenance Request</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Title" onChange={(e) => setNewRequest({...newRequest, title: e.target.value})} />
            <Textarea placeholder="Description" onChange={(e) => setNewRequest({...newRequest, description: e.target.value})} />
            <select 
              className="w-full p-2 border rounded"
              onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value})}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <Button onClick={handleCreate} className="w-full bg-[#001F3F] text-white">Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}