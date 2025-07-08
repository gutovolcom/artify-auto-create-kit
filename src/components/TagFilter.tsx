import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, X, Filter, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { PREDEFINED_TAGS, TAG_COLORS } from "@/constants/tags";

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export const TagFilter = ({ 
  allTags, 
  selectedTags, 
  onTagsChange,
  className 
}: TagFilterProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

  const getTagColor = (tagName: string) => {
    return TAG_COLORS[tagName as keyof typeof TAG_COLORS] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const predefinedTagsInSystem = PREDEFINED_TAGS.filter(tag => allTags.includes(tag));
  const customTagsInSystem = allTags.filter(tag => !PREDEFINED_TAGS.includes(tag));

  const handleTagToggle = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    onTagsChange(newSelectedTags);
  };

  const handleClearAllTags = () => {
    onTagsChange([]);
  };

  const handleSelectAllPredefined = () => {
    const newTags = [...new Set([...selectedTags, ...predefinedTagsInSystem])];
    onTagsChange(newTags);
  };

  const tagsToShow = showAllTags ? filteredTags : filteredTags.slice(0, 10);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-1">
          <Filter className="h-3 w-3" />
          Filtrar por Tags
        </Label>
        {selectedTags.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClearAllTags}
            className="text-xs h-6 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">Tags Selecionadas</Label>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className={cn(
                  "text-xs border cursor-pointer transition-all hover:shadow-sm",
                  getTagColor(tag)
                )}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
        <Input
          placeholder="Buscar tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 text-sm h-8"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSelectAllPredefined}
          className="text-xs h-6"
          disabled={predefinedTagsInSystem.every(tag => selectedTags.includes(tag))}
        >
          <Tag className="h-3 w-3 mr-1" />
          Todas Predefinidas
        </Button>
      </div>

      {/* Predefined Tags */}
      {predefinedTagsInSystem.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">Tags Predefinidas</Label>
          <div className="flex flex-wrap gap-1">
            {predefinedTagsInSystem
              .filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((tag) => (
                <Badge 
                  key={tag} 
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={cn(
                    "text-xs border cursor-pointer transition-all hover:shadow-sm",
                    selectedTags.includes(tag) 
                      ? getTagColor(tag) 
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Custom Tags */}
      {customTagsInSystem.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">Tags Personalizadas</Label>
          <div className="flex flex-wrap gap-1">
            {customTagsInSystem
              .filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((tag) => (
                <Badge 
                  key={tag} 
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={cn(
                    "text-xs border cursor-pointer transition-all hover:shadow-sm",
                    selectedTags.includes(tag) 
                      ? "bg-gray-100 text-gray-800 border-gray-300"
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* No Tags Message */}
      {allTags.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma tag disponível</p>
          <p className="text-xs">Tags serão criadas quando você adicionar tags aos templates</p>
        </div>
      )}

      {/* No Results Message */}
      {allTags.length > 0 && filteredTags.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma tag encontrada</p>
          <p className="text-xs">Tente alterar o termo de busca</p>
        </div>
      )}

      {/* Tag Count */}
      {allTags.length > 0 && (
        <div className="text-xs text-gray-500 border-t pt-2">
          <div className="flex justify-between">
            <span>Total de tags: {allTags.length}</span>
            <span>Selecionadas: {selectedTags.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};