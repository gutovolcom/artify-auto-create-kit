
import { useState } from "react";
import { EventData } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MultiSelectTeacher } from "@/components/MultiSelectTeacher";
import { KVSelectorModal } from "@/components/KVSelectorModal";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";

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

interface AppSidebarProps {
  eventData: EventData;
  updateEventData: (data: Partial<EventData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
  missingFields: string[];
}

export const AppSidebar = ({
  eventData,
  updateEventData,
  onGenerate,
  isGenerating,
  generationProgress,
  currentGeneratingFormat,
  missingFields,
}: AppSidebarProps) => {
  const [isKVModalOpen, setIsKVModalOpen] = useState(false);
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

  const selectedTemplate = templates.find(t => t.id === eventData.kvImageId);

  const handleLessonThemeStyleChange = (styleName: string) => {
    const selectedStyle = lessonThemeStyleDefinition[styleName as keyof typeof lessonThemeStyleDefinition];

    let newBoxColor = eventData.boxColor;
    let newBoxFontColor = eventData.boxFontColor;

    if (selectedStyle) {
      newBoxColor = selectedStyle.boxColor === null ? 'transparent' : selectedStyle.boxColor;
      newBoxFontColor = selectedStyle.fontColor === null ? (eventData.textColor || '#FFFFFF') : selectedStyle.fontColor;
    } else if (styleName === 'Transparent') {
      newBoxColor = 'transparent';
      newBoxFontColor = eventData.textColor || '#FFFFFF';
    }

    updateEventData({
      lessonThemeBoxStyle: styleName,
      boxColor: newBoxColor,
      boxFontColor: newBoxFontColor
    });
  };

  const handleTextColorChange = (value: string) => {
    updateEventData({ textColor: value });
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

  const isFormReady = eventData.date && eventData.kvImageId && 
    eventData.selectedTeacherIds && eventData.selectedTeacherIds.length > 0;

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b p-4">
          <h2 className="text-lg font-semibold">Configurações do Evento</h2>
        </SidebarHeader>
        
        <SidebarContent className="p-4">
          <div className="space-y-6">
            {/* Template Selection */}
            <SidebarGroup>
              <SidebarGroupLabel>Template</SidebarGroupLabel>
              <SidebarGroupContent>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setIsKVModalOpen(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center">
                      {selectedTemplate ? (
                        <ImageIcon className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">
                        {selectedTemplate ? selectedTemplate.name : "Selecionar Template"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Clique para escolher
                      </div>
                    </div>
                  </div>
                </Button>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Event Details */}
            <SidebarGroup>
              <SidebarGroupLabel>Informações do Evento</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-4">
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

                <div className="grid grid-cols-2 gap-3">
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
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Style Configuration */}
            <SidebarGroup>
              <SidebarGroupLabel>Estilo</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-4">
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
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Teacher Selection */}
            <SidebarGroup>
              <SidebarGroupLabel>Professor</SidebarGroupLabel>
              <SidebarGroupContent>
                <MultiSelectTeacher
                  selectedTeacherIds={eventData.selectedTeacherIds || []}
                  onSelectionChange={handleTeacherSelectionChange}
                />
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Formats */}
            <SidebarGroup>
              <SidebarGroupLabel>Formatos</SidebarGroupLabel>
              <SidebarGroupContent>
                {availableFormats.length === 0 ? (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
                    Selecione um template para ver os formatos disponíveis
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
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
                        <Label htmlFor={`format-${format.id}`} className="text-sm">
                          {format.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Generation Section */}
            <SidebarGroup>
              <SidebarGroupLabel>Geração</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-4">
                {missingFields.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">Campos obrigatórios pendentes:</div>
                      <ul className="text-sm space-y-1">
                        {missingFields.map((field, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-current rounded-full"></span>
                            {field}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {isGenerating && (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Gerando artes... {generationProgress}%
                      </p>
                      {currentGeneratingFormat && (
                        <p className="text-xs text-gray-500">
                          {currentGeneratingFormat}
                        </p>
                      )}
                    </div>
                    <Progress value={generationProgress} className="w-full h-2" />
                  </div>
                )}
                
                <Button
                  onClick={onGenerate}
                  disabled={!isFormReady || isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Artes
                    </>
                  )}
                </Button>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>
      </Sidebar>

      <KVSelectorModal
        isOpen={isKVModalOpen}
        onClose={() => setIsKVModalOpen(false)}
        selectedImageId={eventData.kvImageId}
        onSelect={(id) => {
          updateEventData({ kvImageId: id });
          setIsKVModalOpen(false);
        }}
      />
    </>
  );
};
