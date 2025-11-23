import React, { useState } from 'react';
import { Search, Plus, Edit, Eye, UserCheck, UserX } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  roomNumber: string;
  phoneNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
}

const mockStudentsData: Student[] = [
  {
    id: 1,
    name: 'John Doe',
    roomNumber: '101',
    phoneNumber: '+1-555-0123',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '+1-555-0124',
    enrollmentDate: '2024-01-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Emily Smith',
    roomNumber: '102',
    phoneNumber: '+1-555-0125',
    emergencyContactName: 'Michael Smith',
    emergencyContactPhone: '+1-555-0126',
    enrollmentDate: '2024-02-01',
    status: 'active',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    roomNumber: '103',
    phoneNumber: '+1-555-0127',
    emergencyContactName: 'Sarah Johnson',
    emergencyContactPhone: '+1-555-0128',
    enrollmentDate: '2024-01-20',
    status: 'active',
  },
];

export function StudentsManagement() {
  const [students] = useState<Student[]>(mockStudentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roomNumber.includes(searchTerm)
  );

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-[#001F3F]">Students Management</h2>
          <p className="text-gray-600 text-sm mt-1">Manage student profiles and information</p>
        </div>
        <button className="flex items-center gap-2 bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] transition-colors">
          <Plus className="w-5 h-5" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or room number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#001F3F] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm">Student Name</th>
                <th className="px-6 py-3 text-left text-sm">Room Number</th>
                <th className="px-6 py-3 text-left text-sm">Phone Number</th>
                <th className="px-6 py-3 text-left text-sm">Enrollment Date</th>
                <th className="px-6 py-3 text-left text-sm">Status</th>
                <th className="px-6 py-3 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#001F3F] text-white rounded-full flex items-center justify-center">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 px-3 py-1 rounded text-sm">{student.roomNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.phoneNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(student.enrollmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      student.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {student.status === 'active' ? (
                        <UserCheck className="w-3 h-3" />
                      ) : (
                        <UserX className="w-3 h-3" />
                      )}
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-[#001F3F] hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#001F3F] text-white px-6 py-4 flex items-center justify-between">
              <h3>Student Profile</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-[#FFD700] transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#001F3F] text-white rounded-full flex items-center justify-center text-2xl">
                  {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-[#001F3F]">{selectedStudent.name}</h4>
                  <p className="text-gray-600 text-sm">Room {selectedStudent.roomNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="text-[#001F3F]">{selectedStudent.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Enrollment Date</p>
                  <p className="text-[#001F3F]">
                    {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Emergency Contact</p>
                  <p className="text-[#001F3F]">{selectedStudent.emergencyContactName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Emergency Phone</p>
                  <p className="text-[#001F3F]">{selectedStudent.emergencyContactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm ${
                    selectedStudent.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedStudent.status === 'active' ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <UserX className="w-4 h-4" />
                    )}
                    {selectedStudent.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 bg-[#001F3F] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition-colors">
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
