import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon } from "lucide-react";
import { KVSelectorModal } from "@/components/KVSelectorModal";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { cn } from "@/lib/utils";
import { ErrorBadge } from "@/components/ui/error-badge";

interface TemplateSectionProps {
  selectedTemplateId: string | null;
  onTemplateSelect: (id: string) => void;
  error?: string;
}

export const TemplateSection = ({
  selectedTemplateId,
  onTemplateSelect,
  error,
}: TemplateSectionProps) => {
  const [isKVModalOpen, setIsKVModalOpen] = useState(false);
  const { templates } = useSupabaseTemplates();

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const selectedImage = selectedTemplate?.formats.find(f => f.format_name === "youtube")?.image_url;

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="space-y-2 relative">
          <Label className="text-sm font-medium text-foreground">Selecione o KV:</Label>

          <div className="relative">
            <Button
              variant="outline"
              className={cn(
                "w-full h-16 px-4 justify-start bg-background border border-dashed",
                error ? "border-destructive" : "border-border hover:border-border hover:bg-accent"
              )}
              onClick={() => setIsKVModalOpen(true)}
            >
              {selectedTemplate ? (
                <div className="flex items-center gap-3">
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt={selectedTemplate.name}
                      className="w-10 h-10 rounded-full object-cover object-center"
                    />
                  )}
                  <span className="text-sm text-foreground font-medium text-left line-clamp-1">
                    {selectedTemplate.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm">Escolha o KV do evento</span>
                </div>
              )}
            </Button>

            <ErrorBadge error={error} />
          </div>
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
