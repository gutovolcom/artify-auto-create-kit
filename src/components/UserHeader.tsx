
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';

interface User {
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface UserHeaderProps {
  user: User;
  isAdmin: boolean;
  userType: 'user' | 'admin';
  setUserType: (type: 'user' | 'admin') => void;
  onLogout: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  user,
  isAdmin,
  userType,
  setUserType,
  onLogout
}) => {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-600">
              Bem-vindo, {user.user_metadata?.full_name || user.email}
            </p>
          </div>
          {isAdmin && (
            <Button
              variant={userType === 'admin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserType(userType === 'admin' ? 'user' : 'admin')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {userType === 'admin' ? 'Modo Usuário' : 'Modo Admin'}
            </Button>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};
