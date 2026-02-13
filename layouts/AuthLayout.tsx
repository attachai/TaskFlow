import React, { ReactNode } from 'react';
import { CheckSquare } from 'lucide-react';

const AuthLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg mb-4">
            <CheckSquare className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">TaskFlow</h1>
          <p className="text-slate-500 mt-1">Organize your life, one task at a time.</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;