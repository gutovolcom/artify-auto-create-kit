import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Image as ImageIcon } from "lucide-react";
import { KVSelectorModal } from "@/components/KVSelectorModal";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { Label } from "@/components/ui/label";

interface TemplateSectionProps {
  selectedTemplateId: string | null;
  onTemplateSelect: (id: string) => void;
}

export const TemplateSection = ({ selectedTemplateId, onTemplateSelect }: TemplateSectionProps) => {
  const [isKVModalOpen, setIsKVModalOpen] = useState(false);
  const { templates } = useSupabaseTemplates();

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="space-y-2">
          <Label className="text-sm text-gray-700 font-medium">Selecione o KV:</Label>

          <Button
            variant="outline"
            className="w-full h-28 justify-center px-4 py-6 bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-md"
            onClick={() => setIsKVModalOpen(true)}
          >
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <ImageIcon className="h-6 w-6" />
              <div className="text-sm text-center">
                {selectedTemplate ? selectedTemplate.name : "Escolha o KV do evento"}
              </div>
            </div>
          </Button>
        </SidebarGroupContent>
      </SidebarGroup>

      <KVSelectorModal
        isOpen={isKVModalOpen}
        onClose={() => setIsKVModalOpen(false)}
        selectedImageId={selectedTemplateId}
        onSelect={(id) => {
          onTemplateSelect(id);
          setIsKVModalOpen(false);
        }}
      />
    </>
  );
};
