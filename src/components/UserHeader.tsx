
interface UserHeaderProps {
  userEmail: string;
  isAdmin: boolean;
  userType: 'user' | 'admin';
  onToggleUserType: () => void;
  onLogout: () => void;
}

export const UserHeader = ({ 
  userEmail, 
  isAdmin, 
  userType, 
  onToggleUserType, 
  onLogout 
}: UserHeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Bem-vindo, {userEmail}
        </div>
        <div className="flex gap-4">
          {isAdmin && (
            <button
              onClick={onToggleUserType}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {userType === 'admin' ? 'Modo Usuário' : 'Painel Admin'}
            </button>
          )}
          <button
            onClick={onLogout}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};
