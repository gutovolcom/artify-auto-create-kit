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
    <header className="w-full bg-white border-b px-6 py-3 flex items-center justify-between">
      <img src="/logo-nova.svg" alt="Logo GRAN" className="h-5 w-auto" />
      <UserDropdown
        userEmail={userEmail}
        isAdmin={isAdmin}
        onAdminPanel={onAdminPanel}
        onSettings={() => {}}
        onSupport={() => {}}
        onLogout={onLogout}
      />
    </header>
  );
};
