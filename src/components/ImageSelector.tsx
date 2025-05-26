
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePersistedState } from "@/hooks/usePersistedState";

interface TemplateImage {
  id: string;
  url: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
  formats: {
    youtube: string;
    feed: string;
    stories: string;
    bannerGCO: string;
    ledStudio: string;
    LP: string;
  };
}

interface ImageSelectorProps {
  selectedImageId: string | null;
  onSelect: (id: string) => void;
}

export const ImageSelector = ({ selectedImageId, onSelect }: ImageSelectorProps) => {
  // Get templates from admin panel storage
  const [adminTemplates] = usePersistedState<Template[]>("admin_templates", []);
  
  // Convert admin templates to the format expected by ImageSelector
  const templateImages: TemplateImage[] = adminTemplates.map(template => ({
    id: template.id,
    url: template.formats.youtube, // Use YouTube format as the preview image
    name: template.name,
  }));

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const handleAddTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Validate file (must be image)
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }
    
    if (!templateName.trim()) {
      toast.error("Por favor, insira um nome para o template");
      return;
    }
    
    toast.info("Para adicionar templates, use o painel administrativo");
    setTemplateName("");
    setShowUploadForm(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Selecione a Imagem Principal (KV)</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => toast.info("Para adicionar templates, use o painel administrativo")}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Template
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {templateImages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum template disponível</p>
            <p className="text-sm">Templates devem ser criados no painel administrativo</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-2 gap-4">
              {templateImages.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "border cursor-pointer rounded-md overflow-hidden transition-all",
                    selectedImageId === image.id
                      ? "ring-2 ring-blue-600 ring-offset-2"
                      : "hover:border-blue-300"
                  )}
                  onClick={() => onSelect(image.id)}
                  data-image-id={image.id}
                >
                  <div className="aspect-video relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        console.error('Failed to load image:', image.url);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="p-2 text-center text-sm font-medium">
                    {image.name}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
