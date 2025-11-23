export type UserRole = 'admin' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  studentProfile?: StudentProfile;
}

export interface StudentProfile {
  id: number;
  userId: number;
  roomNumber: string;
  phoneNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
}

export interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  amount: number;
  type: 'rent' | 'utilities' | 'maintenance' | 'deposit';
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  notes?: string;
}

export interface MaintenanceRequest {
  id: number;
  studentId: number;
  studentName: string;
  roomNumber: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  priority: 'normal' | 'important' | 'urgent';
}

export interface AttendanceLog {
  id: number;
  studentId: number;
  studentName: string;
  roomNumber: string;
  checkIn?: string;
  checkOut?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface CleaningSchedule {
  id: number;
  area: string;
  assignedTo: string;
  scheduledDate: string;
  status: 'pending' | 'completed';
  notes?: string;
}

export interface DashboardStats {
  totalStudents: number;
  pendingMaintenance: number;
  pendingCleaning: number;
  overduePayments: number;
}
