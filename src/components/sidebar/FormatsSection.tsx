
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

interface FormatsSectionProps {
  availableFormats: Array<{ id: string; label: string }>;
  selectedPlatforms: string[];
  onPlatformChange: (platforms: string[]) => void;
}

export const FormatsSection = ({ availableFormats, selectedPlatforms, onPlatformChange }: FormatsSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Selecione os formatos:
        </Label>
        
        {availableFormats.length === 0 ? (
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
            Selecione um template para ver os formatos disponíveis
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
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
                <Label htmlFor={`format-${format.id}`} className="text-xs">
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
