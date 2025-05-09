import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import { useActivity } from '@/context/ActivityContext';
import { 
  Users, Settings, LogOut, BarChart, 
  Activity, RefreshCw, Menu, X
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const AppLayout = () => {
  const { currentUser, logout } = useAuth();
  const { currentTeam } = useTeam();
  const { generateMockData, loading } = useActivity();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser?.name) return '?';
    
    return currentUser.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Close sidebar when clicking outside on mobile
  const handleContentClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Navigation links
  const navLinks = [
    { 
      to: '/',
      icon: <BarChart className="h-5 w-5" />,
      label: 'Dashboard',
    },
    { 
      to: '/team',
      icon: <Users className="h-5 w-5" />,
      label: 'Team',
    },
    { 
      to: '/settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out lg:inset-auto w-64 bg-white border-r shadow-sm z-40`}
      >
        <div className="flex flex-col h-full">
          {/* App logo */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-pulse-500 rounded-md flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">PulseCheck</span>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-pulse-100 flex items-center justify-center text-pulse-800 font-semibold">
                {getUserInitials()}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{currentUser?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {currentTeam ? currentTeam.name : 'No team'}
                </span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.to}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            {currentTeam && (
              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 justify-center"
                  disabled={loading}
                  onClick={() => generateMockData()}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Generate Data</span>
                </Button>
              </div>
            )}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t mt-auto">
            <button
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 w-full" onClick={handleContentClick}>
        <div className="w-full p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
