
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
import { usePersistedState } from "@/hooks/usePersistedState";

interface Teacher {
  id: string;
  name: string;
  photo: string;
}

interface EventFormProps {
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
}

export const EventForm = ({ eventData, updateEventData }: EventFormProps) => {
  // Get teachers from admin panel storage
  const [adminTeachers] = usePersistedState<Teacher[]>("admin_teachers", []);

  const platforms = [
    { id: "youtube", label: "YouTube" },
    { id: "instagram", label: "Instagram" },
    { id: "linkedin", label: "LinkedIn" },
  ];

  const backgroundColorOptions = [
    { id: "red", label: "Vermelho", color: "#dd303e", textColor: "#FFFFFF" },
    { id: "white", label: "Branco", color: "#FFFFFF", textColor: "#dd303e" },
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
          {adminTeachers.length === 0 ? (
            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
              Nenhum professor cadastrado. Cadastre professores no painel administrativo.
            </div>
          ) : (
            <Select value={eventData.professorPhotos || ""} onValueChange={(value) => updateEventData({ professorPhotos: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o professor" />
              </SelectTrigger>
              <SelectContent>
                {adminTeachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    <div className="flex items-center gap-2">
                      <img src={teacher.photo} alt={teacher.name} className="w-6 h-6 rounded-full object-cover" />
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
          <Label>Plataformas</Label>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map((platform) => (
              <div key={platform.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`platform-${platform.id}`}
                  checked={eventData.platforms.includes(platform.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateEventData({
                        platforms: [...eventData.platforms, platform.id],
                      });
                    } else {
                      updateEventData({
                        platforms: eventData.platforms.filter(
                          (p) => p !== platform.id
                        ),
                      });
                    }
                  }}
                />
                <Label htmlFor={`platform-${platform.id}`}>{platform.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
