
import { motion } from "framer-motion"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useAuth } from "@/hooks/useAuth"

interface MainLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MainLayout({ children, activeTab, onTabChange }: MainLayoutProps) {
  const { user } = useAuth()
  const isAdmin = user?.email === "henriquetocheto@gmail.com"

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          activeTab={activeTab}
          onTabChange={onTabChange}
          isAdmin={isAdmin}
          userEmail={user?.email}
        />
        <SidebarInset className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 p-6"
          >
            {children}
          </motion.div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
