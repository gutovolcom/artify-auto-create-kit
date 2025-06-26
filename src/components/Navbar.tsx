import { UserDropdown } from "@/components/UserDropdown";
import { FC } from "react";

interface NavbarProps {
  userEmail: string;
  isAdmin: boolean;
  onAdminPanel: () => void;
  onLogout: () => void;
}

export const Navbar: FC<NavbarProps> = ({
  userEmail,
  isAdmin,
  onAdminPanel,
  onLogout
}) => {
  return (
    <header className="w-full h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center"/>
      
      <div className="flex items-center space-x-4">
        <UserDropdown
          userEmail={userEmail}
          isAdmin={isAdmin}
          onAdminPanel={onAdminPanel}
          onSettings={() => {}}
          onSupport={() => {}}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
};
