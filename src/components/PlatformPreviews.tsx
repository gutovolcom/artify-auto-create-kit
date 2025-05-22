
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventData } from "@/pages/Index";
import { Loader2 } from "lucide-react";

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
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50 mb-2"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <div className="text-sm font-medium">
                      {platform.dimensions}
                    </div>
                    <div className="text-xs">{platform.aspectRatio}</div>
                  </div>

                  {/* Preview content - this would be replaced with actual content */}
                  {isFormComplete && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <h4 className="font-bold text-sm mb-1 text-black">
                        {eventData.title}
                      </h4>
                      {eventData.date && (
                        <p className="text-xs text-gray-700">
                          {eventData.date} {eventData.time && `• ${eventData.time}`}
                        </p>
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
