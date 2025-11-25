import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, StudentProfile } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapApiUser(apiUser: any): User {
  let studentProfile: StudentProfile | undefined;

  if (apiUser.student_profile) {
    const sp = apiUser.student_profile;
    studentProfile = {
      id: sp.id,
      userId: sp.user_id,
      roomNumber: sp.room_number,
      phoneNumber: sp.phone_number,
      emergencyContactName: sp.emergency_contact_name,
      emergencyContactPhone: sp.emergency_contact_phone,
      enrollmentDate: sp.enrollment_date,
      status: sp.status,
    };
  }

  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    studentProfile,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('dormsync_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const mapped = mapApiUser(res.data);
      setUser(mapped);
      localStorage.setItem('dormsync_user', JSON.stringify(mapped));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dormsync_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
