import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Trash2, Edit, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function PaymentsManagement() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const initialForm = { student_id: '', amount: '', type: 'rent', due_date: '', status: 'pending' };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { 
      fetchPayments(); 
      fetchStudents(); 
  }, []);

  const fetchPayments = async () => {
    const res = await axios.get('/api/payments');
    setPayments(res.data);
  };

  const fetchStudents = async () => {
    const res = await axios.get('/api/students');
    setStudents(res.data);
  };

  const openModal = (payment: any = null) => {
    if (payment) {
      setEditingId(payment.id);
      setFormData({
        student_id: payment.student_id,
        amount: payment.amount,
        type: payment.type,
        due_date: payment.due_date,
        status: payment.status
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`/api/payments/${editingId}`, formData);
        setIsModalOpen(false); // Close first!
        Swal.fire('Success', 'Payment record updated.', 'success');
      } else {
        await axios.post('/api/payments', formData);
        setIsModalOpen(false); // Close first!
        Swal.fire('Success', 'Payment recorded.', 'success');
      }
      fetchPayments();
    } catch (e) {
      Swal.fire('Error', 'Operation failed.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await Swal.fire({ title: 'Delete?', text: 'Confirm deletion?', icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) {
      await axios.delete(`/api/payments/${id}`);
      fetchPayments();
      Swal.fire('Deleted', '', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#001F3F] text-2xl font-bold">Payments</h2>
        <Button onClick={() => openModal()} className="bg-[#FFD700] text-[#001F3F] hover:bg-[#e6c200]">
            <Plus className="mr-2 h-4 w-4"/> Record Payment
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#001F3F] text-white">
            <tr>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.map((p: any) => (
              <tr key={p.id}>
                <td className="px-6 py-4">{p.student?.name || 'Unknown'}</td>
                <td className="px-6 py-4">₱{Number(p.amount).toLocaleString()}</td>
                <td className="px-6 py-4 capitalize">{p.type}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openModal(p)}><Edit className="w-4 h-4 text-blue-600"/></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white z-[100] border-2 border-gray-200 shadow-xl">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Payment' : 'New Payment'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Student</Label>
              <select className="w-full border rounded p-2" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})}>
                <option value="">Select Student</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div><Label>Amount</Label><Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} /></div>
            <div><Label>Type</Label>
               <select className="w-full border rounded p-2" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                 <option value="rent">Rent</option>
                 <option value="utility">Utility</option>
                 <option value="other">Other</option>
               </select>
            </div>
            <div><Label>Due Date</Label><Input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} /></div>
            <div><Label>Status</Label>
               <select className="w-full border rounded p-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                 <option value="pending">Pending</option>
                 <option value="paid">Paid</option>
                 <option value="overdue">Overdue</option>
               </select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSubmit} className="bg-[#001F3F]">Save Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}