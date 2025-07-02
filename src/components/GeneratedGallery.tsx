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

  // Updated platform mapping to include all new formats
  const platforms = {
    youtube: "YouTube",
    youtube_ao_vivo: "YouTube Ao Vivo",
    youtube_pos_evento: "YouTube Pós Evento", 
    feed: "Feed",
    stories: "Stories", 
    bannerGCO: "Banner GCO",
    destaque: "Destaque",
    ledStudio: "LED Studio",
    LP: "LP",
  };

  // CORRECTED: Using actual platform IDs from platformConfigs
  const displayOrder = [
    'youtube',
    'youtube_ao_vivo', 
    'youtube_pos_evento',
    'feed',
    'stories',
    'LP',
    'destaque',         // Correct: destaque (not highlight)
    'ledStudio',        // Correct: ledStudio (not LED Studio)
    'bannerGCO'
  ];

  // Sort images according to the defined display order
  const sortedImages = [...images].sort((a, b) => {
    const indexA = displayOrder.indexOf(a.platform);
    const indexB = displayOrder.indexOf(b.platform);
    return indexA - indexB;
  });

  const handleDownload = (imageUrl: string, platformName: string, platformId: string) => {
    // Create download link - use classTheme or date as filename base
    const baseFilename = eventData.classTheme || eventData.date || 'Event';
    const sanitizedFilename = baseFilename.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${sanitizedFilename}_${platformId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAspectRatio = (platform: string): string => {
    switch (platform) {
      case "youtube":
      case "youtube_ao_vivo":
      case "youtube_pos_evento":
        return "16/9";
      case "stories":
        return "9/16";
      case "bannerGCO":
        return "4/1"; // Adjusted for new banner dimensions (1920x500)
      case "destaque":
        return "4/3"; // Small format aspect ratio
      case "ledStudio":
        return "4/1";
      case "LP":
        return "1/1"; // Approximately square
      case "feed":
      default:
        return "1/1";
    }
  };

  // After: Only generates selected formats  
  const selectedFormats = eventData.platforms.length > 0 
    ? eventData.platforms 
    : Object.keys(platforms);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-6 p-4">
            {sortedImages.map((generatedImage, index) => {
              const platformName = platforms[generatedImage.platform as keyof typeof platforms] || generatedImage.format;
              const aspectRatio = getAspectRatio(generatedImage.platform);
              
              return (
                <div key={index} className="w-[300px] shrink-0 space-y-3">
                  <div className="overflow-hidden rounded-md border">
                    <div className="relative">
                      {/* Display the generated image directly */}
                      <img 
                        src={generatedImage.url}
                        alt={`${platformName} - ${eventData.classTheme || 'Arte gerada'}`}
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
                      <p className="text-gray-500 text-xs">{eventData.classTheme || 'Arte gerada'}</p>
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
