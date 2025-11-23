import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Search, Plus, Edit, Trash2, Eye, UserCheck, UserX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const initialForm = {
    name: '', email: '', room_number: '', phone_number: '',
    emergency_contact_name: '', emergency_contact_phone: '', status: 'active'
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (err) { console.error(err); }
  };

  const openModal = (student: any = null) => {
    if (student) {
      setEditingId(student.id);
      setFormData({
        name: student.name,
        email: student.email,
        room_number: student.student_profile?.room_number || '',
        phone_number: student.student_profile?.phone_number || '',
        emergency_contact_name: student.student_profile?.emergency_contact_name || '',
        emergency_contact_phone: student.student_profile?.emergency_contact_phone || '',
        status: student.student_profile?.status || 'active'
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
        await axios.put(`/api/students/${editingId}`, formData);
        Swal.fire('Updated!', 'Student record updated successfully.', 'success');
      } else {
        await axios.post('/api/students', formData);
        Swal.fire('Created!', 'New student registered.', 'success');
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (error) {
      Swal.fire('Error', 'Failed to save student record.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/students/${id}`);
        Swal.fire('Deleted!', 'Student has been removed.', 'success');
        fetchStudents();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete student.', 'error');
      }
    }
  };

  const filtered = students.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student_profile?.room_number?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#001F3F] text-2xl font-bold">Students</h2>
        <Button onClick={() => openModal()} className="bg-[#FFD700] text-[#001F3F] hover:bg-[#e6c200]">
          <Plus className="w-5 h-5 mr-2" /> Add Student
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search students..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#001F3F] text-white uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Room</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((student: any) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{student.name} <br/> <span className="text-xs text-gray-500">{student.email}</span></td>
                <td className="px-6 py-4">{student.student_profile?.room_number || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${student.student_profile?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {student.student_profile?.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openModal(student)}><Edit className="w-4 h-4 text-blue-600" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(student.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white z-[100] border-2 border-gray-200 shadow-xl">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Student' : 'Add New Student'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2"><Label>Full Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><Label>Email</Label><Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div><Label>Room Number</Label><Input value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} /></div>
            <div><Label>Phone</Label><Input value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} /></div>
            <div><Label>Status</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div><Label>Emergency Contact</Label><Input value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} /></div>
            <div><Label>Emergency Phone</Label><Input value={formData.emergency_contact_phone} onChange={e => setFormData({...formData, emergency_contact_phone: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSubmit} className="bg-[#001F3F]">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}