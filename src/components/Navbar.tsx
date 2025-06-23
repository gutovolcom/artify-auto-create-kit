import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { Palette } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Layout Generator
            </Link>
            
            {user && (
              <div className="hidden md:flex space-x-6">
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Main App
                </Link>
                <Link 
                  to="/advanced-editor" 
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  <Palette className="w-4 h-4" />
                  Advanced Editor
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
