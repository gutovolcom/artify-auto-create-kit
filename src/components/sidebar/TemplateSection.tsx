
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
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
        <SidebarGroupContent>
          <Button
            variant="outline"
            className="w-full h-24 justify-center p-4 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100"
            onClick={() => setIsKVModalOpen(true)}
          >
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <ImageIcon className="h-8 w-8" />
              <div className="text-center text-sm">
                {selectedTemplate ? selectedTemplate.name : "Escolha a KV do evento"}
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
