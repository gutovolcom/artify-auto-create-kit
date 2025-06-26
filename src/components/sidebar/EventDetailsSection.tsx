
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";

interface EventDetailsSectionProps {
  classTheme: string;
  date: string;
  time: string;
  onUpdate: (data: { classTheme?: string; date?: string; time?: string }) => void;
}

export const EventDetailsSection = ({ classTheme, date, time, onUpdate }: EventDetailsSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Informações do Evento</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="classTheme">Tema da aula</Label>
          <Textarea
            id="classTheme"
            placeholder="Insira o tema da aula"
            value={classTheme || ""}
            onChange={(e) => onUpdate({ classTheme: e.target.value })}
            rows={2}
            maxLength={44}
          />
          <div className="text-xs text-gray-500 text-right">
            {(classTheme || "").length}/44
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onUpdate({ date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => onUpdate({ time: e.target.value })}
            />
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
