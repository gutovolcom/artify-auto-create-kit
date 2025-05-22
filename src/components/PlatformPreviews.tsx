
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventData } from "@/pages/Index";
import { Loader2, Image } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  // Platform-specific configurations
  const platforms = {
    youtube: {
      name: "YouTube",
      dimensions: "1280 x 720",
      aspectRatio: "16:9",
    },
    instagram: {
      name: "Instagram",
      dimensions: "1080 x 1080",
      aspectRatio: "1:1",
    },
    linkedin: {
      name: "LinkedIn",
      dimensions: "1200 x 627",
      aspectRatio: "1.91:1",
    },
  };

  // Check if the form is ready to generate images
  const isFormComplete =
    eventData.title &&
    eventData.date &&
    eventData.kvImageId &&
    eventData.platforms.length > 0;

  // Get image URL based on KV image ID
  const getKvImageUrl = () => {
    // In a real app, this would fetch the actual image
    return "/placeholder.svg";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Pré-visualização das Artes</h3>
        <Button
          onClick={onGenerate}
          disabled={!isFormComplete || isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            {!eventData.title && <li>Título do evento</li>}
            {!eventData.date && <li>Data do evento</li>}
            {!eventData.kvImageId && <li>Imagem principal (KV)</li>}
            {eventData.platforms.length === 0 && <li>Pelo menos uma plataforma</li>}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {eventData.platforms.map((platformId) => {
          const platform = platforms[platformId as keyof typeof platforms];
          return (
            <Card key={platformId}>
              <CardHeader>
                <CardTitle className="text-lg">{platform.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="relative overflow-hidden rounded-md"
                  style={{
                    aspectRatio:
                      platformId === "instagram" ? "1" : platformId === "youtube" ? "16/9" : "1.91/1",
                  }}
                >
                  {!isFormComplete ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col bg-gray-100">
                      <Image className="h-12 w-12 opacity-50 mb-2" />
                      <div className="text-sm font-medium">
                        {platform.dimensions}
                      </div>
                      <div className="text-xs">{platform.aspectRatio}</div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-red-600 text-white">
                      {/* High-quality preview layout similar to reference image */}
                      <div className="relative w-full h-full flex flex-col">
                        {/* Logo area */}
                        <div className="absolute top-5 left-5 flex items-center">
                          <div className="w-12 h-12 rounded-md bg-blue-500 mr-2 flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full bg-yellow-400 relative">
                              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-700 rounded-full"></div>
                            </div>
                          </div>
                          <div className="text-3xl font-bold tracking-wide">
                            {eventData.title.toUpperCase()}
                          </div>
                        </div>
                        
                        {/* Course topic */}
                        <div className="absolute top-1/3 left-5 transform -translate-y-1/2">
                          <div className="text-xl font-bold mb-1">
                            EM FOCO: {eventData.subtitle || "Tema da Aula"}
                          </div>
                          <div className="text-xl">
                            {eventData.date} {eventData.time && `- ${eventData.time}`}
                          </div>
                          
                          {/* Teacher name */}
                          {eventData.teacherImages.length > 0 && (
                            <div className="text-xl mt-1">
                              {eventData.teacherImages.length === 1 ? "Professor" : "Professores"}: 
                              {eventData.teacherImages.map((_, index) => 
                                ` Nome do Professor ${index + 1}`
                              ).join(", ")}
                            </div>
                          )}
                        </div>
                        
                        {/* Company logo at bottom */}
                        <div className="absolute bottom-5 left-5">
                          <div className="text-3xl font-bold tracking-wide">LOGO</div>
                        </div>
                        
                        {/* Teacher image */}
                        {eventData.teacherImages.length > 0 && (
                          <div className="absolute right-0 bottom-0 h-full w-2/5 flex items-end">
                            <div className="relative w-full h-4/5">
                              {eventData.teacherImages.map((image, idx) => (
                                <div 
                                  key={idx}
                                  className="absolute bottom-0 right-0 h-full w-full"
                                  style={{
                                    right: `${idx * 20}px`,
                                    zIndex: eventData.teacherImages.length - idx
                                  }}
                                >
                                  <img 
                                    src={image} 
                                    alt={`Professor ${idx + 1}`}
                                    className="h-full w-auto object-contain object-bottom"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
