import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Wrench, 
  Clock, 
  Calendar, 
  Megaphone,
  LogOut,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'cleaning', label: 'Cleaning', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'payments', label: 'My Payments', icon: DollarSign },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FIXED Sidebar - Desktop */}
      {/* ADDED: fixed, top-0, left-0, h-screen, z-50 */}
      <aside className="hidden md:flex md:flex-col w-64 bg-[#001F3F] text-white fixed top-0 left-0 h-screen z-50">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-[#FFD700] text-2xl font-bold">DormSync</h1>
          <p className="text-sm text-white/70 mt-1">Management System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#FFD700] text-[#001F3F] font-bold' 
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm text-white/90 font-medium">{user?.name}</p>
            <p className="text-xs text-white/60 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      {/* ADDED: ml-64 to push content to the right */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-600 hover:text-[#001F3F]"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-[#001F3F] capitalize font-bold text-xl">
                {currentPage.replace('-', ' ')}
              </h2>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {new Date().toLocaleDateString('en-PH', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar (Keep your existing code for mobile, just ensure z-index is high) */}
      {sidebarOpen && (
         // ... keep your existing mobile sidebar code ...
         <div className="fixed inset-0 z-[60] md:hidden"> 
            {/* ... content ... */}
         </div>
      )}
    </div>
  );
}
