
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Image as ImageIcon } from "lucide-react";
import { KVSelectorModal } from "@/components/KVSelectorModal";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";

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
        <SidebarGroupLabel>Template</SidebarGroupLabel>
        <SidebarGroupContent>
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-3"
            onClick={() => setIsKVModalOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center">
                <ImageIcon className={`h-4 w-4 ${selectedTemplate ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">
                  {selectedTemplate ? selectedTemplate.name : "Selecionar Template"}
                </div>
                <div className="text-xs text-gray-500">
                  Clique para escolher
                </div>
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
