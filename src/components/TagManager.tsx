import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { PREDEFINED_TAGS, TAG_COLORS } from "@/constants/tags";

interface TagManagerProps {
  templateId: string;
  currentTags: string[];
  onAddTag: (templateId: string, tagName: string) => Promise<void>;
  onRemoveTag: (templateId: string, tagName: string) => Promise<void>;
  allTags: string[];
  className?: string;
}

export const TagManager = ({ 
  templateId, 
  currentTags, 
  onAddTag, 
  onRemoveTag, 
  allTags,
  className 
}: TagManagerProps) => {
  const [newTag, setNewTag] = useState("");
  const [selectedPredefinedTag, setSelectedPredefinedTag] = useState<string>("");
  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleAddPredefinedTag = async () => {
    if (!selectedPredefinedTag || currentTags.includes(selectedPredefinedTag)) return;
    
    setLoading(selectedPredefinedTag);
    try {
      await onAddTag(templateId, selectedPredefinedTag);
      setSelectedPredefinedTag("");
    } catch (error) {
      console.error('Error adding predefined tag:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleAddCustomTag = async () => {
    if (!newTag.trim() || currentTags.includes(newTag.trim())) return;
    
    setLoading(newTag);
    try {
      await onAddTag(templateId, newTag.trim());
      setNewTag("");
      setIsAddingCustomTag(false);
    } catch (error) {
      console.error('Error adding custom tag:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveTag = async (tagName: string) => {
    setLoading(tagName);
    try {
      await onRemoveTag(templateId, tagName);
    } catch (error) {
      console.error('Error removing tag:', error);
    } finally {
      setLoading(null);
    }
  };

  const getTagColor = (tagName: string) => {
    return TAG_COLORS[tagName as keyof typeof TAG_COLORS] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const availablePredefinedTags = PREDEFINED_TAGS.filter(tag => !currentTags.includes(tag));

  return (
    <div className={cn("space-y-3", className)}>
      {/* Current Tags */}
      {currentTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Tags Atuais
          </Label>
          <div className="flex flex-wrap gap-2">
            {currentTags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className={cn(
                  "text-xs border",
                  getTagColor(tag),
                  "transition-all hover:shadow-sm"
                )}
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  disabled={loading === tag}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add Predefined Tags */}
      {availablePredefinedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Adicionar Tag Predefinida</Label>
          <div className="flex gap-2">
            <Select 
              value={selectedPredefinedTag} 
              onValueChange={setSelectedPredefinedTag}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione uma tag..." />
              </SelectTrigger>
              <SelectContent>
                {availablePredefinedTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full border", getTagColor(tag))} />
                      {tag}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddPredefinedTag}
              disabled={!selectedPredefinedTag || loading === selectedPredefinedTag}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Custom Tag */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Tag Personalizada</Label>
          {!isAddingCustomTag && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddingCustomTag(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Adicionar
            </Button>
          )}
        </div>
        
        {isAddingCustomTag && (
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Digite o nome da tag..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCustomTag();
                }
              }}
            />
            <Button 
              onClick={handleAddCustomTag}
              disabled={!newTag.trim() || loading === newTag}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setIsAddingCustomTag(false);
                setNewTag("");
              }}
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Tag Statistics */}
      {allTags.length > 0 && (
        <div className="pt-2 border-t">
          <Label className="text-xs text-gray-500">
            Total de tags no sistema: {allTags.length}
          </Label>
        </div>
      )}
    </div>
  );
};