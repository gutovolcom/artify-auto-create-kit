import { EventData } from "@/pages/Index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { MultiSelectTeacher } from "@/components/MultiSelectTeacher";

// This map should ideally be shared from where lessonThemeStyleColors is defined in elementRenderer,
// or defined in a shared constants file. For now, duplicating for clarity of what colors are used.
const lessonThemeStyleDefinition = {
  'Green': { boxColor: '#CAFF39', fontColor: '#DD303E' },
  'Red':   { boxColor: '#DD303E', fontColor: '#CAFF39' },
  'White': { boxColor: '#FFFFFF', fontColor: '#DD303E' },
  'Transparent': { boxColor: null, fontColor: null } // fontColor for Transparent text uses eventData.textColor
};

interface EventFormProps {
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
}

export const EventForm = ({ eventData, updateEventData }: EventFormProps) => {
  const { templates } = useSupabaseTemplates();

  const formatDisplayNames = {
    youtube: "YouTube",
    feed: "Feed",
    stories: "Stories", 
    bannerGCO: "Banner GCO",
    ledStudio: "LED Studio",
    LP: "LP"
  };

  const availableFormats = eventData.kvImageId 
    ? templates.find(t => t.id === eventData.kvImageId)?.formats?.map(f => ({
        id: f.format_name,
        label: formatDisplayNames[f.format_name as keyof typeof formatDisplayNames] || f.format_name
      })) || []
    : [];

  // Updated options to be used by the "Cor de fundo do texto" Select
  const lessonThemeStyleOptions = [
    { id: "Red",   label: "Vermelho",  displayBoxColor: "#DD303E" },
    { id: "White", label: "Branco",    displayBoxColor: "#FFFFFF" },
    { id: "Green", label: "Verde Gran",displayBoxColor: "#CAFF39" },
    { id: "Transparent", label: "Sem fundo (transparente)", displayBoxColor: "transparent" },
  ];

  const textColorOptions = [
    { id: "#DD303E", label: "Vermelho", color: "#DD303E" },
    { id: "#FFFFFF", label: "Branco", color: "#FFFFFF" },
    { id: "#0d134c", label: "Azul", color: "#0d134c" },
    { id: "#CAFF39", label: "Verde", color: "#CAFF39" },
    { id: "#F7C7BE", label: "Rosa Claro", color: "#F7C7BE" },
  ];

  const handleLessonThemeStyleChange = (styleName: string) => { // styleName is "Red", "Green", etc.
    const selectedStyle = lessonThemeStyleDefinition[styleName as keyof typeof lessonThemeStyleDefinition];

    let newBoxColor = eventData.boxColor; // Default to current
    let newBoxFontColor = eventData.boxFontColor; // Default to current

    if (selectedStyle) {
      newBoxColor = selectedStyle.boxColor === null ? 'transparent' : selectedStyle.boxColor;
      // For 'Transparent' style, font color is main textColor. For others, it's from the definition.
      newBoxFontColor = selectedStyle.fontColor === null ? (eventData.textColor || '#FFFFFF') : selectedStyle.fontColor;
    } else if (styleName === 'Transparent') { // Explicit fallback for Transparent, though map should cover it
      newBoxColor = 'transparent';
      newBoxFontColor = eventData.textColor || '#FFFFFF';
    }

    updateEventData({
      lessonThemeBoxStyle: styleName, // This is the primary field for the new logic
      // backgroundColorType: styleName, // Keep this to ensure Select shows correct selection
      // The following are for general fallback or other elements, not directly used by classTheme if lessonThemeBoxStyle is set
      boxColor: newBoxColor,
      boxFontColor: newBoxFontColor
    });
  };

  const handleTextColorChange = (value: string) => {
    updateEventData({ textColor: value });
    // If transparent theme is active, also update boxFontColor as it's linked to textColor
    if (eventData.lessonThemeBoxStyle === 'Transparent') {
      updateEventData({ boxFontColor: value });
    }
  };

  const handleTeacherSelectionChange = (teacherIds: string[], teacherImages: string[], teacherNames: string[]) => {
    updateEventData({
      selectedTeacherIds: teacherIds,
      teacherImages: teacherImages,
      teacherNames: teacherNames
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Evento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título do Evento</Label>
          <Input
            id="title"
            placeholder="Insira o título do evento"
            value={eventData.title || ""}
            onChange={(e) => updateEventData({ title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="classTheme">Tema da aula</Label>
          <Textarea
            id="classTheme"
            placeholder="Insira o tema da aula"
            value={eventData.classTheme || ""}
            onChange={(e) => updateEventData({ classTheme: e.target.value })}
            rows={2}
            maxLength={44}
          />
          <div className="text-xs text-gray-500 text-right">
            {(eventData.classTheme || "").length}/44
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cor de fundo do texto (Tema da Aula)</Label>
            <Select
              value={eventData.lessonThemeBoxStyle || "Transparent"}
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
            <Select value={eventData.textColor || "#FFFFFF"} onValueChange={handleTextColorChange}>
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
        </div>

        {/* This specific input for fontColor might be redundant if textColor serves as the main color picker,
            especially for the "Transparent" theme text. Keeping it for now if it serves other purposes. */}
        {eventData.backgroundColorType === "transparent" && (
          <div className="space-y-2">
            <Label htmlFor="fontColor">Cor do texto (para fundo transparente)</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="fontColor"
                value={eventData.textColor || "#000000"} // Should ideally be linked to eventData.textColor
                onChange={(e) => handleTextColorChange(e.target.value)} // Use handleTextColorChange
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={eventData.textColor || "#000000"} // Should ideally be linked to eventData.textColor
                onChange={(e) => handleTextColorChange(e.target.value)} // Use handleTextColorChange
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        )}

        <MultiSelectTeacher
          selectedTeacherIds={eventData.selectedTeacherIds || []}
          onSelectionChange={handleTeacherSelectionChange}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={eventData.date}
              onChange={(e) => updateEventData({ date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <Input
              id="time"
              type="time"
              value={eventData.time}
              onChange={(e) => updateEventData({ time: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Formatos</Label>
          {availableFormats.length === 0 ? (
            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
              Selecione um template para ver os formatos disponíveis
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableFormats.map((format) => (
                <div key={format.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format.id}`}
                    checked={eventData.platforms.includes(format.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateEventData({
                          platforms: [...eventData.platforms, format.id],
                        });
                      } else {
                        updateEventData({
                          platforms: eventData.platforms.filter(
                            (p) => p !== format.id
                          ),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`format-${format.id}`}>{format.label}</Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
