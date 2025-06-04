
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TemplateManager } from "./TemplateManager";
import { TeacherManager } from "./TeacherManager";

interface AdminPanelProps {
  onLogout: () => void;
  onSwitchToUser?: () => void;
}

export const AdminPanel = ({ onLogout, onSwitchToUser }: AdminPanelProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800">Painel Administrativo</h1>
          <div className="flex gap-2">
            {onSwitchToUser && (
              <Button onClick={onSwitchToUser} variant="outline">
                Painel do Usuário
              </Button>
            )}
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Gerenciar Templates</TabsTrigger>
            <TabsTrigger value="teachers">Gerenciar Professores</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>
          
          <TabsContent value="teachers">
            <TeacherManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
