import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventData } from "@/pages/Index";
import { Loader2, Image } from "lucide-react";
import { useEffect, useState } from "react";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";

interface PlatformPreviewsProps {
  eventData: EventData;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const PlatformPreviews = ({
  eventData,
  onGenerate,
  isGenerating,
}: PlatformPreviewsProps) => {
  const { templates } = useSupabaseTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Get the selected template
  useEffect(() => {
    if (eventData.kvImageId && templates.length > 0) {
      const template = templates.find(t => t.id === eventData.kvImageId);
      console.log('Selected template:', template);
      setSelectedTemplate(template || null);
    }
  }, [eventData.kvImageId, templates]);

  // Platform-specific configurations with correct formats
  const platforms = {
    youtube: {
      name: "YouTube",
      dimensions: "1920 x 1080",
      aspectRatio: "16:9",
    },
    feed: {
      name: "Feed",
      dimensions: "1080 x 1080",
      aspectRatio: "1:1",
    },
    stories: {
      name: "Stories",
      dimensions: "1080 x 1920",
      aspectRatio: "9:16",
    },
    highlight: {
      name: "Highlight",
      dimensions: "255 x 192",
      aspectRatio: "4:3",
    },
    bannerGCO: {
      name: "Banner GCO",
      dimensions: "1920 x 500",
      aspectRatio: "96:25",
    },
    ledStudio: {
      name: "LED Studio",
      dimensions: "1024 x 256",
      aspectRatio: "4:1",
    },
  };

  // Format date and time according to the specified pattern
  const formatDateTime = (dateString: string, timeString?: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    let formattedDateTime = `${day}/${month}`;
    
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      if (minutes === '00') {
        formattedDateTime += `, at ${hours}h`;
      } else {
        formattedDateTime += `, at ${hours}h${minutes}`;
      }
    }
    
    return formattedDateTime;
  };

  // Check if the form is ready to generate images - removed title requirement
  const isFormComplete =
    eventData.date &&
    eventData.kvImageId &&
    eventData.classTheme;

  // Show all formats for preview
  const allFormats = Object.keys(platforms);

