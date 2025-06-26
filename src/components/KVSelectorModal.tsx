
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, FileImage, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { toast } from "sonner";

interface KVSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImageId: string | null;
  onSelect: (id: string) => void;
}

export const KVSelectorModal = ({
  isOpen,
  onClose,
  selectedImageId,
  onSelect,
}: KVSelectorModalProps) => {
  const { templates, loading, refetch } = useSupabaseTemplates();
  const { refreshAllLayouts } = useLayoutEditor();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('Starting complete refresh: templates + layouts');
      
      await refetch();
      await refreshAllLayouts();
      
      toast.success("Templates e layouts atualizados!");
    } catch (error) {
      console.error('Error during refresh:', error);
      toast.error("Erro ao atualizar dados");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelect = (templateId: string) => {
    onSelect(templateId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Selecionar Template (KV)</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filter Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {searchTerm ? "Nenhum template encontrado" : "Nenhum template disponível"}
                </p>
                <p className="text-sm">
                  {searchTerm ? "Tente alterar o termo de busca" : "Templates devem ser criados no painel administrativo"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 p-2">
                {filteredTemplates.map((template) => {
                  const youtubeFormat = template.formats?.find(f => f.format_name === 'youtube');
                  const isSelected = selectedImageId === template.id;
                  
                  return (
                    <div
                      key={template.id}
                      className={cn(
                        "border cursor-pointer rounded-lg overflow-hidden transition-all hover:shadow-md",
                        isSelected
                          ? "ring-2 ring-blue-600 ring-offset-2 border-blue-300"
                          : "hover:border-blue-300"
                      )}
                      onClick={() => handleSelect(template.id)}
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
                        
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <div className="font-medium text-sm text-center">
                          {template.name}
                        </div>
                        {template.layouts && template.layouts.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1 text-center">
                            Layout personalizado
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
