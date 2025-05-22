
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TemplateImage {
  id: string;
  url: string;
  name: string;
}

// Default KV images
const defaultKvImages: TemplateImage[] = [
  { id: "kv1", url: "/placeholder.svg", name: "Template 1" },
  { id: "kv2", url: "/placeholder.svg", name: "Template 2" },
  { id: "kv3", url: "/placeholder.svg", name: "Template 3" },
  { id: "kv4", url: "/placeholder.svg", name: "Template 4" },
  { id: "kv5", url: "/placeholder.svg", name: "Template 5" },
  { id: "kv6", url: "/placeholder.svg", name: "Template 6" },
];

interface ImageSelectorProps {
  selectedImageId: string | null;
  onSelect: (id: string) => void;
}

export const ImageSelector = ({ selectedImageId, onSelect }: ImageSelectorProps) => {
  const [kvImages, setKvImages] = useState<TemplateImage[]>(defaultKvImages);
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
    
    // Create URL for loaded image
    const imageUrl = URL.createObjectURL(file);
    const newTemplate: TemplateImage = {
      id: `template-${Date.now()}`,
      url: imageUrl,
      name: templateName.trim(),
    };
    
    setKvImages([...kvImages, newTemplate]);
    setTemplateName("");
    setShowUploadForm(false);
    toast.success("Template adicionado com sucesso!");
    
    // Auto-select the newly added template
    onSelect(newTemplate.id);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Selecione a Imagem Principal (KV)</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Template
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showUploadForm && (
          <div className="p-4 border rounded-md bg-slate-50 mb-4">
            <div className="space-y-3">
              <div>
                <Input
                  placeholder="Nome do Template"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mb-3"
                />
                <label 
                  htmlFor="template-upload" 
                  className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FileImage className="h-8 w-8 text-blue-500" />
                    <span className="text-sm font-medium">Selecione uma imagem para o template</span>
                    <span className="text-xs text-gray-500">PNG, JPG ou GIF (max 5MB)</span>
                  </div>
                  <Input 
                    id="template-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAddTemplate}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {kvImages.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "border cursor-pointer rounded-md overflow-hidden transition-all",
                  selectedImageId === image.id
                    ? "ring-2 ring-blue-600 ring-offset-2"
                    : "hover:border-blue-300"
                )}
                onClick={() => onSelect(image.id)}
              >
                <div className="aspect-video relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-2 text-center text-sm font-medium">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
