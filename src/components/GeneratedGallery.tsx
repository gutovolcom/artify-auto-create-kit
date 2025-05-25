
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, Image } from "lucide-react";
import { EventData } from "@/pages/Index";

interface GeneratedGalleryProps {
  images: string[];
  eventData: EventData;
}

export const GeneratedGallery = ({ images, eventData }: GeneratedGalleryProps) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-gray-100 p-6 mb-4">
          <Image
            className="h-9 w-9 text-gray-500"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhuma imagem gerada</h3>
        <p className="text-gray-500 max-w-md">
          Vá para a aba "Pré-visualização" e clique em "Gerar Pré-visualizações" para criar suas artes.
        </p>
      </div>
    );
  }

  const platforms = {
    youtube: "YouTube",
    instagram: "Instagram",
    linkedin: "LinkedIn",
  };

  const handleDownload = (imageUrl: string, platformName: string, index: number) => {
    // Create download link
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${eventData.title}_${platformName}_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Artes Geradas</h3>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-6 p-4">
            {images.map((imageUrl, index) => {
              const platformId = eventData.platforms[index % eventData.platforms.length];
              const platformName = platforms[platformId as keyof typeof platforms];
              
              return (
                <div key={index} className="w-[300px] shrink-0 space-y-3">
                  <div className="overflow-hidden rounded-md border">
                    <div className="relative">
                      {/* Display the generated image directly */}
                      <img 
                        src={imageUrl}
                        alt={`${platformName} - ${eventData.title}`}
                        className="w-full h-auto object-cover"
                        style={{
                          aspectRatio: platformId === "instagram" ? "1" : 
                                      platformId === "youtube" ? "16/9" : "1.91/1"
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <p className="font-medium">{platformName}</p>
                      <p className="text-gray-500 text-xs">{eventData.title}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDownload(imageUrl, platformName, index)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
