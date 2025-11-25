import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Student {
  id: number;
  first_name?: string;
  last_name?: string;
  middle_initial?: string;
  name: string; // fallback full name
  email: string;
  student_profile?: {
    room_number: string;
    phone_number: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    enrollment_date: string;
    status: 'active' | 'inactive';
  };
}

export function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Updated initial form state
  const initialForm = {
    first_name: '', 
    last_name: '', 
    middle_initial: '',
    email: '', 
    room_number: '', 
    phone_number: '',
    emergency_contact_name: '', 
    emergency_contact_phone: '', 
    status: 'active'
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { 
    fetchStudents(); 
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (err) { 
      console.error("Error fetching students:", err); 
    }
  };

  const openModal = (student: Student | null = null) => {
    if (student) {
      setEditingId(student.id);
      setFormData({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        middle_initial: student.middle_initial || '',
        email: student.email,
        room_number: student.student_profile?.room_number || '',
        phone_number: student.student_profile?.phone_number || '',
        emergency_contact_name: student.student_profile?.emergency_contact_name || '',
        emergency_contact_phone: student.student_profile?.emergency_contact_phone || '',
        status: student.student_profile?.status || 'active' as any
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.room_number) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please fill in First Name, Last Name, and Room Number.',
            confirmButtonColor: '#001F3F'
        });
        return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/students/${editingId}`, formData);
        setIsModalOpen(false); // Close first
        setTimeout(() => {
            Swal.fire({
                icon: 'success', 
                title: 'Updated!', 
                text: 'Student record updated successfully.',
                confirmButtonColor: '#001F3F'
            });
        }, 100);
      } else {
        await axios.post('/api/students', formData);
        setIsModalOpen(false); // Close first
        setTimeout(() => {
            Swal.fire({
                icon: 'success', 
                title: 'Created!', 
                text: 'New student registered successfully.',
                confirmButtonColor: '#001F3F'
            });
        }, 100);
      }
      
      fetchStudents();
      setFormData(initialForm);
      setEditingId(null);
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error', 
        title: 'Error', 
        text: error.response?.data?.message || 'Failed to save student record.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/students/${id}`);
        Swal.fire({
            title: 'Deleted!', 
            text: 'Student has been removed.', 
            icon: 'success',
            confirmButtonColor: '#001F3F'
        });
        fetchStudents();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete student.', 'error');
      }
    }
  };

  const filtered = students.filter((s) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student_profile?.room_number?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#001F3F] text-2xl font-bold">Students Management</h2>
        <Button onClick={() => openModal()} className="bg-[#FFD700] text-[#001F3F] hover:bg-[#e6c200] font-semibold">
          <Plus className="w-5 h-5 mr-2" /> Add Student
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by name or room number..." 
            className="pl-10" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#001F3F] text-white uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Room</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
                filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">{student.student_profile?.room_number || 'N/A'}</td>
                    <td className="px-6 py-4">{student.student_profile?.phone_number || '-'}</td>
                    <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.student_profile?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {student.student_profile?.status === 'active' ? <UserCheck className="w-3 h-3"/> : <UserX className="w-3 h-3"/>}
                        {student.student_profile?.status || 'Unknown'}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openModal(student)} className="hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(student.id)} className="hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No students found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white z-[100] border-2 border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#001F3F] text-xl">
                {editingId ? 'Edit Student Details' : 'Register New Student'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* SPLIT NAME FIELDS */}
            <div>
                <Label>First Name <span className="text-red-500">*</span></Label>
                <Input 
                    value={formData.first_name} 
                    onChange={e => setFormData({...formData, first_name: e.target.value})} 
                    placeholder="e.g. Juan" 
                />
            </div>
            <div>
                <Label>Middle Initial</Label>
                <Input 
                    value={formData.middle_initial} 
                    onChange={e => setFormData({...formData, middle_initial: e.target.value})} 
                    placeholder="e.g. D" 
                    maxLength={2}
                />
            </div>
            <div className="col-span-2">
                <Label>Last Name <span className="text-red-500">*</span></Label>
                <Input 
                    value={formData.last_name} 
                    onChange={e => setFormData({...formData, last_name: e.target.value})} 
                    placeholder="e.g. Dela Cruz" 
                />
            </div>

            {/* OTHER FIELDS */}
            <div className="col-span-2">
                <Label>Email Address</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="student@school.edu" />
            </div>
            <div>
                <Label>Room Number <span className="text-red-500">*</span></Label>
                <Input value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} placeholder="e.g. 101-A" />
            </div>
            <div>
                <Label>Phone Number</Label>
                <Input value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} placeholder="0912 345 6789" />
            </div>
            <div className="col-span-2">
                <Label>Status</Label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            
            <div className="col-span-2 border-t pt-4 mt-2">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">Emergency Contact</h4>
            </div>
            
            <div>
                <Label>Contact Name</Label>
                <Input value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} placeholder="Parent/Guardian" />
            </div>
            <div>
                <Label>Contact Phone</Label>
                <Input value={formData.emergency_contact_phone} onChange={e => setFormData({...formData, emergency_contact_phone: e.target.value})} placeholder="0912 345 6789" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-[#001F3F] text-white hover:bg-[#003366]" disabled={loading}>
                {loading ? 'Saving...' : 'Save Student Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}