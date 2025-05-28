
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, Image } from "lucide-react";

interface GeneratedImage {
  platform: string;
  format: string;
  url: string;
  bgImageUrl?: string;
}

interface GeneratedGalleryProps {
  images: GeneratedImage[];
  eventData: any;
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
    feed: "Feed",
    stories: "Stories", 
    bannerGCO: "Banner GCO",
    ledStudio: "LED Studio",
    LP: "LP",
  };

  const handleDownload = (imageUrl: string, platformName: string, platformId: string) => {
    // Create download link
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${eventData.title}_${platformId}.png`;
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
            {images.map((generatedImage, index) => {
              const platformName = platforms[generatedImage.platform as keyof typeof platforms] || generatedImage.format;
              
              // Define aspect ratio based on platform
              let aspectRatio = "1";
              if (generatedImage.platform === "youtube") aspectRatio = "16/9";
              else if (generatedImage.platform === "stories") aspectRatio = "9/16";
              else if (generatedImage.platform === "bannerGCO") aspectRatio = "4/3";
              else if (generatedImage.platform === "ledStudio") aspectRatio = "4/1";
              
              return (
                <div key={index} className="w-[300px] shrink-0 space-y-3">
                  <div className="overflow-hidden rounded-md border">
                    <div className="relative">
                      {/* Display the generated image directly */}
                      <img 
                        src={generatedImage.url}
                        alt={`${platformName} - ${eventData.title}`}
                        className="w-full h-auto object-cover"
                        style={{
                          aspectRatio: aspectRatio
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
                      onClick={() => handleDownload(generatedImage.url, platformName, generatedImage.platform)}
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
