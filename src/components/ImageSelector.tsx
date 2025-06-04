
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileImage, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";

interface ImageSelectorProps {
  selectedImageId: string | null;
  onSelect: (id: string) => void;
}

export const ImageSelector = ({ selectedImageId, onSelect }: ImageSelectorProps) => {
  const { templates, loading, refetch } = useSupabaseTemplates();

  const handleAddTemplate = () => {
    toast.info("Para adicionar templates, use o painel administrativo");
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success("Templates atualizados!");
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Selecione a Imagem Principal (KV)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Selecione a Imagem Principal (KV)</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddTemplate}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum template disponível</p>
            <p className="text-sm">Templates devem ser criados no painel administrativo</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => {
                const youtubeFormat = template.formats?.find(f => f.format_name === 'youtube');
                return (
                  <div
                    key={template.id}
                    className={cn(
                      "border cursor-pointer rounded-md overflow-hidden transition-all",
                      selectedImageId === template.id
                        ? "ring-2 ring-blue-600 ring-offset-2"
                        : "hover:border-blue-300"
                    )}
                    onClick={() => onSelect(template.id)}
                    data-image-id={template.id}
                  >
                    <div className="aspect-video relative bg-gray-100">
                      {youtubeFormat?.image_url ? (
                        <img
                          src={youtubeFormat.image_url}
                          alt={template.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            console.error('Failed to load template image:', youtubeFormat.image_url);
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.placeholder-content')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'placeholder-content absolute inset-0 flex items-center justify-center text-gray-400';
                              placeholder.innerHTML = '<div class="text-center"><div class="text-2xl mb-2">🖼️</div><div class="text-sm">Template</div></div>';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-2xl mb-2">🖼️</div>
                            <div className="text-sm">Template</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-center text-sm font-medium">
                      {template.name}
                      {template.layouts && template.layouts.length > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          Layout personalizado
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
