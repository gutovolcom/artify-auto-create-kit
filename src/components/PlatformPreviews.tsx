
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
                  className="bg-gray-100 border rounded-md relative overflow-hidden"
                  style={{
                    aspectRatio:
                      platformId === "instagram" ? "1" : platformId === "youtube" ? "16/9" : "1.91/1",
                  }}
                >
                  {/* Placeholder for the generated image */}
                  {!isFormComplete ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col">
                      <Image className="h-12 w-12 opacity-50 mb-2" />
                      <div className="text-sm font-medium">
                        {platform.dimensions}
                      </div>
                      <div className="text-xs">{platform.aspectRatio}</div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <h4 className="font-bold text-sm mb-1 text-black">
                        {eventData.title}
                      </h4>
                      {eventData.date && (
                        <p className="text-xs text-gray-700 mb-3">
                          {eventData.date} {eventData.time && `• ${eventData.time}`}
                        </p>
                      )}
                      
                      {/* Teacher images */}
                      {eventData.teacherImages.length > 0 && (
                        <div className="flex -space-x-2 mb-3">
                          {eventData.teacherImages.slice(0, 3).map((image, index) => (
                            <Avatar 
                              key={index} 
                              className="border-2 border-white w-10 h-10"
                            >
                              <AvatarImage src={image} alt={`Professor ${index + 1}`} />
                              <AvatarFallback>P{index + 1}</AvatarFallback>
                            </Avatar>
                          ))}
                          {eventData.teacherImages.length > 3 && (
                            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                              +{eventData.teacherImages.length - 3}
                            </div>
                          )}
                        </div>
                      )}
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
