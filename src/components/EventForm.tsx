
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

interface EventFormProps {
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
}

export const EventForm = ({ eventData, updateEventData }: EventFormProps) => {
  const platforms = [
    { id: "youtube", label: "YouTube" },
    { id: "instagram", label: "Instagram" },
    { id: "linkedin", label: "LinkedIn" },
  ];

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
            placeholder="Ex: Workshop de Marketing Digital"
            value={eventData.title}
            onChange={(e) => updateEventData({ title: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtítulo/Descrição</Label>
          <Textarea
            id="subtitle"
            placeholder="Uma breve descrição do evento..."
            value={eventData.subtitle}
            onChange={(e) => updateEventData({ subtitle: e.target.value })}
            rows={3}
          />
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
