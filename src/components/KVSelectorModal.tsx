
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Search, FileImage, Loader2, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useDataRefresh } from "@/hooks/useDataRefresh";
import { TAG_COLORS, PREDEFINED_TAGS } from "@/constants/tags";

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
  const { templates, loading, getAllTags } = useSupabaseTemplates();
  const { refreshAll, isRefreshing } = useDataRefresh();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const getTagColor = (tagName: string) => {
    return TAG_COLORS[tagName as keyof typeof TAG_COLORS] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(selectedTag => 
        template.tags?.some(tag => tag.tag_name === selectedTag)
      );
    return matchesSearch && matchesTags;
  });

  // Helper functions for tag filter
  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  // Get primary career tag for display next to status badge
  const getPrimaryCareerTag = (template: any) => {
    if (!template.tags?.length) return null;
    
    // Prefer predefined career tags first
    const careerTag = template.tags.find((tag: any) => 
      PREDEFINED_TAGS.includes(tag.tag_name)
    );
    
    // Fallback to first tag if no predefined career tag
    return careerTag || template.tags[0];
  };

  const handleRefresh = async () => {
    await refreshAll();
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
          <div className="flex gap-3 items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tag Filter Popover */}
            <Popover open={showTagFilter} onOpenChange={setShowTagFilter}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex items-center gap-2",
                    (selectedTags.length > 0 || showTagFilter) && "bg-blue-50 border-blue-300"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  Tags
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Filtrar por Tags</h4>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTags([])}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </div>

                  {/* Predefined Tags */}
                  {PREDEFINED_TAGS.some(tag => getAllTags().includes(tag)) && (
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Tags Predefinidas</Label>
                      <div className="space-y-2">
                        {PREDEFINED_TAGS.filter(tag => getAllTags().includes(tag)).map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={tag}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() => handleTagToggle(tag)}
                            />
                            <label
                              htmlFor={tag}
                              className="text-sm cursor-pointer flex items-center gap-2"
                            >
                              <div className={cn("w-3 h-3 rounded-full border", getTagColor(tag))} />
                              {tag}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Tags */}
                  {getAllTags().filter(tag => !PREDEFINED_TAGS.includes(tag)).length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Tags Personalizadas</Label>
                        <div className="space-y-2">
                          {getAllTags().filter(tag => !PREDEFINED_TAGS.includes(tag)).map((tag) => (
                            <div key={tag} className="flex items-center space-x-2">
                              <Checkbox
                                id={tag}
                                checked={selectedTags.includes(tag)}
                                onCheckedChange={() => handleTagToggle(tag)}
                              />
                              <label
                                htmlFor={tag}
                                className="text-sm cursor-pointer"
                              >
                                {tag}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const predefinedInSystem = PREDEFINED_TAGS.filter(tag => getAllTags().includes(tag));
                        setSelectedTags(predefinedInSystem);
                      }}
                      className="text-xs h-7"
                      disabled={PREDEFINED_TAGS.filter(tag => getAllTags().includes(tag)).every(tag => selectedTags.includes(tag))}
                    >
                      Todas Predefinidas
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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

            {/* Clear All Filters Button */}
            {(searchTerm || selectedTags.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-8 px-3"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar Filtros
              </Button>
            )}
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
                  {searchTerm || selectedTags.length > 0 ? "Nenhum template encontrado" : "Nenhum template disponível"}
                </p>
                <p className="text-sm">
                  {searchTerm || selectedTags.length > 0 ? "Tente alterar os filtros" : "Templates devem ser criados no painel administrativo"}
                </p>
                {(searchTerm || selectedTags.length > 0) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="mt-3"
                  >
                    Limpar Filtros
                  </Button>
                )}
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
                        <div className="font-medium text-sm text-center mb-2">
                          {template.name}
                        </div>
                        
                        {/* Status and Career Tag Row */}
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {getPrimaryCareerTag(template) && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs border",
                                getTagColor(getPrimaryCareerTag(template).tag_name)
                              )}
                            >
                              {getPrimaryCareerTag(template).tag_name}
                            </Badge>
                          )}
                          
                          {template.layouts && template.layouts.length > 0 && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                              Layout personalizado
                            </Badge>
                          )}
                        </div>
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
