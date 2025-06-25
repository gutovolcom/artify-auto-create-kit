import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface NavbarProps {
  user: {
    name?: string;
    email: string;
    photoURL?: string;
  };
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center space-x-2">
          <img
            src="/logo-nova.svg"
            alt="Logo"
            className="h-6 w-auto"
          />
        </div>

        {/* PERFIL */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              {user.name || user.email.split("@")[0]}
            </div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover border"
          />
          <Button onClick={onLogout} variant="ghost" size="sm" className="text-sm">
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};
