import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { ErrorBadge } from "@/components/ui/error-badge";
import { cn } from "@/lib/utils";
import { ptBR } from 'date-fns/locale';

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Convert date string to Date object for calendar
  const selectedDate = date ? new Date(date) : undefined;
  
  // Handle date selection from calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Format date as YYYY-MM-DD for input compatibility
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onUpdate({ date: formattedDate });
      setIsCalendarOpen(false);
    }
  };

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
            className={cn(
              "resize-none min-h-[60px] max-h-[60px]",
              errors?.classTheme && "border-red-500"
            )}
          />
          <div className="text-xs text-gray-400 text-right">
            {(classTheme || "").length}/44
          </div>
          <ErrorBadge error={errors?.classTheme} />
        </div>

        {/* DATA E HORÁRIO */}
        <div className="grid grid-cols-2 gap-3 relative">
          {/* DATA */}
          <div className="space-y-2 relative">
            <Label htmlFor="date-picker" className="text-sm font-medium text-gray-700">
              Data:
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker"
                  className={cn(
                    "w-full justify-between font-normal",
                    errors?.date && "border-red-500"
                  )}
                >
                  {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : "Selecione a data"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  captionLayout="dropdown"
                  onSelect={handleDateSelect}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <ErrorBadge error={errors?.date} />
          </div>

          {/* HORÁRIO */}
          <div className="space-y-2 relative">
            <Label htmlFor="time-picker" className="text-sm font-medium text-gray-700">
              Horário:
            </Label>
            <Input
              type="time"
              id="time-picker"
              value={time}
              onChange={(e) => onUpdate({ time: e.target.value })}
              className={cn(
                "bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
                errors?.time && "border-red-500"
              )}
            />
            <ErrorBadge error={errors?.time} />
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
