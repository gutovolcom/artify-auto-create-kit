
import { AdminLayout } from "./admin/AdminLayout";

interface AdminPanelProps {
  onLogout: () => void;
  onSwitchToUser?: () => void;
  userEmail: string;
}

export const AdminPanel = ({ onLogout, onSwitchToUser, userEmail }: AdminPanelProps) => {
  return (
    <AdminLayout
      userEmail={userEmail}
      onLogout={onLogout}
      onSwitchToUser={onSwitchToUser}
    />
  );
};
