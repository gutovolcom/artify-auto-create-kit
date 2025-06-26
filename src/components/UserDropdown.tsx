
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

  const getDisplayName = (email: string) => {
    return email.split('@')[0];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between h-auto p-3 bg-white hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                {getInitials(userEmail)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{getDisplayName(userEmail)}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span className="text-xs">sair</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-white">
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