  console.log('Form complete:', isFormComplete);
  console.log('Selected template:', selectedTemplate);
  console.log('Event data:', eventData);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Pré-visualização das Artes</h3>
        <Button 
          onClick={onGenerate} 
          disabled={!isFormComplete || isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            "Gerar Pré-visualizações"
          )}
        </Button>
      </div>

      {!isFormComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800 text-sm">
          Preencha todos os campos necessários para gerar as pré-visualizações:
          <ul className="list-disc list-inside mt-2">
            {!eventData.date && <li>Data do evento</li>}
            {!eventData.kvImageId && <li>Imagem principal (KV)</li>}
            {!eventData.classTheme && <li>Tema da aula</li>}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allFormats.map((formatId) => {
          const platform = platforms[formatId as keyof typeof platforms];
          const formatData = selectedTemplate?.formats?.find((f: any) => f.format_name === formatId);
          const backgroundImage = formatData?.image_url;
          const formattedDateTime = formatDateTime(eventData.date, eventData.time);
          
          console.log(`Format ${formatId}:`, {
            formatData,
            backgroundImage,
            hasSelectedTemplate: !!selectedTemplate,
            hasFormats: !!selectedTemplate?.formats
          });
          
          return (
            <Card key={formatId} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">{platform.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!isFormComplete ? (
                  <div 
                    className="flex items-center justify-center text-gray-400 flex-col bg-gray-100 border-t"
                    style={{
                      aspectRatio: platform.aspectRatio,
                      minHeight: "120px"
                    }}
                  >
                    <Image className="h-12 w-12 opacity-50 mb-2" />
                    <div className="text-sm font-medium">
                      {platform.dimensions}
                    </div>
                    <div className="text-xs">{platform.aspectRatio.replace('/', ':')}</div>
                  </div>
                ) : (
                  <div 
                    className="relative text-white overflow-hidden w-full"
                    style={{
                      aspectRatio: platform.aspectRatio,
                      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      fontFamily: 'Margem, system-ui, -apple-system, sans-serif',
                      minHeight: "120px"
                    }}
                  >
                    {formatId === 'youtube' ? (
                      // YouTube-specific layout following the drawYouTubeFormat style
                      <>
                        {/* Event title */}
                        <div className="absolute left-3 top-3">
                          <div 
                            className="text-sm font-black text-white tracking-wide leading-tight"
                            style={{ fontSize: 'clamp(10px, 2.5vw, 14px)' }}
                          >
                            {eventData.title.toUpperCase()}
                          </div>
                        </div>
                        
                        {/* Class theme box */}
                        <div className="absolute left-3 top-8">
                          <div 
                            className="px-2 py-1 rounded text-xs font-bold"
                            style={{
                              backgroundColor: eventData.boxColor || '#dd303e',
                              color: eventData.boxFontColor || '#FFFFFF',
                              fontSize: 'clamp(8px, 1.5vw, 10px)'
                            }}
                          >
                            {eventData.classTheme || "Tema da Aula"}
                          </div>
                        </div>
                        
                        {/* Date and time */}
                        <div className="absolute left-3 bottom-3">
                          <div 
                            className="text-white"
                            style={{ fontSize: 'clamp(8px, 1.5vw, 10px)' }}
                          >
                            {formattedDateTime}
                          </div>
                        </div>
                        
                        {/* Teacher images positioned on the right */}
                        {eventData.teacherImages && eventData.teacherImages.length > 0 && (
                          <div className="absolute right-2 bottom-0 h-3/4 flex items-end">
                            {eventData.teacherImages.map((image, idx) => (
                              <div 
                                key={idx}
                                className="h-full"
                                style={{
                                  marginRight: idx > 0 ? '-5px' : '0',
                                  zIndex: eventData.teacherImages.length - idx,
                                  width: eventData.teacherImages.length === 1 ? '30px' : 
                                         eventData.teacherImages.length === 2 ? '25px' : '20px'
                                }}
                              >
                                <img 
                                  src={image} 
                                  alt={`Professor ${idx + 1}`}
                                  className="h-full w-full object-contain object-bottom"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : formatId === 'stories' ? (
                      // Stories format - vertical layout
                      <>
                        <div className="absolute top-4 left-3 right-3">
                          <div 
                            className="font-bold tracking-wide text-center"
                            style={{ fontSize: 'clamp(10px, 2vw, 12px)' }}
                          >
                            {eventData.title.toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="absolute top-10 left-3">
                          <div 
                            className="px-2 py-1 rounded font-bold"
                            style={{
                              backgroundColor: eventData.boxColor || '#dd303e',
                              color: eventData.boxFontColor || '#FFFFFF',
                              fontSize: 'clamp(8px, 1.5vw, 10px)'
                            }}
                          >
                            {eventData.classTheme || "Tema da Aula"}
                          </div>
                        </div>
                        
                        <div className="absolute bottom-4 left-3">
                          <div 
                            className="text-white"
                            style={{ fontSize: 'clamp(8px, 1.5vw, 10px)' }}
                          >
                            {formattedDateTime}
                          </div>
                        </div>
                        
                        {eventData.teacherImages && eventData.teacherImages.length > 0 && (
                          <div className="absolute right-3 bottom-0 h-1/3 flex items-end">
                            <img 
                              src={eventData.teacherImages[0]} 
                              alt="Professor"
                              className="h-full w-auto object-contain object-bottom"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : formatId === 'bannerGCO' ? (
                      // Banner GCO format - wide horizontal layout
                      <>
                        <div className="absolute left-3 top-1">
                          <div 
                            className="font-bold tracking-wide"
                            style={{ fontSize: 'clamp(8px, 2vw, 11px)' }}
                          >
                            {eventData.title.toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="absolute left-3 top-5">
                          <div 
                            className="px-1 py-0.5 rounded font-bold"
                            style={{
                              backgroundColor: eventData.boxColor || '#dd303e',
                              color: eventData.boxFontColor || '#FFFFFF',
                              fontSize: 'clamp(6px, 1.2vw, 8px)'
                            }}
                          >
                            {eventData.classTheme || "Tema da Aula"}
                          </div>
                        </div>
                        
                        <div className="absolute left-3 bottom-1">
                          <div 
                            className="text-white"
                            style={{ fontSize: 'clamp(6px, 1.2vw, 8px)' }}
                          >
                            {formattedDateTime}
                          </div>
                        </div>
                        
                        {eventData.teacherImages && eventData.teacherImages.length > 0 && (
                          <div className="absolute right-2 bottom-0 h-4/5 flex items-end">
                            <img 
                              src={eventData.teacherImages[0]} 
                              alt="Professor"
                              className="h-full w-auto object-contain object-bottom"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : formatId === 'ledStudio' ? (
                      // LED Studio format - very wide horizontal layout
                      <>
                        <div className="absolute left-2 top-1">
                          <div 
                            className="font-bold tracking-wide"
                            style={{ fontSize: 'clamp(6px, 1.5vw, 9px)' }}
                          >
                            {eventData.title.toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="absolute left-2 top-4">
                          <div 
                            className="px-1 py-0.5 rounded font-bold"
                            style={{
                              backgroundColor: eventData.boxColor || '#dd303e',
                              color: eventData.boxFontColor || '#FFFFFF',
                              fontSize: 'clamp(5px, 1vw, 7px)'
                            }}
                          >
                            {eventData.classTheme || "Tema da Aula"}
                          </div>
                        </div>
                        
                        <div className="absolute right-2 bottom-1">
                          <div 
                            className="text-white"
                            style={{ fontSize: 'clamp(5px, 1vw, 7px)' }}
                          >
                            {formattedDateTime}
                          </div>
                        </div>
                        
                        {eventData.teacherImages && eventData.teacherImages.length > 0 && (
                          <div className="absolute right-8 bottom-0 h-3/4 flex items-end">
                            <img 
                              src={eventData.teacherImages[0]} 
                              alt="Professor"
                              className="h-full w-auto object-contain object-bottom"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      // Other formats - simplified layout (Feed, Highlight)
                      <>
                        <div className="absolute top-2 left-2">
                          <div 
                            className="font-bold tracking-wide"
                            style={{ fontSize: 'clamp(8px, 2vw, 10px)' }}
                          >
                            {eventData.title.toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="absolute top-6 left-2">
                          <div 
                            className="px-1 py-0.5 rounded font-bold"
                            style={{
                              backgroundColor: eventData.boxColor || '#dd303e',
                              color: eventData.boxFontColor || '#FFFFFF',
                              fontSize: 'clamp(6px, 1.5vw, 8px)'
                            }}
                          >
                            {eventData.classTheme || "Tema da Aula"}
                          </div>
                        </div>
                        
                        <div className="absolute bottom-2 left-2">
                          <div 
                            className="text-white"
                            style={{ fontSize: 'clamp(6px, 1.5vw, 8px)' }}
                          >
                            {formattedDateTime}
                          </div>
                        </div>
                        
                        {eventData.teacherImages && eventData.teacherImages.length > 0 && (
                          <div className="absolute right-2 bottom-0 h-2/3 flex items-end">
                            <img 
                              src={eventData.teacherImages[0]} 
                              alt="Professor"
                              className="h-full w-auto object-contain object-bottom"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                  {platform.dimensions}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
