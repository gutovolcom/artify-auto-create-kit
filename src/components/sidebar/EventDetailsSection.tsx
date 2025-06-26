import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { AlertCircle } from "lucide-react";

interface EventDetailsSectionProps {
  classTheme: string;
  date: string;
  time: string;
  onUpdate: (data: { classTheme?: string; date?: string; time?: string }) => void;
  errors?: {
    classTheme?: string;
    date?: string;
    time?: string;
  };
}

export const EventDetailsSection = ({
  classTheme,
  date,
  time,
  onUpdate,
  errors,
}: EventDetailsSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-4 relative">
        {/* TEMA DA AULA */}
        <div className="space-y-2 relative">
          <Label htmlFor="classTheme" className="text-sm font-medium text-gray-700">
            Tema da aula:
          </Label>
          <Textarea
            id="classTheme"
            placeholder="Insira aqui o tema da aula"
            value={classTheme || ""}
            onChange={(e) => onUpdate({ classTheme: e.target.value })}
            rows={2}
            maxLength={44}
            className="resize-none"
          />
          <div className="text-xs text-gray-400 text-right">
            {(classTheme || "").length}/44
          </div>

          {errors?.classTheme && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-0.5 flex items-center gap-1 shadow z-10">
              <AlertCircle className="w-3 h-3" />
              {errors.classTheme}
            </div>
          )}
        </div>

        {/* DATA E HORÁRIO */}
        <div className="grid grid-cols-2 gap-3 relative">
          {/* DATA */}
          <div className="space-y-2 relative">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Data:
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onUpdate({ date: e.target.value })}
              placeholder="dd/mm/aaaa"
              className={errors?.date ? "border-red-500" : ""}
            />

            {errors?.date && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-0.5 flex items-center gap-1 shadow z-10">
                <AlertCircle className="w-3 h-3" />
                {errors.date}
              </div>
            )}
          </div>

          {/* HORÁRIO */}
          <div className="space-y-2 relative">
            <Label htmlFor="time" className="text-sm font-medium text-gray-700">
              Horário:
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => onUpdate({ time: e.target.value })}
              className={errors?.time ? "border-red-500" : ""}
            />

            {errors?.time && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-0.5 flex items-center gap-1 shadow z-10">
                <AlertCircle className="w-3 h-3" />
                {errors.time}
              </div>
            )}
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
