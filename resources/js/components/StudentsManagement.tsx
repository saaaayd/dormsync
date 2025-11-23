import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Student {
  id: number;
  name: string;
  email: string;
  student_profile?: {
    room_number: string;
    phone_number: string;
    status: string;
  };
}

export function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', room_number: '', phone_number: '',
    emergency_contact_name: '', emergency_contact_phone: ''
  });

  // Fetch Students
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (e) { console.error(e); }
  };

  // Create Student
  const handleSubmit = async () => {
    try {
      await axios.post('/api/students', formData);
      setIsModalOpen(false);
      fetchStudents(); // Refresh list
      alert("Student added successfully!");
    } catch (e) {
      alert("Error adding student.");
    }
  };

  // Delete Student
  const handleDelete = async (id: number) => {
    if(!confirm("Delete this student?")) return;
    await axios.delete(`/api/students/${id}`);
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#001F3F] text-2xl font-bold">Students Management</h2>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#FFD700] text-[#001F3F] hover:bg-[#FFC700]">
          <Plus className="w-5 h-5 mr-2" /> Add Student
        </Button>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#001F3F] text-white">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Room</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 px-2 py-1 rounded">{student.student_profile?.room_number || 'N/A'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-green-600 flex items-center gap-1">
                    <UserCheck className="w-4 h-4" /> Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Room Number</Label>
                <Input onChange={(e) => setFormData({...formData, room_number: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} className="bg-[#001F3F] text-white">Save Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}