
import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { UserHeader } from "@/components/UserHeader";
import { EventDataTabs } from "@/components/EventDataTabs";

export interface EventData {
  title: string;
  subtitle: string;
  date: string;
  time: string;
  kvImageId: string | null;
  teacherImages: string[];
  platforms: string[];
  classTheme?: string;
  boxColor?: string;
  boxFontColor?: string;
  fontColor?: string;
  textColor?: string;
  backgroundColorType?: string;
  selectedTeacherId?: string;
  teacherName?: string;
  professorPhotos?: string;
  lessonThemeBoxStyle?: string;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  
  const [eventData, setEventData] = useState<EventData>({
    title: "",
    subtitle: "",
    date: "",
    time: "",
    kvImageId: null,
    teacherImages: [],
    platforms: [],
    classTheme: "",
    boxColor: "#dd303e",
    boxFontColor: "#FFFFFF",
    fontColor: "#000000",
    textColor: "#FFFFFF",
    backgroundColorType: "red",
    lessonThemeBoxStyle: "Transparent",
    selectedTeacherId: "",
    teacherName: "",
    professorPhotos: "",
  });
  
  const [activeTab, setActiveTab] = useState("input");

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
  };

  const handleSwitchToUser = () => {
    setUserType('user');
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is admin
  const isAdmin = user.email === "henriquetocheto@gmail.com";

  // Show admin panel for admin users
  if (isAdmin && userType === 'admin') {
    return <AdminPanel onLogout={handleLogout} onSwitchToUser={handleSwitchToUser} />;
  }

  // Show user interface for regular users
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <UserHeader 
        user={user} 
        isAdmin={isAdmin} 
        userType={userType} 
        setUserType={setUserType} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
          Gerador Automático de Artes para Redes Sociais
        </h1>

        <EventDataTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          eventData={eventData}
          setEventData={setEventData}
        />
      </main>
      
      <footer className="bg-blue-800 text-white py-4 text-center">
        <p>© 2025 Gerador Automático de Artes</p>
      </footer>
    </div>
  );
};

export default Index;
