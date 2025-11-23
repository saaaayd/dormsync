import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit, Eye, UserCheck, UserX, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Interface matches your database structure
interface Student {
  id: number;
  name: string;
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
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    room_number: '',
    phone_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  // FETCH Students from API
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // CREATE Student
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validates that required fields are not empty
      if (!formData.name || !formData.email || !formData.room_number) {
        alert("Please fill in Name, Email, and Room Number.");
        setLoading(false);
        return;
      }

      await axios.post('/api/students', formData);
      
      setIsModalOpen(false);
      fetchStudents(); // Refresh list
      setFormData({ // Reset form
        name: '', email: '', room_number: '', phone_number: '',
        emergency_contact_name: '', emergency_contact_phone: ''
      });
      alert("Student added successfully!");
    } catch (error) {
      console.error("Error creating student:", error);
      alert("Failed to add student. Check if email is unique.");
    } finally {
      setLoading(false);
    }
  };

  // DELETE Student
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;
    
    try {
      await axios.delete(`/api/students/${id}`);
      fetchStudents(); // Refresh list
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student.");
    }
  };

  // Filter logic
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_profile?.room_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-[#001F3F] text-2xl font-bold">Students Management</h2>
          <p className="text-gray-600 text-sm mt-1">Manage student profiles and enrollment</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-[#FFD700] text-[#001F3F] hover:bg-[#e6c200] font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Student
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or room number..."
            className="pl-10 border-gray-200 focus:ring-[#001F3F]"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#001F3F] text-white uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold">Student Name</th>
              <th className="px-6 py-4 font-semibold">Room</th>
              <th className="px-6 py-4 font-semibold">Contact</th>
              <th className="px-6 py-4 font-semibold">Enrollment Date</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#001F3F]/10 text-[#001F3F] rounded-full flex items-center justify-center font-bold text-lg">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                      {student.student_profile?.room_number || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {student.student_profile?.phone_number || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {student.student_profile?.enrollment_date 
                      ? new Date(student.student_profile.enrollment_date).toLocaleDateString() 
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.student_profile?.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.student_profile?.status === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {student.student_profile?.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No students found. Click "Add Student" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#001F3F] text-xl">Register New Student</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider border-b pb-1">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-[#001F3F]">Full Name</Label>
                  <Input 
                    placeholder="e.g. Juan Dela Cruz" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <Label className="text-[#001F3F]">Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="student@university.edu" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div>
                  <Label className="text-[#001F3F]">Room Number</Label>
                  <Input 
                    placeholder="e.g. 101-A" 
                    value={formData.room_number}
                    onChange={(e) => setFormData({...formData, room_number: e.target.value})} 
                  />
                </div>
                <div>
                  <Label className="text-[#001F3F]">Phone Number</Label>
                  <Input 
                    placeholder="0912 345 6789" 
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider border-b pb-1">Emergency Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#001F3F]">Contact Name</Label>
                  <Input 
                    placeholder="Parent/Guardian Name" 
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})} 
                  />
                </div>
                <div>
                  <Label className="text-[#001F3F]">Contact Phone</Label>
                  <Input 
                    placeholder="0912 345 6789" 
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})} 
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-[#001F3F] text-white hover:bg-[#003366]"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Student Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}