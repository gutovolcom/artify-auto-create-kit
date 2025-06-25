
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
    <img
        src="/logo-nova.svg"
        alt="Minha Logo"
        className="h-6 w-auto"
    />
    <span className="font-bold text-xl text-blue-800">Gerador de artes</span>
</div>

        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Configurações</span>
        </Button>
      </div>
    </header>
  );
};
