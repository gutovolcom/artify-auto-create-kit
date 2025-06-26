
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";

const lessonThemeStyleOptions = [
  { id: "Red", label: "Vermelho", displayBoxColor: "#DD303E" },
  { id: "White", label: "Branco", displayBoxColor: "#FFFFFF" },
  { id: "Green", label: "Verde Gran", displayBoxColor: "#CAFF39" },
  { id: "Transparent", label: "Sem fundo (transparente)", displayBoxColor: "transparent" },
];

const textColorOptions = [
  { id: "#DD303E", label: "Vermelho", color: "#DD303E" },
  { id: "#FFFFFF", label: "Branco", color: "#FFFFFF" },
  { id: "#0d134c", label: "Azul", color: "#0d134c" },
  { id: "#CAFF39", label: "Verde", color: "#CAFF39" },
  { id: "#F7C7BE", label: "Rosa Claro", color: "#F7C7BE" },
];

const lessonThemeStyleDefinition = {
  'Green': { boxColor: '#CAFF39', fontColor: '#DD303E' },
  'Red': { boxColor: '#DD303E', fontColor: '#CAFF39' },
  'White': { boxColor: '#FFFFFF', fontColor: '#DD303E' },
  'Transparent': { boxColor: null, fontColor: null }
};

interface StyleSectionProps {
  lessonThemeBoxStyle: string;
  textColor: string;
  onStyleChange: (styleName: string) => void;
  onTextColorChange: (color: string) => void;
}

export const StyleSection = ({ 
  lessonThemeBoxStyle, 
  textColor, 
  onStyleChange, 
  onTextColorChange 
}: StyleSectionProps) => {
  const handleLessonThemeStyleChange = (styleName: string) => {
    const selectedStyle = lessonThemeStyleDefinition[styleName as keyof typeof lessonThemeStyleDefinition];

    let newBoxColor = "";
    let newBoxFontColor = "";

    if (selectedStyle) {
      newBoxColor = selectedStyle.boxColor === null ? 'transparent' : selectedStyle.boxColor;
      newBoxFontColor = selectedStyle.fontColor === null ? (textColor || '#FFFFFF') : selectedStyle.fontColor;
    } else if (styleName === 'Transparent') {
      newBoxColor = 'transparent';
      newBoxFontColor = textColor || '#FFFFFF';
    }

    onStyleChange(styleName);
  };

  const handleTextColorChange = (value: string) => {
    onTextColorChange(value);
    if (lessonThemeBoxStyle === 'Transparent') {
      // Additional logic for transparent theme can be handled by parent
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Estilo</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-4">
        <div className="space-y-2">
          <Label>Cor de fundo do texto (Tema da Aula)</Label>
          <Select
            value={lessonThemeBoxStyle || "Transparent"}
            onValueChange={handleLessonThemeStyleChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estilo" />
            </SelectTrigger>
            <SelectContent>
              {lessonThemeStyleOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ 
                        backgroundColor: option.displayBoxColor === "transparent" ? "#f0f0f0" : option.displayBoxColor,
                        border: option.displayBoxColor === "#FFFFFF" ? "1px solid #ccc" : "none"
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
          <Label>Cor do texto (Geral)</Label>
          <Select value={textColor || "#FFFFFF"} onValueChange={handleTextColorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a cor do texto" />
            </SelectTrigger>
            <SelectContent>
              {textColorOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ 
                        backgroundColor: option.color,
                        border: option.color === "#FFFFFF" ? "1px solid #ccc" : "none"
                      }}
                    />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
