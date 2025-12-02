import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Hash, Phone, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';

interface Student {
  id: number;
  student_id?: string;
  first_name?: string;
  last_name?: string;
  middle_initial?: string;
  name: string;
  email: string;
  student_profile?: {
    room_id?: number;
    room_number: string;
    phone_number: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    enrollment_date: string;
    status: 'active' | 'inactive';
  };
}

interface Room {
  id: number;
  code: string;
  capacity: number;
  students_count: number;
}

export function StudentsManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const initialForm = {
    student_id: '',
    first_name: '',
    last_name: '',
    middle_initial: '',
    email: '',
    room_id: 0,
    phone_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    status: 'active' as 'active' | 'inactive',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    // Only fetch if admin, otherwise the backend might throw 403
    if (isAdmin) {
      fetchStudents();
      fetchRooms();
    }
  }, [isAdmin]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const openModal = (student: Student | null = null) => {
    if (student) {
      setEditingId(student.id);
      setFormData({
        student_id: student.student_id || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        middle_initial: student.middle_initial || '',
        email: student.email,
        // Safely access nested profile data, fallback to 0 if missing
        room_id: student.student_profile?.room_id || 0,
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
    if (!formData.first_name || !formData.last_name || !formData.student_id || !formData.room_id) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please fill in Student ID, First Name, Last Name, and Room.',
            confirmButtonColor: '#001F3F'
        });
        return;
    }

    setLoading(true);
    try {
      const payload = {
        student_id: formData.student_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_initial: formData.middle_initial || undefined,
        email: formData.email,
        room_id: formData.room_id,
        phone_number: formData.phone_number || undefined,
        emergency_contact_name: formData.emergency_contact_name || undefined,
        emergency_contact_phone: formData.emergency_contact_phone || undefined,
        status: formData.status,
      };

      if (editingId) {
        await axios.put(`/api/students/${editingId}`, payload);
        Swal.fire({
            icon: 'success', 
            title: 'Updated', 
            text: 'Student record updated successfully.',
            timer: 2000,
            showConfirmButton: false
        });
      } else {
        await axios.post('/api/students', payload);
        Swal.fire({
            icon: 'success', 
            title: 'Created', 
            text: 'New student registered successfully.',
            timer: 2000,
            showConfirmButton: false
        });
      }
      
      setIsModalOpen(false);
      fetchStudents();
      fetchRooms(); // Refresh rooms to update capacity counts
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
      text: "This will remove the student account permanently.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/students/${id}`);
        Swal.fire({
            title: 'Deleted!', 
            text: 'Student has been removed.', 
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
        fetchStudents();
        fetchRooms();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete student.', 'error');
      }
    }
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_profile?.room_number?.includes(searchTerm) ||
    s.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-bold text-gray-700">Access Denied</h3>
        <p className="text-gray-500">Only administrators can manage student records.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#001F3F] text-2xl font-bold">Students Management</h2>
        <Button onClick={() => openModal()} className="bg-[#FFD700] text-[#001F3F] hover:bg-[#e6c200] font-semibold">
          <Plus className="w-5 h-5 mr-2" /> Add Student
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by name, ID, or room..." 
            className="pl-10 border-gray-200" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#001F3F] text-white uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Student Info</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Room</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Contact</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
              <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
                filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{student.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {student.student_id && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            <Hash className="w-3 h-3" /> {student.student_id}
                            </span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {student.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {student.student_profile?.room_number || 'No Room'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                        {student.student_profile?.phone_number ? (
                            <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3" /> {student.student_profile.phone_number}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400 italic">Not set</span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        student.student_profile?.status === 'active' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {student.student_profile?.status === 'active' ? <UserCheck className="w-3 h-3"/> : <UserX className="w-3 h-3"/>}
                        {student.student_profile?.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openModal(student)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 opacity-20" />
                            <p>No students found matching your search.</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white z-[100] border-2 border-gray-200 shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-[#001F3F] text-xl font-bold flex items-center gap-2">
                {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? 'Edit Student Details' : 'Register New Student'}
            </DialogTitle>
          </DialogHeader>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            
            {/* Personal Information Section */}
            <div className="col-span-1 md:col-span-2">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3 border-b pb-1">Personal Information</h4>
            </div>

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
            <div className="col-span-1 md:col-span-2">
                <Label>Last Name <span className="text-red-500">*</span></Label>
                <Input 
                    value={formData.last_name} 
                    onChange={e => setFormData({...formData, last_name: e.target.value})} 
                    placeholder="e.g. Dela Cruz" 
                />
            </div>

            <div className="col-span-1 md:col-span-2">
                <Label>Email Address <span className="text-red-500">*</span></Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="student@school.edu" />
            </div>

            {/* Academic & Dorm Section */}
            <div className="col-span-1 md:col-span-2 mt-2">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3 border-b pb-1">Dormitory Details</h4>
            </div>

            <div>
                <Label>Student ID <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.student_id}
                  onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                  placeholder="e.g. 2025-001"
                />
            </div>
            <div>
                <Label>Assigned Room <span className="text-red-500">*</span></Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001F3F]"
                  value={formData.room_id}
                  onChange={e => setFormData({ ...formData, room_id: Number(e.target.value) })}
                >
                  <option value={0}>Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.code} ({room.students_count}/{room.capacity} occupants)
                    </option>
                  ))}
                </select>
            </div>
            
            {editingId && (
                <div className="col-span-1 md:col-span-2">
                    <Label>Account Status</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001F3F]"
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            )}
            
            {/* Contact Section */}
             <div className="col-span-1 md:col-span-2 mt-2">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-3 border-b pb-1">Emergency Contact</h4>
            </div>
            
            <div>
                <Label>Contact Name</Label>
                <Input value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} placeholder="Parent/Guardian Name" />
            </div>
            <div>
                <Label>Contact Phone</Label>
                <Input value={formData.emergency_contact_phone} onChange={e => setFormData({...formData, emergency_contact_phone: e.target.value})} placeholder="0912 345 6789" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-[#001F3F] text-white hover:bg-[#003366]" disabled={loading}>
                {loading ? 'Saving Record...' : (editingId ? 'Update Student' : 'Register Student')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}