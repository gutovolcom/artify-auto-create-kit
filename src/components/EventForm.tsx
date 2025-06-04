
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
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useEffect } from "react";

interface EventFormProps {
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
}

export const EventForm = ({ eventData, updateEventData }: EventFormProps) => {
  // Get teachers from Supabase instead of localStorage
  const { teachers, loading } = useSupabaseTeachers();
  const { templates } = useSupabaseTemplates();

  // Update teacher images when teacher selection changes
  useEffect(() => {
    if (eventData.professorPhotos) {
      const selectedTeacher = teachers.find(t => t.id === eventData.professorPhotos);
      if (selectedTeacher) {
        updateEventData({ 
          teacherImages: [selectedTeacher.image_url],
          teacherName: selectedTeacher.name 
        });
      }
    }
  }, [eventData.professorPhotos, teachers, updateEventData]);

  // Get available formats from selected template
  const availableFormats = eventData.kvImageId 
    ? templates.find(t => t.id === eventData.kvImageId)?.formats?.map(f => ({
        id: f.format_name,
        label: formatDisplayNames[f.format_name as keyof typeof formatDisplayNames] || f.format_name
      })) || []
    : [];

  const formatDisplayNames = {
    youtube: "YouTube",
    feed: "Feed",
    stories: "Stories", 
    bannerGCO: "Banner GCO",
    ledStudio: "LED Studio",
    LP: "LP"
  };

  const backgroundColorOptions = [
    { id: "red", label: "Vermelho", color: "#dd303e", textColor: "#FFFFFF" },
    { id: "white", label: "Branco", color: "#FFFFFF", textColor: "#dd303e" },
    { id: "green", label: "Verde Gran", color: "#CAFF39", textColor: "#dd303e" },
    { id: "transparent", label: "Sem fundo (transparente)", color: "transparent", textColor: eventData.fontColor || "#000000" },
  ];

  const handleBackgroundColorChange = (value: string) => {
    const selectedOption = backgroundColorOptions.find(option => option.id === value);
    if (selectedOption) {
      updateEventData({ 
        boxColor: selectedOption.color,
        boxFontColor: selectedOption.textColor,
        backgroundColorType: value
      });
    }
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
            maxLength={22}
          />
          <div className="text-xs text-gray-500 text-right">
            {(eventData.classTheme || "").length}/22
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cor de fundo do texto</Label>
          <Select value={eventData.backgroundColorType || "red"} onValueChange={handleBackgroundColorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a cor de fundo" />
            </SelectTrigger>
            <SelectContent>
              {backgroundColorOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ 
                        backgroundColor: option.color === "transparent" ? "#f0f0f0" : option.color,
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

        <div className="space-y-2">
          <Label htmlFor="textColor">Cor do texto (título, professor, data/hora)</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="textColor"
              value={eventData.textColor || "#FFFFFF"}
              onChange={(e) => updateEventData({ textColor: e.target.value })}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <Input
              value={eventData.textColor || "#FFFFFF"}
              onChange={(e) => updateEventData({ textColor: e.target.value })}
              placeholder="#FFFFFF"
              className="flex-1"
            />
          </div>
        </div>

        {eventData.backgroundColorType === "transparent" && (
          <div className="space-y-2">
            <Label htmlFor="fontColor">Cor do texto</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="fontColor"
                value={eventData.fontColor || "#000000"}
                onChange={(e) => updateEventData({ fontColor: e.target.value })}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={eventData.fontColor || "#000000"}
                onChange={(e) => updateEventData({ fontColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Foto do professor</Label>
          {loading ? (
            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
              Carregando professores...
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
              Nenhum professor cadastrado. Cadastre professores no painel administrativo.
            </div>
          ) : (
            <Select value={eventData.professorPhotos || ""} onValueChange={(value) => updateEventData({ professorPhotos: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o professor" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    <div className="flex items-center gap-2">
                      <img 
                        src={teacher.image_url} 
                        alt={teacher.name} 
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      {teacher.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
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
