
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
  const { user } = useAuth();

  const handleLogout = async () => {
    const { signOut } = await import("@/hooks/useAuth");
    await signOut();
    toast.success("Logout realizado com sucesso!");
  };

  // Check if user is admin
  const isAdmin = user?.email === "henriquetocheto@gmail.com";

  return (
    <AuthGuard>
      <UserInterface
        userEmail={user!.email}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
    </AuthGuard>
  );
};

export default Index;
