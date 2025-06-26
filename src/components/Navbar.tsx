
import { UserDropdown } from "@/components/UserDropdown";
import { toast } from "sonner";

interface NavbarProps {
  userEmail: string;
  isAdmin: boolean;
  onAdminPanel: () => void;
  onLogout: () => void;
}

export const Navbar = ({ userEmail, isAdmin, onAdminPanel, onLogout }: NavbarProps) => {
  const handleSettings = () => {
    toast.info("Configurações em desenvolvimento");
  };

  const handleSupport = () => {
    toast.info("Entre em contato através do email: suporte@exemplo.com");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <img
          src="/logo-nova.svg"
          alt="Logo"
          className="h-8 w-auto"
        />
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-gray-900">
            Gerador de Artes
          </h1>
        </div>
      </div>

      <UserDropdown
        userEmail={userEmail}
        isAdmin={isAdmin}
        onAdminPanel={onAdminPanel}
        onSettings={handleSettings}
        onSupport={handleSupport}
        onLogout={onLogout}
      />
    </header>
  );
};
