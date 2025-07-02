import { UserDropdown } from "@/components/UserDropdown";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { FC, useEffect, useState } from "react";

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
  const [isDark, setIsDark] = useState(false);

  // Initialize dark mode from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'true' || (savedTheme === null && prefersDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.setItem('darkMode', newIsDark.toString());
  };

  return (
    <header className="w-full h-16 bg-background border-b flex items-center justify-between px-6">
      <div className="flex items-center"/>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleDarkMode}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
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
