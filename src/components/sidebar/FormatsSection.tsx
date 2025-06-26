
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";

const formatDisplayNames = {
  youtube: "YouTube",
  feed: "Feed",
  stories: "Stories",
  bannerGCO: "Banner GCO",
  ledStudio: "LED Studio",
  LP: "LP"
};

interface FormatsSectionProps {
  availableFormats: Array<{ id: string; label: string }>;
  selectedPlatforms: string[];
  onPlatformChange: (platforms: string[]) => void;
}

export const FormatsSection = ({ availableFormats, selectedPlatforms, onPlatformChange }: FormatsSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Formatos</SidebarGroupLabel>
      <SidebarGroupContent>
        {availableFormats.length === 0 ? (
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
            Selecione um template para ver os formatos disponíveis
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {availableFormats.map((format) => (
              <div key={format.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`format-${format.id}`}
                  checked={selectedPlatforms.includes(format.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onPlatformChange([...selectedPlatforms, format.id]);
                    } else {
                      onPlatformChange(selectedPlatforms.filter((p) => p !== format.id));
                    }
                  }}
                />
                <Label htmlFor={`format-${format.id}`} className="text-sm">
                  {format.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
