
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, HelpCircle, Shield, LogOut, ChevronDown } from "lucide-react";

interface UserDropdownProps {
  userEmail: string;
  isAdmin: boolean;
  onAdminPanel: () => void;
  onSettings: () => void;
  onSupport: () => void;
  onLogout: () => void;
}

export const UserDropdown = ({
  userEmail,
  isAdmin,
  onAdminPanel,
  onSettings,
  onSupport,
  onLogout,
}: UserDropdownProps) => {
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-10">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {getInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline">
            {userEmail.split('@')[0]}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-medium">{userEmail.split('@')[0]}</p>
          <p className="text-xs text-gray-500">{userEmail}</p>
        </div>
        
        <DropdownMenuItem onClick={onSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onSupport} className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Suporte</span>
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onAdminPanel} className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Painel Admin</span>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
