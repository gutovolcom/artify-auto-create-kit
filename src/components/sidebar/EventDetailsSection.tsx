import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { useFormContext } from "react-hook-form";
import { EventFormValues } from "@/lib/validators";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDetailsSectionProps {
  classTheme: string;
  date: string;
  time: string;
  onUpdate: (data: { classTheme?: string; date?: string; time?: string }) => void;
}

export const EventDetailsSection = ({
  classTheme,
  date,
  time,
  onUpdate
}: EventDetailsSectionProps) => {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<EventFormValues>();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-4">

        {/* Tema da Aula */}
        <div className="space-y-1 relative">
          <Label htmlFor="classTheme" className="text-sm font-medium text-gray-700">
            Tema da aula:
          </Label>
          <Textarea
            id="classTheme"
            placeholder="Insira aqui o tema da aula"
            value={classTheme || ""}
            onChange={(e) => {
              const value = e.target.value;
              onUpdate({ classTheme: value });
              setValue("classTheme", value);
            }}
            rows={2}
            maxLength={44}
            className={cn(
              "resize-none",
              errors.classTheme ? "border-red-500" : ""
            )}
          />
          <div className="text-xs text-gray-400 text-right">
            {(classTheme || "").length}/44
          </div>
          {errors.classTheme && (
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.classTheme.message}</span>
            </div>
          )}
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-3">
          {/* Data */}
          <div className="relative space-y-1">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Data:
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                onUpdate({ date: e.target.value });
                setValue("date", e.target.value);
              }}
              className={cn(errors.date ? "border-red-500" : "")}
              placeholder="dd/mm/aaaa"
            />
            {errors.date && (
              <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.date.message}</span>
              </div>
            )}
          </div>

          {/* Horário */}
          <div className="relative space-y-1">
            <Label htmlFor="time" className="text-sm font-medium text-gray-700">
              Horário:
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => {
                onUpdate({ time: e.target.value });
                setValue("time", e.target.value);
              }}
              className={cn(errors.time ? "border-red-500" : "")}
            />
            {errors.time && (
              <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.time.message}</span>
              </div>
            )}
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
