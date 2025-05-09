
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import Dashboard from './Dashboard';

const Index = () => {
  const { currentUser } = useAuth();
  
  // If user is not logged in, show auth form with improved spacing
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    );
  }
  
  // If user is logged in, show dashboard
  return <Dashboard />;
};

export default Index;
