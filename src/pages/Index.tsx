
import { AuthGuard } from "@/components/AuthGuard";
import { UserInterface } from "@/components/UserInterface";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface EventData {
  subtitle: string;
  date: string;
  time: string;
  kvImageId: string | null;
  teacherImages: string[];
  teacherNames?: string[];
  platforms: string[];
  classTheme?: string;
  boxColor?: string;
  boxFontColor?: string;
  fontColor?: string;
  textColor?: string;
  backgroundColorType?: string;
  selectedTeacherIds?: string[];
  teacherName?: string;
  professorPhotos?: string;
  lessonThemeBoxStyle?: string;
}

const Index = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
  };

  // Remove the manual user check - let AuthGuard handle authentication
  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  return (
    <AuthGuard>
      <UserInterface
        userEmail={user?.email || ""}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
    </AuthGuard>
  );
};

export default Index;
