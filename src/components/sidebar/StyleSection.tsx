import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

interface StyleSectionProps {
  lessonThemeBoxStyle: string;
  textColor: string;
  onStyleChange: (style: string) => void;
  onTextColorChange: (color: string) => void;
}

export const StyleSection = ({ 
  lessonThemeBoxStyle, 
  textColor, 
  onStyleChange, 
  onTextColorChange 
}: StyleSectionProps) => {
  const backgroundOptions = [
    { value: "Transparent", label: "Sem fundo", color: "transparent" },
    { value: "Red", label: "Vermelho", color: "#DD303E" },
    { value: "White", label: "Branco", color: "#FFFFFF" },
    { value: "Green", label: "Verde", color: "#CAFF39" },
  ];

  const textColorOptions = [
    { value: "#FFFFFF", label: "Branco", color: "#FFFFFF" },
    { value: "#DD303E", label: "Vermelho", color: "#DD303E" },
    { value: "#000000", label: "Preto", color: "#000000" },
    { value: "#0D134C", label: "Azul", color: "#0D134C" },
    { value: "#F7C7BE", label: "Rosa Claro", color: "#F7C7BE" },
    { value: "#CAFF39", label: "Verde", color: "#CAFF39" },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Cor de fundo (tema):
            </Label>
            <Select value={lessonThemeBoxStyle} onValueChange={onStyleChange}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {backgroundOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ 
                          backgroundColor: option.color === "transparent" ? "hsl(var(--muted))" : option.color,
                          backgroundImage: option.color === "transparent" ? "repeating-conic-gradient(hsl(var(--border)) 0% 25%, transparent 0% 50%)" : "none",
                          backgroundSize: "8px 8px"
                        }}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Cor do texto:
            </Label>
            <Select value={textColor} onValueChange={onTextColorChange}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {textColorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: option.color }}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
